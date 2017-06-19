
const {trigger, logger, noop} = require('../../../utils');

const { Site, SiteWetness, SiteInfect, SitePeriod } = require('./site');
const { SiteList, SiteWetnessList, SiteInfectList } = require('./site_list');
const Growth = require('./growth');
const Solution = require('./solution');
const { handleProcessPool } = require('./process_pool');

function handleCompute (
	{ siteWetnessList, siteInfectList },
	{ solutionCollection, growthCollection },
	{
		onStart = noop,
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

		onDayStart = noop,
		onDayEnd = noop,

		onEnd = noop
	},
	{ processPool }) {

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

  return (siteWeatherList) => {
    trigger(onStart, { siteWetnessList, siteInfectList },
	    { solutionCollection, growthCollection });

		// 循环调度
	  siteWeatherList.forEach((site, index) => {
		  processPool.dispatch({ site }, index);
	  });

    trigger(onEnd, { siteWetnessList, siteInfectList },
	    { solutionCollection, growthCollection });
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
	return ({ site }) => {

		let siteId = site.site_id;
		let forecast = site.forecast;
		let siteWetness = siteWetnessList.getSite(siteId);

		siteWetness.updateSolution(getSolution); // 更新侵染方案

		trigger(onSingleSiteComputeStart, { siteWeather: site, siteWetness });
		forecast.forEach(weather1Hour => {

			// TODO: change to date updated.
			siteInfectList.refreshCurrentTime(weather1Hour.time); // 更新侵染列表的当前日期
			siteWetness.updateGrowth(getGrowth, weather1Hour.time); // 更新生育期数据

			const siteInfect = siteWetness.update(weather1Hour); // 更新湿润期侵染数据
			siteInfectList.updateSite(siteInfect); // 更新侵染站点列表

			// TODO: continue to compute.
		});
		trigger(onSingleSiteComputeEnd, { siteWeather: site, siteWetness });

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
