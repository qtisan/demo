/**
 * Created by qtisa on 2017/6/22.
 */

const {timer, XPLBLogger: logger} = require('../../utils');
const CPU_NUM = require('os').cpus().length;
const fs = require('fs');
const {join} = require('path');

const defaultConfig = {
	processNum: CPU_NUM
};

function getConfigFromJSON() {
	let jsonConfig;
	try {
		jsonConfig = fs.readFileSync(join(__dirname, './config.json'));
		return Object.assign(defaultConfig, JSON.parse(jsonConfig));
	}
	catch (exception) {
		logger.error(`config file not exist or json format got wrong.`);
		return null;
	}
}

const config = getConfigFromJSON();

module.exports = {

	get: (name) => {
		if (!name) {
			return config;
		}
		else {
			return config[name];
		}
	},

	reload: (name) => {
		return getConfigFromJSON()[name];
	}

	
};