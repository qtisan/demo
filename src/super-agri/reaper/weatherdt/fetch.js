/**
 * Created by qtisa on 2017/6/28.
 */

const request = require('http').get;

const { keymapList } = require('./mapping');

const BASE_URL = `http://api.weatherdt.com/data/`;
const KEY = `b135304079a4bd3ddbebd80272d0b2a7`;


function fetch({area, type = 'forecast', key = KEY}, callback) {
	// let req = request[method](BASE_URL);
	// req = req.query({area, type, key});
	// for (let i in headers) {
	// 	if (headers.hasOwnProperty(i)) {
	// 		req = req.set(i, headers[i]);
	// 	}
	// }
	// req.use(q => {
	// 	q.url = decodeURIComponent(q.url);
	// 	return q;
	// });
	// req.end((err, res) => {
	// 	console.log(res.text);
	// 	callback(err, JSON.parse(res.text));
	// });
	request(`${BASE_URL}?area=${area}&type=${type}&key=${key}`, (res) => {
		const { statusCode } = res;
		let error;
		if (statusCode !== 200) {
			error = new Error(`Request Failed.\nStatus Code: ${statusCode}`);
		}
		if (error) {
			console.error(error.message);
			res.resume();
			return;
		}
		res.setEncoding('utf8');
		let rawData = '';
		res.on('data', (chunk) => { rawData += chunk; });
		res.on('end', () => {
			try {
				const parsedData = JSON.parse(rawData);
				console.log(parsedData);
				callback(error, parsedData);
			} catch (e) {
				console.error(e.message);
			}
		});
	}).on('error', (e) => {
		console.error(`Got error: ${e.message}`);
	});
}

const forecast = function(siteIds, callback, {param = '6h', type = '1001001'} = {}) {
	const area = siteIds.join('|');
	fetch({area}, (err, result) => {
		let _err = err;
		let _result = [];
		if (!_err) {
			if (!result.forecast) {
				_err = new Error('forecast not exist.');
			}
			else {
				let weathers = result.forecast[param];
				if (!weathers) {
					_err = new Error(`${param} not exist in forecast.`);
				}
				else {
					for (let siteId in weathers) {
						if (weathers.hasOwnProperty(siteId)) {
							_result.push({
								site_id: siteId,
								site_name: '',
								forecast: keymapList(weathers[siteId][type] || [])
							});
						}
					}
				}
			}
		}
		callback(_err, _result);
	});
};

module.exports = { forecast };


