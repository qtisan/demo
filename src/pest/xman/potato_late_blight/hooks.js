/**
 * Created by qtisa on 2017/6/19.
 */

const { trigger, logger, noop } = require('../../utils');
const { join } = require('path');

module.exports = {
	// TODO: synchronize with redis & save to mysql
	onStart: ({ siteWetnessList, siteInfectList },
		{ solutionCollection, growthCollection }) => {
		logger.start('compute-sites-in-future-240-hours', 'compute started...');
	},
	onSingleSiteComputeStart: ({ siteWeather }) => {
		logger.start(`site-${siteWeather.site_id}-compute`, false);
	},
	onSingleSiteComputeEnd: ({ siteWeather }) => {
		logger.end(`site-${siteWeather.site_id}-compute`);
	},
	onEnd: ({ siteWetnessList, siteInfectList },
		{ solutionCollection, growthCollection }) => {
		logger.end('compute-sites-in-future-240-hours', 'compute finished.');

		logger.info('saving the test result...');
		let wetnessFile = join(__dirname, '../../test/sites_wetness.json'),
			infectFile = join(__dirname, '../../test/sites_infect.json');
		siteWetnessList.saveToFile(wetnessFile);
		siteInfectList.saveToFile(infectFile);
		logger.info(`test file is saved to ${wetnessFile} & ${infectFile}.`);
	}
};
