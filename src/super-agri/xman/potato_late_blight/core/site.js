
const { timer, trigger, XPLBLogger: logger } = require('../../../utils');
const EventEmitter = require('events');

// 站点父类
class Site extends EventEmitter {
	constructor (id, name, currentTime, solution, growth) {
		super();
		this.site_id = id;
		this.site_name = name;
		this.current_time = currentTime || timer.current();
		this.solution = solution; // 取得该站的侵染方案
		this.growth = growth;
	}
	// 更新当天所在的生育期，不传参数即用当前系统时间
	updateGrowth (getGrowth, time) {
		this.current_time = (time ? timer.current(time) : this.current_time) || timer.current();
		this.growth = getGrowth.apply(this, [this.site_id, this.current_time]);
		this.growth && this.growth.refresh(this.current_time);
		this.in_growth = !!this.growth && !!this.growth.season_index;
	}
	// 更新侵染方案
	updateSolution (getSolution) {
		this.solution = getSolution(this.site_id);
		return this.solution;
	}
	
	clone () {
		const that = new Site();
		Object.assign(that, this);
		return that;
	}
	skip (note) {
		return {
			site_id: this.site_id,
			site_name: this.site_name,
			current_time: this.current_time,
			skip: true,
			note: note || 'it is skipped.'
		};
	}
}

// 湿润期类
class SiteWetness extends Site{
	constructor ({
		site_id,
		site_name,
		continuous, // 湿润期持续的01字符串，符合条件为1，不符合为0
		humid_array, // 湿润期湿度数组，与continuous相对应
		temp_avg, // 湿润期平均湿度
		start_time, // 湿润期开始时间，YYYYMMDDHHmmss
		end_time, // 湿润期结束时间，YYYYMMDDHHmmss，未结束为''
		last_time, // 湿润期持续小时数
		site_infect, // 湿润期的侵染对象。有则表明当天已侵染，若当天再次侵染则更新严重程度；无则表明当天未侵染，若侵染则创建侵染对象。每天结束清空
		current_time, // 当前的日期，YYYYMMDD
		solution,
		growth
	}) {
		super(site_id, site_name, current_time, solution, growth);
		Object.assign(this, {continuous, humid_array, temp_avg, start_time, end_time, last_time, site_infect});
	}
	// 清空湿润期方法，湿润条件连续中断时调用
	clear () {
		// TODO: save the stopped wetness to db.
		Object.assign(this, {
			continuous: '',
			humid_array: [],
			temp_avg: 0,
			start_time: timer.later(1),
			end_time: '',
			last_time: 0
		});
	}
	// 判断是否中断润湿期，并计算侵染情况
	judgeInterrupt (weather1Hour, drop) {
		// TODO: is the time continuously ?
		let solution = this.solution;
		let interrupt = (() => { // 取得中断条件连续的0数
			let i = solution.humid_interrupt, res = '';
			while (i --) {
				res += '0';
			}
			return res;
		})();
		// 最近一小时湿度获得之后，是否满足中断湿润期条件
		if (this.continuous.indexOf(interrupt) != -1 || this.continuous[0] == '0') {
			this.end_time = timer.earlier(interrupt, weather1Hour.time);
			this.start_time = weather1Hour.time;
			this.last_time -= 3;
			const that = this.clone();
			typeof drop == 'function' && drop.call(this, that);
			this.emit('wetness.computeInterrupt', { weather1Hour, siteWetness: that }); // 符合条件的回调事件
			this.clear();
			let skip = this.skip('wetness interrupt.');
			// logger.debug(skip.current_time+'fffff');
			return skip;
		}
		else { // 不符合中断条件
			this.emit('wetness.computeNotInterrupt', { weather1Hour, siteWetness: this }); // 不符合条件的回调事件
			// 当前在生育期才计算
			if (this.in_growth) {
				this.site_infect = solution.judgeInfect(this); // 【入口】根据当前湿润期情况，判断生成侵染对象
				// logger.debug(this.site_infect.current_time+'ggggg');
				return this.site_infect;
			}
			else {
				this.emit('infect.notInGrowth', { weather1Hour, siteWetness: this });
				let skip = this.skip('not in growth.');
				// logger.debug(skip.current_time+'eeeee');
				return skip;
			}
		}
	}
	// 【主方法】，每小时调用时，更新当前湿润期对象数据
	update (weather1Hour, drop) {
		let last = this.last_time;
		let humid = weather1Hour.humid;
		this.emit('wetness.computeStart', {weather1Hour, siteWetness: this});
		this.current_time = timer.current(weather1Hour.time);
		this.continuous += (humid >= this.solution.humid_bound ? '1' : '0');
		this.humid_array.push(humid);
		this.temp_avg = ((this.temp_avg * last + weather1Hour.temp) / (last + 1)).toFixed(1);
		this.last_time += 1;
		// 判断是否中断润湿期，若未中断，则计算侵染情况
		return this.judgeInterrupt(weather1Hour, drop);
	}

}

// 侵染期类
class SiteInfect extends Site {

	constructor (siteWetness, {
		start_time = timer.later(siteWetness.last_time, siteWetness.start_time), // 侵染期开始时间，YYYYMMDDHHmmss
		degree = 0, // 当前侵染的严重程度，创建时需覆盖
		end_time = '', // 侵染期结束时间，YYYYMMDDHHmmss，【在代对象中填充时更新】
		last_day = 1, // 侵染期持续天数，【在代对象中填充时更新】
		period = 0, // 当前代，【在代对象中填充时更新】
		times = 0, // 当前次，【在代对象中填充时更新】
		score = 0, // 当天的积分，【在代对象中填充时更新】
		score_total = 0 // 当前次的总积分，【在代对象中填充时更新】
	} = siteWetness) {
		super(siteWetness.site_id, siteWetness.site_name, siteWetness.current_time, siteWetness.solution);
		if (siteWetness.site_wetness) {
			Object.assign(this, siteWetness);
			this.site_wetness = Object.assign({}, siteWetness.site_wetness);
		}
		else {
			Object.assign(this, {start_time, end_time, last_day, period, times, degree, score, score_total});
			this.site_wetness = Object.assign({}, siteWetness);
		}
	}

}

// 站点侵染代次类
class SitePeriod extends Site {

	constructor () {
		super();
	}

}

module.exports = { Site, SiteWetness, SiteInfect, SitePeriod };

