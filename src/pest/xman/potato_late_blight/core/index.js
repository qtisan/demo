
const {trigger, XPLBLogger: logger, noop} = require('../../../utils');

const { Site, SiteWetness, SiteInfect, SitePeriod } = require('./site');
const { SiteList, SiteWetnessList, SiteInfectList } = require('./site_list');
const Growth = require('./growth');
const Solution = require('./solution');
const { handleProcessPool } = require('./processes');

function handleCompute (
	{ siteWetnessList, siteInfectList, completedSiteWetnessList, currentSiteWetnessList },
	{ solutionCollection, growthCollection },
	{
		onStart = noop,

		onProcessChildError = noop,
		onProcessChildReady = noop,
		onProcessChildReport = noop,
		onProcessBatchStart = noop,
		onProcessBatchFinish = noop,
		onProcessSingleStart = noop,
		onProcessSingleFinish = noop,

		onEnd = noop
	},
	{ processPool }) {


	processPool.on('childError', onProcessChildError);
	processPool.on('childReady', onProcessChildReady);
	processPool.on('childReport', onProcessChildReport);
	processPool.on('batchStart', onProcessBatchStart);
	processPool.on('batchFinish', onProcessBatchFinish);
	processPool.on('singleStart', onProcessSingleStart);
	processPool.on('singleFinish', onProcessSingleFinish);

  return (siteWeatherList) => {

		// 创建批量进程消息任务
	  let batchId = `batch-infect-computation-${new Date().getTime()}`;
	  processPool.on('batchStart', ({ initialData, batch }) => {
		  batch.id == batchId && trigger(onStart, Object.assign(initialData, {siteWeatherList}));
	  });
	  processPool.on('batchFinish', ({ result, batch }) => {
		  // 汇聚多个子进程的结果数据
		  const resultSiteInfectList = new SiteInfectList();
		  const resultCompletedSiteWetnessList = new SiteWetnessList();
		  const resultCurrentSiteWetnessList = new SiteWetnessList();
		  result.forEach(r => {
			  logger.info(`converging the result of pid: ${r.pid}...`);
			  resultSiteInfectList.combine(r.data.siteInfectList);
			  resultCompletedSiteWetnessList.combine(r.data.completedSiteWetnessList);
			  resultCurrentSiteWetnessList.combine(r.data.currentSiteWetnessList);
		  });
		  batch.id == batchId && trigger(onEnd, {
			  resultSiteInfectList, resultCompletedSiteWetnessList,
			  resultCurrentSiteWetnessList});
	  });
	  processPool.createBatch(siteWeatherList, { // 创建批处理程序，传入初始化数据
		  siteWetnessListData: siteWetnessList.serialize(),
		  siteInfectListData: siteInfectList.serialize(),
		  completedSiteWetnessListData: completedSiteWetnessList.serialize(),
		  currentSiteWetnessListData: currentSiteWetnessList.serialize(),
		  solutionCollection, growthCollection
	  }, batchId);
	  processPool.isFree() && processPool.runBatch();

  }
}

function handleGetSolution (solutionCollection) {
	return (siteId) => {
		// TODO: should be implement
		return solutionCollection[0];
		// return solutionCollection.find(solution => solution.site_id == siteId);
	};
}

function handleGetGrowth (growthCollection) {
	return (siteId, time) => {
		// TODO: should be implement
		return growthCollection[[Math.random().toFixed()]];
		// return growthCollection.find(growth => growth.site_id == siteId);
	};
}
let n = 0;
function handleSingleCompute (
	{	siteWetnessList, siteInfectList, completedSiteWetnessList, currentSiteWetnessList },
	{ getSolution, getGrowth },
	{ onSingleSiteComputeStart,	onSingleSiteComputeEnd }) {
	
	return ({ site }, callback) => {

		let siteId = site.site_id;
		let forecast = site.forecast;
		let siteWetness = siteWetnessList.getSite(siteId);

		siteWetness.updateSolution(getSolution); // 更新侵染方案
		trigger(onSingleSiteComputeStart, { siteWeather: site, siteWetness });

		forecast.forEach((weather1Hour, index) => {
			
			siteWetness.updateGrowth(getGrowth, weather1Hour.time); // 更新生育期数据
			const siteInfect = siteWetness.update(weather1Hour, (completedSiteWetness) => {
				// dropped to history.
				index == 0 && completedSiteWetness && completedSiteWetnessList.add(completedSiteWetness);
			}); // 更新湿润期侵染数据
			siteInfectList.updateSite(siteInfect); // 更新侵染站点列表
			if (index == 0) {
				currentSiteWetnessList.add(siteWetness);
			}

			// TODO: continue to compute.

		});
		callback.call(process, { siteWetness, siteInfectList });
		trigger(onSingleSiteComputeEnd, { siteWeather: site, siteWetness, siteInfectList });

	};
}

