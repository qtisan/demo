/**
 * Created by qtisa on 2017/6/18.
 */

const { logger } = require('../../../utils');

logger.start('prepare-data-to-memory');

const siteList = require('./site_list');

const siteWeatherList = require('./site_weather_list')();

const siteWetnessList = require('./site_wetness_list')();
const siteInfectList = require('./site_infect_list')();

const solutionCollection = require('./solution_collection')();
const growthCollection = require('./growth_collection')();

logger.end('prepare-data-to-memory');
// TODO: need to support static data refreshing.
// TODO: need to support dynamic data saving.

module.exports = {
	siteList, siteWeatherList, siteWetnessList, siteInfectList,
	solutionCollection, growthCollection
};
