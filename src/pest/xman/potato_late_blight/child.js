/**
 * Created by qtisa on 2017/6/19.
 */

const { trigger, noop, logger } = require('../../utils');

// 准备核心功能方法
const {
	handleCompute, handleSingleCompute,
	handleGetSolution, handleGetGrowth,
	Site, SiteWetness, SiteInfect, SitePeriod,
	SiteList, SiteWetnessList, SiteInfectList,
	Growth, Solution,
	handleProcessPool
} = require('./core');

// 准备回调钩子
const {
	onSingleSiteComputeStart = noop,
	onSingleSiteComputeEnd = noop,

	onWetnessComputeStart = noop,
	onWetnessComputeInterrupt = noop,
	onWetnessComputeNotInterrupt = noop,
	onInfectNotInGrowth = noop,

	onInfectComputeStart = noop,
	onInfectSolutionNotExist = noop,
	onInfectTempAvgMatched = noop,
	onInfectSuccess = noop,
	onInfectTempAvgNotMatched = noop,
	onInfectComputeEnd = noop,
} = require('./hooks');

let singleCompute = () => {};

logger.info(`* process[pid:${process.pid}] forked..`);

process.on('message', function ({command, message}) {
	switch (command) {
		case 'execute':
			singleCompute.apply(this, [{site: message}, data => {
				this.send({status: 'finish', data});
			}]);
			break;
		case 'initial':
			// 准备资源数据装入内存
			logger.info(`-- process[${this.pid}] in initialize with cache data...`);
			let [siteWetnessList, siteInfectList,
				solutionCollection, growthCollection
			] = [message.siteWetnessList, message.siteInfectList,
				message.solutionCollection, message.growthCollection
			];
			solutionCollection = solutionCollection.map(sc => new Solution(sc));
			growthCollection = growthCollection.map(gc => new Growth(gc));
			siteWetnessList = SiteWetnessList.fromData(siteWetnessList);
			siteInfectList = SiteInfectList.fromData(siteInfectList);
			const getSolution = handleGetSolution(solutionCollection);
			const getGrowth = handleGetGrowth(growthCollection);
			
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
			siteWetnessList.forEach(siteWetness => {
				siteWetness.on('wetness.computeStart', onWetnessComputeStart);
				siteWetness.on('wetness.computeInterrupt', onWetnessComputeInterrupt);
				siteWetness.on('wetness.computeNotInterrupt', onWetnessComputeNotInterrupt);
				siteWetness.on('infect.notInGrowth', onInfectNotInGrowth);
			});

			singleCompute = handleSingleCompute({
				siteWetnessList, siteInfectList,
				getSolution, getGrowth,
				onSingleSiteComputeStart,
				onSingleSiteComputeEnd
			});
			this.send({status: 'ready', data: message});
			break;
		default:
			break;
	}
});