function singleInitializeAndGenerateCompute(initialData, memo, {
	onSingleSiteComputeStart = noop, onSingleSiteComputeEnd = noop,
	onInfectComputeStart = noop, onInfectSolutionNotExist = noop,
	onInfectTempAvgMatched = noop, onInfectSuccess = noop,
	onInfectTempAvgNotMatched = noop, onInfectComputeEnd = noop,
	onWetnessComputeStart = noop, onWetnessComputeInterrupt = noop,
	onWetnessComputeNotInterrupt = noop, onInfectNotInGrowth = noop
}) {
	// 准备资源数据装入内存对象
	logger.info(`-- batch[${initialData.batchId}] initialize with cache data...`);
	let solutionCollection = initialData.solutionCollection.map(sc => new Solution(sc));
	let growthCollection = initialData.growthCollection.map(gc => new Growth(gc));
	memo.siteWetnessList = SiteWetnessList.fromData(initialData.siteWetnessListData);
	memo.siteInfectList = SiteInfectList.fromData(initialData.siteInfectListData);
	memo.completedSiteWetnessList = SiteWetnessList.fromData(initialData.completedSiteWetnessListData);
	memo.currentSiteWetnessList = SiteWetnessList.fromData(initialData.currentSiteWetnessListData);
	// 挂载侵染方案计算事件
	solutionCollection.forEach(solution => {
		solution.on('infect.computeStart', onInfectComputeStart);
		solution.on('infect.solutionNotExist', onInfectSolutionNotExist);
		solution.on('infect.tempAvgMatched', onInfectTempAvgMatched);
		solution.on('infect.success', onInfectSuccess);
		solution.on('infect.tempAvgNotMatched', onInfectTempAvgNotMatched);
		solution.on('infect.computeEnd', onInfectComputeEnd);
	});
	// 挂载湿润期计算事件
	memo.siteWetnessList.forEach(siteWetness => {
		siteWetness.on('wetness.computeStart', onWetnessComputeStart);
		siteWetness.on('wetness.computeInterrupt', onWetnessComputeInterrupt);
		siteWetness.on('wetness.computeNotInterrupt', onWetnessComputeNotInterrupt);
		siteWetness.on('infect.notInGrowth', onInfectNotInGrowth);
	});
	const getSolution = handleGetSolution(solutionCollection);
	const getGrowth = handleGetGrowth(growthCollection);
	return handleSingleCompute(memo,
		{ getSolution, getGrowth },
	  { onSingleSiteComputeStart, onSingleSiteComputeEnd });
}

function handleProcessCommand(memo, hooks) {
	let singleCompute = () => logger.warn(`single compute function not generated.`);
	return function ({command, message}) {
		switch (command) {

			case 'execute':
				singleCompute.apply(this, [{site: message}, data => {
					this.send({status: 'finish', data});
				}]);
				break;

			case 'initial':
				singleCompute = singleInitializeAndGenerateCompute(message, memo, hooks);
				this.send({status: 'ready', data: message});
				break;

			case 'converge':
				this.send({status: 'report', data: memo});

				break;
			default:
				break;
		}
	}
}


module.exports = {
	handleCompute, handleSingleCompute,
	handleGetSolution, handleGetGrowth,
	handleProcessCommand,
	Site, SiteWetness, SiteInfect, SitePeriod,
	SiteList, SiteWetnessList, SiteInfectList,
	Growth, Solution,
	handleProcessPool
};
