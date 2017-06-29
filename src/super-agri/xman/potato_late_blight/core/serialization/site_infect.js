/**
 * Created by qtisa on 2017/6/29.
 */

module.exports = function (site) {
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
};