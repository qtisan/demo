
const { timer } = require('../utils');
const getSolutionInfect = require('./solution_infect');

class Site {
	constructor (id, solution) {
		this.site_id = id;
		this.solution = solution || getSolutionInfect(id);
	}
}

class SiteWetness extends Site{
	constructor ({
		site_id,
		continuous,
		humid_array,
		temp_avg,
		start_time,
		end_time,
		last_time
	}) {
		super(site_id);
		this.continuous = continuous;
		this.humid_array = humid_array;
		this.temp_avg = temp_avg;
		this.start_time = start_time;
		this.end_time = end_time;
		this.last_time = last_time;
	}

	clear () {
		Object.assign(this, {
			continuous: '',
			humid_array: [],
			temp_avg: 0,
			start_time: timer.later(1),
			end_time: '',
			last_time: 0
		});
	}

	judgeInterrupt (weather1Hour, match, notMatch) {
		// TODO: is the time continuously ?
		let solution = this.solution;
		let interrupt = (() => {
			let i = solution.humidInterrupt, res = '';
			while (i --) {
				res += '0';
			}
			return res;
		})();
		if (this.continuous.indexOf(interrupt) != -1) {
			this.end_time = timer.earlier(3, weather1Hour.time);
			this.start_time = weather1Hour.time;
			this.last_time -= 3;
			typeof match === 'function' && match({ weather1Hour, siteWetness: this });
			this.clear();
		}
		else {
			typeof notMatch === 'function' && notMatch();
		}
	}

	update (weather1Hour, interrupt, notInterrupt) {
		let last = this.last_time;
		let humid = weather1Hour.humid;

		this.continuous += (humid >= this.solution.humidBound ? '1' : '0');
		this.humid_array.push(humid);
		this.temp_avg = (this.temp_avg * last + weather1Hour.temp) / (last + 1);
		this.last_time += 1;

		this.judgeInterrupt(weather1Hour, interrupt, notInterrupt)
	}

}

class SiteInfect extends Site {

	constructor (siteWetness) {
		super(siteWetness.site_id, siteWetness.solution);
		this.site_wetness = siteWetness;

	}

}


module.exports = { Site, SiteWetness };