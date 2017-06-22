
const Random = require('mockjs').Random;
const moment = require('moment');
const { XPLBLogger: logger, timer } = require('../../../utils');

const { SiteInfect, SiteInfectList } = require('../core');

const siteList = require('./site_list');
const count = Random.integer(1, 726);


const getSiteInfectList = () => {

	logger.start('generate-726-sites-infect-data', false);

	// TODO: fetch from redis or get data from database and recompute;
	// =============================================================
	const collection = [];

	// =============================================================

	logger.end('generate-726-sites-infect-data');
	return SiteInfectList.fromData(collection);
};

module.exports = getSiteInfectList;
