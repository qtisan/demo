
const Random = require('mockjs').Random;
const moment = require('moment');
const count = 726;

// TODO: fetch from redis or get data from mysql and recompute;

const SITE_WETNESS_LIST = {
  count: count,
  sites: []
};
let index = count;
while(index--) {
  let site = {
    site_id: '10' + Random.integer(1000000, 9999999),
    continous: Random.string('01', 100) + '000',
    humid_array: [],
    temp_avg: Random.integer(7, 36),
    start_time: '',
    end_time: '',
    last_time: 0
  };
  site.continous = site.continous.split('000')[0] || site.continous.split('000')[1];
  let length = site.continous.length;
  for(let i = 0; i < length; i++) {
    if (site.continous[i] == '0') {
      site.humid.push(Random.integer(79, 89));
    }
    else {
      site.humid.push(Random.integer(90, 99));
    }
  }
  site.start_time = moment().subtract(length-1, 'hour').format('YYYYMMDDHH0000');
  site.last = length;
  SITE_WETNESS_LIST.sites.push(site);
}

module.exports = SITE_WETNESS_LIST;
