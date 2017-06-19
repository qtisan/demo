/**
 * Created by qtisa on 2017/6/18.
 */

const { timer, trigger } = require('../../../utils');
const EventEmitter = require('events');

const { SiteInfect } = require('./site');

class Solution extends EventEmitter {

	constructor ({
		site_id, solution_id, humid_bound, humid_interrupt,
		last_least, infect_solution, score_solution
	}) {
		super();
		Object.assign(this, {
			site_id, solution_id, humid_bound, humid_interrupt,
			last_least, infect_solution, score_solution
		});
	}
	
	judgeInfect (siteWetness) {
		let siteInfect;
		if (this.infect_solution) {
			const last_time = siteWetness.last_time;
			// 达到计算要求的最小持续时长时，查找方案中符合平均温度的持续时长行
			const lasts = last_time >= this.last_least && this.infect_solution[Number.parseFloat(siteWetness.temp_avg).toFixed()];
			let degree = 0;
			// 侵染计算开始时的回调事件
			this.emit('infect.computeStart', {siteWetness, siteInfect: siteWetness.site_infect, solution: this});
			// 存在湿润期平均温度相对应的侵染方案，即平均温度符合条件，判断持续时间
			if (lasts) {
				this.emit('infect.tempAvgMatched', {siteWetness, last_time, lasts, solution: this});
				for (let i = 0; i < lasts.length; i ++) { // 根据湿润期持续时间，由低到高判断严重程度
					degree = last_time >= lasts[i] ? i + 1 : degree;
					if (degree !== i + 1) {
						break;
					}
				}
				if (degree != 0) { // 侵染严重程度不为0，即湿润期当前小时符合侵染条件
					if (siteWetness.site_infect instanceof SiteInfect) {
						Object.assign(siteWetness.site_infect, {
							degree
						});
						siteInfect = siteWetness.site_infect;
					}
					else {
						siteInfect = new SiteInfect(siteWetness, {
							start_time: siteWetness.start_time,
							degree
						});
					}
					this.emit('infect.success', {siteWetness, siteInfect, solution: this});
				}
			}
			else {
				this.emit('infect.tempAvgNotMatched', {siteWetness, last_time, solution: this});
			}
			// 侵染计算结束后的回调事件
			this.emit('infect.computeEnd', {siteWetness, siteInfect, solution: this});
		}
		else {
			this.emit('infect.solutionNotExist', {siteWetness, solution: this});
		}
		return siteInfect;
	}
	
	judgeScore () {
		// TODO: compute the score in day.
	}

}



module.exports = Solution;

