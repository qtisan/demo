/**
 * Created by lennon on 2017/6/15.
 */
const Mock = require('mockjs');
const moment = require('moment');

const { SiteList, sites } = require('./site_list');

// TODO: fetch data from weatherdt.com apis

const weather_site_list = Mock.mock({
	'site_list|726': [{
		'site_id': /10[0-9]{7}/,
		'forecast|240': [{
			'time': '',
			'temp': /[1-2]{0,1}[1-9]/,
			'humid': /[8-9][0-9]/
		}]
	}],
	'count': 726
});

weather_site_list.site_list.forEach((site, index) => {
	let current = moment();
	site.site_id = sites[index];
	site.forecast.forEach((weather) => {
		weather.time = current.add(1, 'hour').format('YYYYMMDDHH')+'0000';
	});
});

module.exports = weather_site_list;
