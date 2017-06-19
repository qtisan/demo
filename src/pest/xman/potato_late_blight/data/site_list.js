
const Random = require('mockjs').Random;
const { logger } = require('../../../utils');
let count = 726;

// TODO: get the site id list from database or files with growth computation.
const getSiteList = () => {
	logger.start('generate-site-list');
	const list = [];
	while(count--) {
		list.push({
			id: '10' + Random.string('number', 7),
			name: Random.county
		});
	}
	logger.end('generate-site-list');
	return list;
};

module.exports = getSiteList();
