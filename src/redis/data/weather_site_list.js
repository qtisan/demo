/**
 * Created by lennon on 2017/6/15.
 */
const Mock = require('mockjs');
const moment = require('moment');

// TODO: fetch data from weatherdt.com apis

const weather_site_list = Mock.mock({
	'site_list|0-700': [{
		'site_id': /10[0-9]{7}/,
		'forecast|240': [{
			'time': '',
			'temp': /[1-2]{0,1}[1-9]/,
			'humid': /[8-9][0-9]/
		}]
	}]
});

weather_site_list.site_list.forEach((site) => {
	let current = moment();
	site.forecast.forEach((weather) => {
		weather.time = current.add(1, 'hour').format('YYYYMMDDHH')+'0000';
	});
});

// console.log(weather_site_list.site_list[1]);

module.exports = weather_site_list;
