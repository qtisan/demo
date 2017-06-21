
const {trigger, logger, noop} = require('../../../utils');

const { Site, SiteWetness, SiteInfect, SitePeriod } = require('./site');
const { SiteList, SiteWetnessList, SiteInfectList } = require('./site_list');
const Growth = require('./growth');
const Solution = require('./solution');
const { handleProcessPool } = require('./processes');

function handleCompute (
	{ siteWetnessList, siteInfectList },
	{ solutionCollection, growthCollection },
	{
		onStart = noop,

		onProcessChildError = noop,
		onProcessChildReady = noop,
		onProcessStartBatch = noop,
		onProcessFinishBatch = noop,
		onProcessStartSingle = noop,
		onProcessFinishSingle = noop,

		onEnd = noop
	},
	{ processPool }) {


	processPool.on('errorChild', onProcessChildError);
	processPool.on('readyChild', onProcessChildReady);
	processPool.on('startBatch', onProcessStartBatch);
	processPool.on('finishBatch', onProcessFinishBatch);
	processPool.on('startSingle', onProcessStartSingle);
	processPool.on('finishSingle', onProcessFinishSingle);

  return (siteWeatherList) => {

		// 创建批量进程消息任务
	  let batchId = `infect-computation-${new Date().getTime()}`;
	  processPool.on('startBatch', (batch) => {
		  batch.id == batchId && trigger(onStart, { siteWetnessList, siteInfectList },
			  { solutionCollection, growthCollection });
	  });
	  processPool.on('finishBatch', (batch) => {
		  batch.id == batchId && trigger(onEnd, { siteWetnessList, siteInfectList },
			  { solutionCollection, growthCollection });
	  });
	  processPool.createBatch(siteWeatherList, {
		  siteWetnessList: siteWetnessList.serialize(),
		  siteInfectList: siteInfectList.serialize(),
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

function handleSingleCompute ({
	siteWetnessList, siteInfectList,
	getSolution, getGrowth,
	onSingleSiteComputeStart,
	onSingleSiteComputeEnd
}) {
	return ({ site }, callback) => {

		let siteId = site.site_id;
		let forecast = site.forecast;
		let siteWetness = siteWetnessList.getSite(siteId);

		siteWetness.updateSolution(getSolution); // 更新侵染方案

		trigger(onSingleSiteComputeStart, { siteWeather: site, siteWetness });
		forecast.forEach(weather1Hour => {

			siteInfectList.refreshCurrentTime(weather1Hour.time); // 更新侵染列表的当前日期
			siteWetness.updateGrowth(getGrowth, weather1Hour.time); // 更新生育期数据
			const siteInfect = siteWetness.update(weather1Hour, (siteWetness) => {
				// dropped to history.
			}); // 更新湿润期侵染数据
			siteInfectList.updateSite(siteInfect); // 更新侵染站点列表

			// TODO: continue to compute.

		});
		callback.call(process, { siteWetness, siteInfectList });

		trigger(onSingleSiteComputeEnd, { siteWeather: site, siteWetness, siteInfectList });

	};
}


module.exports = {
	handleCompute, handleSingleCompute,
	handleGetSolution, handleGetGrowth,
	Site, SiteWetness, SiteInfect, SitePeriod,
	SiteList, SiteWetnessList, SiteInfectList,
	Growth, Solution,
	handleProcessPool
};
