

const { logger } = require('../../utils');
const fs = require('fs');
const path = require('path');

const {
	handleCompute, handleSingleCompute,
	handleGetSolution, handleGetGrowth,
	Site, SiteWetness, SiteInfect, SitePeriod,
	SiteList, SiteWetnessList, SiteInfectList,
	Growth, Solution,
	handleProcessPool
} = require('./core');

const hooks = require('./hooks');

// 创建进程池，运行子进程
const createProcessPool = handleProcessPool(`${__dirname}/single_compute.js`);
const processPool = createProcessPool();

logger.info(`start ${processPool.count()} processes to compute.`);

// 准备数据装入内存
const {
	siteList, siteWeatherList, siteWetnessList, siteInfectList,
	solutionCollection, growthCollection
} = require('./data');



logger.start('prepare-compute-function');

const compute = handleCompute(
  { siteWetnessList, siteInfectList },
	{ solutionCollection, growthCollection }, hooks,
	{ processPool });

logger.end('prepare-compute-function');

console.log(`starting ${siteWeatherList.length} sites 240 hours in future computation...`);
compute(siteWeatherList);

