/**
 * Created by qtisa on 2017/6/18.
 */

const { logger, timer } = require('../../../utils');
const fs = require('fs');

const { Site, SiteWetness, SiteInfect } = require('./site');


class SiteList {

	constructor (collection) {
		this.sites = [];
		if (collection instanceof Array) {
			collection.forEach(site => this.sites.push(site));
		}
	}

	static fromData (collection) {

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

	serialize (predicate, json) {
		let _predicate = typeof predicate == 'function' ? predicate : (site => Object.assign({}, site));
		let result = this.sites.map(_predicate);
		return json ? JSON.stringify(result) : result;
	}
	saveToFile (path) {
		const sites = this.serialize();
		fs.writeFileSync(path, JSON.stringify({ count: this.count(), sites }));
	}

}


class SiteWetnessList extends SiteList {

	constructor (collection) {
		super(collection.map(site => new SiteWetness(site)));
	}

	static fromData (collection) {
		return new SiteWetnessList(collection);
	}

	serialize (json) {
		const predicate = (site) => {
			return {
				site_id: site.site_id,
				site_name: site.site_name,
				continuous: site.continuous,
				humid_array: site.humid_array,
				temp_avg: site.temp_avg,
				start_time: site.start_time,
				end_time: site.end_time,
				last_time: site.last_time,
				site_infect: site.site_infect,
				current_time: site.current_time,
				growth: site.growth
			}
		};
		return super.serialize(predicate, json);
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

	constructor (collection) {
		super(collection.map(({siteId, siteName, currentInfect, forecastInfects}) => {
			return {
				site_id: siteId,
				site_name: siteName,
				current: new SiteInfect(currentInfect),
				forecast: (() => {
					let forecast = {};
					for (let prop in forecastInfects) {
						if (forecastInfects.hasOwnProperty(prop)) {
							forecast[prop] = new SiteInfect(forecastInfects[prop]);
						}
					}
					return forecast;
				})()
			}
		}));
	}

	static fromData (collection, time) {
		const infectList = new SiteInfectList(collection);
		infectList.refreshCurrentTime(time);
		return infectList;
	}
	refreshCurrentTime (time) {
		this.current_time = timer.current();
	}
	// 更新一个站的侵染期对象，无则添加，有则更新
	updateSite (siteInfect) {
		if (siteInfect) {
			const siteId = siteInfect.site_id;
			const current_time = siteInfect.current_time;
			const current_date = timer.timeToDate(current_time);
			const lastSiteInfect = this.getSite(siteId);
			const sameDay = timer.sameDay(current_time, this.current_time);
			if (!lastSiteInfect) {
				this.add({
					site_id: siteInfect.site_id,
					site_name: siteInfect.site_name,
					current: sameDay && siteInfect,
					forecast: sameDay ? {} : {[current_date]: siteInfect}
				});
			}
			else if (sameDay) {
				if (!lastSiteInfect.current.skip) {
					lastSiteInfect.current.current_time = siteInfect.current_time;
					lastSiteInfect.current.degree = siteInfect.degree;
				}
			}
			else if (lastSiteInfect.forecast[current_date]) {
				if (!lastSiteInfect.current.skip) {
					lastSiteInfect.forecast[current_date].current_time = siteInfect.current_time;
					lastSiteInfect.forecast[current_date].degree = siteInfect.degree;
				}
			}
			else {
				lastSiteInfect.forecast[current_date] = siteInfect;
			}
		}
	}

	serialize (json) {
		const sitePredicate = (site) => {
			return {
				site_id: site.site_id,
				site_name: site.site_name,
				start_time: site.start_time,
				end_time: site.end_time,
				last_day: site.last_day,
				period: site.period,
				times: site.times,
				degree: site.degree,
				score: site.score,
				score_total: site.score_total,
				current_time: site.current_time,
				growth: site.growth
			}
		};
		const predicate = (site) => {
			let forecast = site.forecast, _forecast = {};
			for (let prop in forecast) {
				if (forecast.hasOwnProperty(prop)) {
					_forecast[key] = sitePredicate(value);
				}
			}
			return {
				site_id: site.site_id,
				site_name: site.site_name,
				current: sitePredicate(site.current),
				forecast: _forecast
			}
		};
		return super.serialize(predicate, json);
	}

	combine (another) {

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
