/**
 * Created by qtisa on 2017/6/18.
 */

const { XPLBLogger: logger, timer, writeFileSync } = require('../../../utils');

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
		return this;
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
		writeFileSync(path, JSON.stringify({ count: this.count(), sites }));
	}

}


class SiteWetnessList extends SiteList {

	constructor (collection) {
		super(collection && collection.map(site => new SiteWetness(site)));
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
				// site_infect: site.site_infect, // TODO: should clear the props
				current_time: site.current_time
			}
		};
		return super.serialize(predicate, json);
	}
	
	updateSite (siteWetness, override) {
		const site = this.sites.find(site => site.site_id == siteWetness.site_id);
		if (site) {
			override && Object.assign(site, siteWetness);
			override || siteWetness.current_time >= site.current_time && Object.assign(site, siteWetness);
		}
		else {
			this.add(siteWetness);
		}
	}

	clone () {
		return new SiteWetnessList(this.sites);
	}

	combine (that) {
		that.sites.forEach(site => this.updateSite(site));
	}

	saveToCache () {
		logger.info(`saved site wetness list to cache.`);
	}
	saveToDB () {
		logger.info(`saved site wetness list to db.`);
	}
	// TODO: add wetness list features.
}

// let n = 0, m=0, l=0, p=0;
class SiteInfectList extends SiteList{

	constructor (collection) {
		super(collection && collection.map(({site_id, site_name, current, forecast}) => {
			return {
				site_id, site_name,
				current: new SiteInfect(current),
				forecast: (() => {
					let _forecast = {};
					for (let prop in forecast) {
						if (forecast.hasOwnProperty(prop)) {
							_forecast[prop] = new SiteInfect(forecast[prop]);
						}
					}
					return _forecast;
				})()
			}
		}));
		this.current_time = timer.current();
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
			// logger.debug(`si-ct:${current_time}, this-ct:${this.current_time}`);
			if (!lastSiteInfect) {
				this.add({
					site_id: siteInfect.site_id,
					site_name: siteInfect.site_name,
					current: sameDay && siteInfect,
					forecast: sameDay ? {} : {[current_date]: siteInfect}
				});
				// p++;
			}
			else if (sameDay) {
				// l ++;
				if (!lastSiteInfect.current.skip) {
					lastSiteInfect.current.current_time = siteInfect.current_time;
					lastSiteInfect.current.degree = siteInfect.degree;
				}
			}
			else if (lastSiteInfect.forecast[current_date]) {
				// m ++;
				lastSiteInfect.forecast[current_date].current_time = siteInfect.current_time;
				lastSiteInfect.forecast[current_date].degree = siteInfect.degree;
			}
			else {
				// n ++;
				lastSiteInfect.forecast[current_date] = siteInfect;
			}
		}
		// logger.debug(`${l}+${m}+${n}+${p}=${l+m+n+p}`);
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
				// site_wetness: site.site_wetness, // TODO: should clear the props
				skip: site.skip,
				note: site.note
			}
		};
		const predicate = (site) => {
			let forecast = site.forecast, _forecast = {};
			for (let prop in forecast) {
				if (forecast.hasOwnProperty(prop)) {
					_forecast[prop] = sitePredicate(forecast[prop]);
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

	combine (that) {
		that.sites.forEach(site => this.add(site));
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
