
const { logger } = require('./utils');
const fs = require('fs');
const path = require('path');

const weatherSiteList = require('./data/weather_site_list');
const PotatoLateBlightCore = require('./xman/potato_late_blight/core');

const siteWetnessList = require('./data/site_wetness_list');
const siteInfectList = require('./data/site_infect_list');
const siteOccurList = require('./data/site_occur_list');

const compute = PotatoLateBlightCore.handleCompute(
  { siteWetnessList, siteInfectList, siteOccurList }, {
    // TODO: synchronize with redis & save to mysql
    onStart: (siteWetnessList, siteInfectList, siteOccurList) => {
	    logger.info('compute started.');
	    logger.start('compute-sites-in-future-240-hours');
    },
    onEnd: (siteWetnessList, siteInfectList, siteOccurList) => {
	    logger.info('compute finished.');
	    logger.end('compute-sites-in-future-240-hours');
	    let testFile = path.join(__dirname, './test/test.json');
	    fs.writeFileSync(testFile, JSON.stringify(siteWetnessList));
	    logger.info(`test file is saved to ${testFile}.`);
    }
  });
console.log(`starting ${weatherSiteList.count} sites 240 hours in future computation...`);


compute(weatherSiteList);

