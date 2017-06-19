
const { logger } = require('../../utils');
const fs = require('fs');
const path = require('path');

const PotatoLateBlightCore = require('./core');

// 准备数据装入内存
const {
	siteList, siteWeatherList, siteWetnessList, siteInfectList,
	solutionCollection, growthCollection
} = require('./data');

logger.start('prepare-compute-function');
const compute = PotatoLateBlightCore.handleCompute(
  { siteWetnessList, siteInfectList },
	{ solutionCollection, growthCollection }, {
    // TODO: synchronize with redis & save to mysql
    onStart: ({ siteWetnessList, siteInfectList },
	    { solutionCollection, growthCollection }) => {
	    logger.start('compute-sites-in-future-240-hours', 'compute started...');
    },
		onSingleSiteComputeStart: ({ siteWeather }) => {
			logger.start(`site-${siteWeather.site_id}-compute`, false);
		},
		onSingleSiteComputeEnd: ({ siteWeather }) => {
			logger.end(`site-${siteWeather.site_id}-compute`);
		},
    onEnd: ({ siteWetnessList, siteInfectList },
	    { solutionCollection, growthCollection }) => {
	    logger.end('compute-sites-in-future-240-hours', 'compute finished.');

	    logger.info('saving the test result...');
	    let wetnessFile = path.join(__dirname, '../../test/sites_wetness.json'),
		      infectFile = path.join(__dirname, '../../test/sites_infect.json');
	    siteWetnessList.saveToFile(wetnessFile);
	    siteInfectList.saveToFile(infectFile);
	    logger.info(`test file is saved to ${wetnessFile} & ${infectFile}.`);
    }
  });
logger.end('prepare-compute-function');

console.log(`starting ${siteWeatherList.length} sites 240 hours in future computation...`);
compute(siteWeatherList);

