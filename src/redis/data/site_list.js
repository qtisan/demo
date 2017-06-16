
const Mock = require('mockjs');

class SiteList {

	constructor () {
		this.count = 0;
		this.sites = [];
	}

	getSite (id) {
		return this.sites.find(site => site.site_id == id);
	}

	add (site) {
		this.sites.push(site);
		this.count ++;
	}

}

// TODO: get the site id list from database or files with growth computation.
const site_list = Mock.mock({
	'list|726': [ /10[0-9]{7}/ ]
});

module.exports = {
	sites: site_list.list,
	SiteList
};