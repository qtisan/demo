
const { XPLBLogger: logger, readFileSync } = require('../../../utils');
const cache = require('../config').get('cache');

const { SiteInfectList } = require('../core');



const getSiteInfectList = () => {

	logger.start('read-sites-infect-data-from-cache');

	// TODO: fetch from redis or get data from database and recompute;
	// =============================================================
	let collection;
	try {
		collection = readFileSync(cache.site_infect_result_current).sites;
	}
	catch (e) {
		collection = [];
		logger.warn(`cannot read the current infect result file from \`${cache.site_infect_result_current}\`. use empty instead.`);
	}
	// =============================================================

	logger.end('read-sites-infect-data-from-cache');
	return SiteInfectList.fromData(collection);
};

module.exports = getSiteInfectList;
