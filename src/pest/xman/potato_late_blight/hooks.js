/**
 * Created by qtisa on 2017/6/19.
 */

const { trigger, XPLBLogger: logger, noop, writeFileSync } = require('../../utils');
const cache = require('./config').get('cache');

module.exports = {
	// TODO: synchronize with redis & save to mysql
	onStart: ({ siteWetnessListData, siteInfectListData,
		completedSiteWetnessListData, currentSiteWetnessListData,
		solutionCollection, growthCollection, siteWeatherList }) => {
		writeFileSync(cache.siteWeatherList, JSON.stringify(siteWeatherList));
		writeFileSync(cache.siteInfectList, JSON.stringify(siteInfectListData));
		writeFileSync(cache.siteWetnessList, JSON.stringify(siteWetnessListData));
		logger.start('compute-sites-in-future-240-hours', 'compute started...');
	},
	onSingleSiteComputeStart: ({ siteWeather }) => {
		logger.start(`site[${siteWeather.site_id}]-compute`);
	},
	onSingleSiteComputeEnd: ({ siteWeather }) => {
		logger.end(`site[${siteWeather.site_id}]-compute`);
	},

	onWetnessComputeStart: () => {

	},
	onWetnessComputeInterrupt: () => {

	},
	onWetnessComputeNotInterrupt: () => {

	},
	onInfectNotInGrowth: () => {

	},

	onInfectComputeStart: () => {

	},
	onInfectSolutionNotExist: () => {

	},
	onInfectTempAvgMatched: () => {

	},
	onInfectSuccess: () => {

	},
	onInfectTempAvgNotMatched: () => {

	},
	onInfectComputeEnd: () => {

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

	onEnd: ({	resultSiteInfectList, resultCompletedSiteWetnessList, resultCurrentSiteWetnessList }) => {
		logger.end('compute-sites-in-future-240-hours', 'compute finished.');

		logger.info('[customer]saving the test result...');
		let wetnessFile = cache.siteWetnessCurrent,
				infectFile = cache.siteInfectResult;
		resultCurrentSiteWetnessList.saveToFile(wetnessFile);
		resultSiteInfectList.saveToFile(infectFile);
		logger.info(`test file is saved to ${wetnessFile} & ${infectFile}.`);

		setTimeout(process.exit, 1000);
	}
};
