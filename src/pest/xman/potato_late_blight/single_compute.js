/**
 * Created by qtisa on 2017/6/19.
 */

const { trigger, noop } = require('../../utils');

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
} = require('./hooks');

// 准备资源数据装入内存
const {
	siteList, siteWeatherList, siteWetnessList, siteInfectList,
	solutionCollection, growthCollection
} = require('./data');

const getSolution = handleGetSolution(solutionCollection);
const getGrowth = handleGetGrowth(growthCollection);

const singleCompute = handleSingleCompute({
	siteWetnessList, siteInfectList,
	getSolution, getGrowth,
	onSingleSiteComputeStart,
	onSingleSiteComputeEnd
});


process.on('message', singleCompute);

