/**
 * Created by qtisa on 2017/6/18.
 */

const { timer, trigger, XPLBLogger: logger } = require('../../../utils');
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
		let siteInfect = new SiteInfect(siteWetness, {});
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
							degree, current_time: siteWetness.current_time
						});
						siteInfect = siteWetness.site_infect;
						// logger.debug(siteInfect.current_time+'33333');
					}
					else {
						siteInfect = new SiteInfect(siteWetness, {
							start_time: siteWetness.start_time,
							degree
						});
						// logger.debug(siteInfect.current_time+'44444');
					}
					this.emit('infect.success', {siteWetness, siteInfect, solution: this});
				}
				else {
					siteInfect = siteInfect.skip('degree is 0.');
					// logger.debug(siteInfect.current_time+'22222');
				}
				// logger.debug(siteInfect.current_time + 'xxxxx');
			}
			else {
				siteInfect = siteInfect.skip('temperature not correct or time lasts haven\'t met the least.');
				this.emit('infect.tempAvgNotMatched', {siteWetness, last_time, solution: this});
				// logger.debug(siteInfect.current_time + 'yyyyy');
			}
			// 侵染计算结束后的回调事件
			this.emit('infect.computeEnd', {siteWetness, siteInfect, solution: this});
		}
		else {
			siteInfect = siteInfect.skip('solution not exist.');
			this.emit('infect.solutionNotExist', {siteWetness, solution: this});
			// logger.debug(siteInfect.current_time + 'zzzzz');
		}
		return siteInfect;
	}
	
	judgeScore () {
		// TODO: compute the score in day.
	}

}



module.exports = Solution;

