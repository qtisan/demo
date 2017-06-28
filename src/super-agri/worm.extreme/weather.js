/**
 * Created by qtisa on 2017/6/28.
 */


const {readFileSync, writeFileSync} = require('fs');
const {join} = require('path');

const {forecast} = require('../reaper/weatherdt/fetch');

let sites = JSON.parse(
	readFileSync(join(__dirname, './nohsjd.json')).toString()
).filter(s => s.YEAR == '2017');


const areas = [];
let area = [];
sites.forEach(s => {
	if (area.length >= 20) {
		areas.push(area);
		area = [];
	}
	area.push(s.ID);
});

forecast(area, (err, result) => {
	if (err) {
		console.error(err);
	}
	console.log(result);
});























// sites = sites.filter(s => '河北省湖南省辽宁省山东省'.indexOf(s.PROVINCE) != -1);
//
// writeFileSync(join(__dirname, './nohsjd.json'), JSON.stringify(sites));
// console.log(sites.length);


