/**
 * Created by qtisa on 2017/6/29.
 */

module.exports = function (site) {
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
		current_time: site.current_time,
		last_time_today: site.last_time_today,
		temp_avg_today: site.temp_avg_today
	}
};