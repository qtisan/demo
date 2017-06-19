/**
 * Created by qtisa on 2017/6/18.
 */

const { logger, timer } = require('../../../utils');
const fs = require('fs');


class SiteList {

	constructor () {
		this.sites = [];
	}

	getSite (id) {
		let predicate = typeof id == 'function' ? id : (site => site.site_id == id);
		return this.sites.find(predicate);
	}

	add (site) {
		this.sites.push(site);
	}

	forEach(predicate) {
		this.sites.forEach(predicate);
	}

	count () {
		return this.sites.count;
	}

	saveToFile (path) {
		const sites = this.sites.map((site) => {
			let pureObject = Object.assign({}, site);
			delete pureObject.domain;
			delete pureObject._events;
			delete pureObject._eventsCount;
			delete pureObject.solution.domain;
			delete pureObject.solution._events;
			delete pureObject.solution._eventsCount;
			return pureObject;
		});
		fs.writeFileSync(path, JSON.stringify({ count: sites.length, sites }));
	}

}


class SiteWetnessList extends SiteList {

	constructor () {
		super();
	}

	saveToCache () {
		logger.info(`saved site wetness list to cache.`);
	}
	saveToDB () {
		logger.info(`saved site wetness list to db.`);
	}
	// TODO: add wetness list features.
}


class SiteInfectList extends SiteList{

	constructor (time) {
		super();
		this.refreshCurrentTime(time);
	}
	refreshCurrentTime (time) {
		this.current_time = time ? timer.current(time) : timer.current();
	}
	// 更新一个站的侵染期对象，无则添加，有则更新
	updateSite (siteInfect) {
		if (siteInfect) {
			const siteId = siteInfect.site_id;
			const lastSiteInfect = this.getSite(siteId);
			if (!lastSiteInfect) {
				this.add(siteInfect);
			}
			else if (timer.sameDay(lastSiteInfect.current_time, siteInfect.current_time)) {
				lastSiteInfect.start_time = lastSiteInfect.current_time = siteInfect.current_time;
				lastSiteInfect.degree = siteInfect.degree;
			}
			else {
				lastSiteInfect.start_time = lastSiteInfect.current_time = siteInfect.current_time;
				lastSiteInfect.degree = siteInfect.degree;
			}
		}
	}

	// 清空列表，一个新的预测日开始时执行
	clear () {

	}

	saveToCache () {

	}
	saveToDB () {

	}
	// TODO: add infect list features.
}



module.exports = { SiteList, SiteWetnessList, SiteInfectList };
