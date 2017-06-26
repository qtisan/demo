/**
 * Created by qtisa on 2017/6/19.
 */

const { trigger, XPLBLogger: logger, noop, writeFileSync } = require('../../utils');
const cache = require('./config').get('cache');

module.exports = {
	// TODO: synchronize with redis & save to mysql
	onStart: ({ siteWetnessListData, siteInfectListData,
		completedSiteWetnessListData, currentSiteWetnessListData,
		solutionCollection, growthCollection, batchId, siteWeatherList }) => {
		writeFileSync(cache.site_weather_list, JSON.stringify(siteWeatherList));
		writeFileSync(cache.site_infect_list, JSON.stringify(siteInfectListData));
		writeFileSync(cache.site_wetness_list, JSON.stringify(siteWetnessListData));
		logger.start(`compute-${siteWetnessListData.length}sites-in-future-240-hours_${batchId}`);
	},
	onSingleSiteComputeStart: ({ siteWeather, siteWetness }) => {
		logger.start(`site[${siteWeather.site_id}]-compute`);
	},
	onSingleSiteComputeEnd: ({ siteWeather, siteWetness, siteInfectList, historySiteInfectList }) => {
		logger.end(`site[${siteWeather.site_id}]-compute`);
		historySiteInfectList.saveToFileWithParams({site_id: siteWetness.site_id}, cache.site_infect_history);
	},

	onWetnessComputeStart: ({weather1Hour, siteWetness}) => {

	},
	onWetnessComputeInterrupt: ({weather1Hour, siteWetness}) => {

	},
	onWetnessComputeNotInterrupt: ({weather1Hour, siteWetness}) => {

	},
	onInfectNotInGrowth: ({weather1Hour, siteWetness}) => {

	},

	onInfectComputeStart: ({siteWetness, siteInfect, solution}) => {

	},
	onInfectSolutionNotExist: ({siteWetness, solution}) => {

	},
	onInfectTempAvgMatched: ({siteWetness, last_time, temp_avg, lasts, solution}) => {

	},
	onInfectSuccess: ({siteWetness, siteInfect, solution}) => {

	},
	onInfectTempAvgNotMatched: ({siteWetness, last_time, temp_avg, solution}) => {

	},
	onInfectComputeEnd: ({siteWetness, siteInfect, solution}) => {

	},

	onProcessChildReady: ({ data, batch, child }) => {
		// data: {}
	},
	onProcessChildError: ({ error, batch, child }) => {
		// error: {}
	},
	onProcessChildReport: ({ data, batch, child }) => {
		// data: {}
	},
	onProcessBatchStart: ({ initialData, batch }) => {
		// initialData: {}
	},
	onProcessBatchFinish: ({ result, batch }) => {
		// result: []
	},
	onProcessSingleStart: ({ data, batch, child }) => {
		// data: {}
	},
	onProcessSingleFinish: ({ data, batch, child }) => {
		// data: {}
	},

	onEnd: ({	resultSiteInfectList, resultCompletedSiteWetnessList,
		resultCurrentSiteWetnessList, batchId }) => {

		logger.end(`compute-${resultCurrentSiteWetnessList.count()}sites-in-future-240-hours_${batchId}`);

		logger.info('[cache] saving the test result...');
		resultCurrentSiteWetnessList.saveToFile(cache.site_wetness_current);
		resultSiteInfectList.saveToFile(cache.site_infect_result);
		resultCompletedSiteWetnessList.saveToFile(cache.site_wetness_completed);
		logger.info(`[cache] result is saved.`);

		setTimeout(process.exit, 1000);
	}
};
