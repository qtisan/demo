/**
 * Created by qtisa on 2017/6/18.
 */

const { timer } = require('../../../utils');

class Growth {

	constructor ({ site_id, seasons }, time) {
		Object.assign(this, { site_id, seasons });
		time && this.refresh(time);
	}

	refresh (time) {
		let seasons = this.seasons;
		let current = time || timer.current();
		let currentSpan = null, seasonIndex;
		seasons.find((season, index) => {
			currentSpan = season.find(span => timer.between(current, span.time));
			if (currentSpan) {
				seasonIndex = index + 1;
			}
			return currentSpan;
		});
		if (seasonIndex) {
			this.season_index = seasonIndex;
			Object.assign(this, currentSpan);
		}
		else {
			this.season_index = 0;
			this.name = '不在生育期内';
			this.time = current;
		}
		return currentSpan;
	}

}


module.exports = Growth;
