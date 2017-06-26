
const { XPLBLogger: logger } = require('../../utils');
const fs = require('fs');
const path = require('path');

const {
	SiteWetnessList,
	handleCompute,
	handleProcessPool
} = require('./core');

const hooks = require('./hooks');

// 创建进程池，运行子进程
const createProcessPool = handleProcessPool(`${__dirname}/child.js`);
const processPool = createProcessPool();

logger.info(`start ${processPool.count()} processes to compute.`);

// 准备数据装入内存
const {
	siteWeatherList, siteWetnessList, siteInfectList,
	solutionCollection, growthCollection
} = require('./data');

const completedSiteWetnessList = new SiteWetnessList();
const currentSiteWetnessList = new SiteWetnessList();


const compute = handleCompute(
  { siteWetnessList, siteInfectList, completedSiteWetnessList, currentSiteWetnessList },
	{ solutionCollection, growthCollection }, hooks,
	{ processPool });

logger.info(`starting ${siteWeatherList.length} sites 240 hours in future computation...`);
compute(siteWeatherList);

