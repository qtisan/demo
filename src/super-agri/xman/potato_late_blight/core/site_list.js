/**
 * Created by qtisa on 2017/6/18.
 */

const { XPLBLogger: logger, timer, writeFileSync, writeFileSyncWithParams } = require('../../../utils');

const { Site, SiteWetness, SiteInfect } = require('./site');


class SiteList {

	constructor (collection, predicate) {
		this.sites = [];
		if (collection instanceof Array) {
			collection.forEach(site => this.sites.push(site));
		}
		this.predicate = site => Object.assign({}, site);
		if (typeof predicate === 'function') {
			this.predicate = predicate;
		}
	}

	static fromData (collection, predicate) {
		return new SiteList(collection, predicate);
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
		return this.sites.length;
	}

	serialize (predicate, json) {
		let _predicate = typeof predicate == 'function' ? predicate : this.predicate;
		let result = this.sites.map(_predicate);
		return json ? JSON.stringify(result) : result;
	}
	saveToFile (path, predicate) {
		const sites = predicate ? this.serialize(predicate) : this.serialize();
		writeFileSync(path, JSON.stringify({ count: this.count(), sites }));
	}
	saveToFileWithParams (params, path, predicate) {
		const sites = predicate ? this.serialize(predicate) : this.serialize();
		writeFileSyncWithParams(params, path, JSON.stringify({ count: this.count(), sites }));
	}

	combine (that) {
		that.sites.forEach(site => this.add(site));
	}

}


class SiteWetnessList extends SiteList {

	constructor (collection) {
		super(collection && collection.map(site => new SiteWetness(site)));
	}

	static fromData (collection) {
		return new SiteWetnessList(collection);
	}
	static sitePredicate (site) {
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
	}

	serialize (json) {
		return super.serialize(SiteWetnessList.sitePredicate, json);
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

	static sitePredicate (site) {
		let res = {
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
			status: site.status,
			note: site.note
		};
		let sw = site.site_wetness;
		if (sw) {
			res.site_wetness = {
				continuous: sw.continuous,
				humid_array: sw.humid_array,
				temp_avg: sw.temp_avg,
				start_time: sw.start_time,
				end_time: sw.end_time,
				last_time: sw.last_time,
				current_time: sw.current_time
			};
		}
		return res;
	}

	refreshCurrentTime (time) {
		this.current_time = timer.current();
	}
	setCurrentSite (site) {
		this.current_site = site.site_id ? site : this.getSite(site);
	}
	// 更新一个站的侵染期对象，无则添加，有则更新
	updateSite (siteInfect) {
		if (siteInfect) {
			const siteId = siteInfect.site_id;
			const current_time = siteInfect.current_time;
			const current_date = timer.timeToDate(current_time);
			const lastSiteInfectPoint = this.current_site &&
				(this.current_site.site_id == siteId ? this.current_site : this.getSite(siteId));
			const today = timer.sameDay(current_time, this.current_time);
			// logger.debug(`[****]-upon:${today}-[${siteId}],si:${current_time}, this:${this.current_time}, lsi:${lastSiteInfectPoint && lastSiteInfectPoint.current.current_time}`);
			if (!lastSiteInfectPoint) {
				let current_site = {
					site_id: siteInfect.site_id,
					site_name: siteInfect.site_name,
					current: today && siteInfect,
					forecast: today ? {} : {[current_date]: siteInfect}
				};
				this.add(current_site);
				this.setCurrentSite(current_site);
				// p ++;
			}
			else if (today) {
				// l ++;
				if (lastSiteInfectPoint.current.status == 'ok') {
					lastSiteInfectPoint.current.current_time = siteInfect.current_time;
					lastSiteInfectPoint.current.degree = siteInfect.degree;
				}
				else {
					lastSiteInfectPoint.current = siteInfect;
				}
			}
			else if (lastSiteInfectPoint.forecast[current_date]) {
				// m ++;
				lastSiteInfectPoint.forecast[current_date].current_time = siteInfect.current_time;
				lastSiteInfectPoint.forecast[current_date].degree = siteInfect.degree;
			}
			else {
				// n ++;
				lastSiteInfectPoint.forecast[current_date] = siteInfect;
			}
			// logger.debug(`[****]-same:${today}-[${siteId}],si:${current_time}, this:${this.current_time}, lsi:${lastSiteInfectPoint && lastSiteInfectPoint.current.current_time}`);
			// logger.debug(`[----]-site:[${siteId}]-[l]${l}+[m]${m}+[n]${n}+[p]${p}=[${l+m+n+p}]`);
		}
	}

	serialize (json) {
		const predicate = (site) => {
			let forecast = site.forecast, _forecast = {};
			for (let prop in forecast) {
				if (forecast.hasOwnProperty(prop)) {
					_forecast[prop] = SiteInfectList.sitePredicate(forecast[prop]);
				}
			}
			return {
				site_id: site.site_id,
				site_name: site.site_name,
				current: SiteInfectList.sitePredicate(site.current),
				forecast: _forecast
			}
		};
		return super.serialize(predicate, json);
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
