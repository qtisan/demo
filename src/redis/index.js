
const logger = require('./utils').logger;

const weatherSiteList = require('./data/weather_site_list');
const PotatoLateBlightCore = require('./xman/potato_late_blight/core');

const siteWetnessList = require('./data/site_wetness_list');
const siteInfectList = require('./data/site_infect_list');
const siteOccurList = require('./data/site_occur_list');

const compute = PotatoLateBlightCore.handleCompute(
  { siteWetnessList, siteInfectList, siteOccurList }, {
    // TODO: synchronize with redis & save to mysql
    onStart: () => { logger.info('compute started.') },
    onEnd: () => { logger.info('compute finished.') }
  });
console.log(`starting ${weatherSiteList.count()} sites 240 hours in future computation...`);

logger.start('compute-sites-in-future-240-hours');

compute(weatherSiteList);

logger.end('compute-sites-in-future-240-hours');
