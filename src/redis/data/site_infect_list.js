
const Random = require('mockjs').Random;
const moment = require('moment');
const { SiteList, sites } = require('./site_list');

const count = Random.integer(1, 726);

class SiteInfectList extends SiteList{

	constructor () {
		super();
	}
	
	// TODO: add infect list features.
}

// TODO: fetch from redis or get data from mysql and recompute;

const siteInfectList = new SiteInfectList();

module.exports = siteInfectList;
