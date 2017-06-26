/**
 * Created by qtisa on 2017/6/26.
 */

const {readFileSync} = require('fs');
const {join} = require('path');

const sites = JSON.parse(
	readFileSync(join(__dirname, './POTATO_PLANT_TERMINATOR.json')).toString()
).RECORDS.filter(s => s.ID && s.YEAR == '2017');

console.log(sites.length);
