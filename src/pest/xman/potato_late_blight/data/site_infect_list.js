
const Random = require('mockjs').Random;
const moment = require('moment');
const { logger, timer } = require('../../../utils');

const { SiteInfect, SiteInfectList } = require('../core');

const siteList = require('./site_list');
const count = Random.integer(1, 726);


const getSiteInfectList = () => {

	logger.start('generate-726-sites-infect-data');

	// TODO: fetch from redis or get data from mysql and recompute;
	// =============================================================
	const siteInfectList = new SiteInfectList();

	// =============================================================

	logger.end('generate-726-sites-infect-data');
	return siteInfectList;
};

module.exports = getSiteInfectList;
