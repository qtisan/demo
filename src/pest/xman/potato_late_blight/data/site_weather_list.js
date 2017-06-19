
const Random = require('mockjs').Random;
const { logger, timer } = require('../../../utils');

const siteList = require('./site_list');

let count = 726;
const getSiteWeatherList = () => {

	logger.start('generate-726-sites-weather-data');

	// TODO: fetch data in database or cache from weatherdt.com apis
	// =================================================================
	let list = [];
	while (count--) {
		let site = {
			site_id: siteList[count].id,
			forecast: []
		};
		let dayCount = 241;
		while (dayCount--) {
			site.forecast.push({
				time: timer.later(240-dayCount),
				temp: Random.float(-10, 37, 1, 1),
				humid: Random.integer(80, 100)
			});
		}
		list.push(site);
	}
	// =================================================================

	logger.end('generate-726-sites-weather-data');
	return list;
};

module.exports = getSiteWeatherList;
