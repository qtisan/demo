
const Random = require('mockjs').Random;
const moment = require('moment');
const count = 726;
const { SiteList, sites } = require('./site_list');
const { SiteWetness } = require('./site_objects');

class SiteWetnessList extends SiteList {

	constructor () {
		super();
	}

	// TODO: add wetness list features.
}

// TODO: fetch from redis or get data from mysql and recompute;

const siteWetnessList = new SiteWetnessList();
let index = count;
while(index--) {
  let site = {
    site_id: sites[index],
    continuous: Random.string('01', 100) + '000',
    humid_array: [],
    temp_avg: Random.integer(7, 36),
    start_time: '',
    end_time: '',
    last_time: 0
  };
  site.continuous = site.continuous.split(/0{5,}/)[0] || site.continuous.split(/0{5,}/)[1];
  let length = site.continuous.length;
  for(let i = 0; i < length; i++) {
    if (site.continuous[i] == '0') {
      site.humid_array.push(Random.integer(79, 89));
    }
    else {
      site.humid_array.push(Random.integer(90, 99));
    }
  }
  site.start_time = moment().subtract(length-1, 'hour').format('YYYYMMDDHH0000');
  site.last_time = length;
	siteWetnessList.add(new SiteWetness(site));
}

module.exports = siteWetnessList;
