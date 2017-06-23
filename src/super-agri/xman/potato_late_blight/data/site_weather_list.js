
const Random = require('mockjs').Random;
const { XPLBLogger: logger, timer } = require('../../../utils');

const siteList = require('./site_list');

const getSiteWeatherList = () => {

	logger.start('generate-726-sites-weather-data');

	// TODO: fetch data in database or cache from weatherdt.com apis
	// =================================================================
	const list = siteList.map(site => {
		let s = {
			site_id: site.id,
			site_name: site.name,
			forecast: []
		};
		let dayCount = 241;
		while (dayCount--) {
			s.forecast.push({
				time: timer.later(240-dayCount),
				temp: Random.float(-10, 37, 1, 1),
				humid: Random.integer(60, 100)
			});
		}
		return s;
	});
	// =================================================================

	logger.end('generate-726-sites-weather-data');
	return list;
};

module.exports = getSiteWeatherList;
