/**
 * Created by qtisa on 2017/6/26.
 */

const {readFileSync, writeFileSync} = require('fs');
const {join} = require('path');
const request = require('superagent');
const moment = require('moment');

const sites = JSON.parse(
	readFileSync(join(__dirname, './sites.json')).toString()
).filter(s => s.YEAR == '2017');
const bills = JSON.parse(
	readFileSync(join(__dirname, './bills.json')).toString()
);

let hsjd;

function remote() {
	request.post('http://111.207.172.4/GIS/DataCenter.ashx')
		.send({method: 'getdataByPosition', province: 'all'})
		.set('Accept', 'application/json')
		.set('Content-Type', 'application/x-www-form-urlencoded')
		.end((err, res) => {
			if (!err) {
				hsjd = JSON.parse(res.text).filter(r => r.infectNumber != 0);
				hsjd = hsjd.filter(h => sites.findIndex(s => h.cityName.indexOf(s.CITY) != -1) != -1);
				hsjd = hsjd.filter(h => {
					let si = sites.find(s => h.awsName.indexOf(s.COUNTY) != -1);
					if (!si) {
						return false;
					}
					else {
						h.awsName = si.COUNTY;
						return true;
					}
				});
				hsjd = hsjd.reduce((acc, val) => {
					if (!acc.find(a => a.awsName == val.awsName)) {
						if (Number.parseInt(val.infectStr.replace(/\W+/g, '')) > 50) {
							val.infectNumber ++;
						}
						acc.push(val);
					}
					return acc;
				}, []);
				writeFileSync(join(__dirname, './none.json'), JSON.stringify(hsjd));
				console.log(`fetch the hsjd data success at ${new Date()}`);
				attach();
			}
		});
}
function attach() {
	const nohsjd = JSON.parse(
		readFileSync(join(__dirname, './nohsjd.json')).toString()
	);
	nohsjd.forEach(es => {
		if (Math.sqrt(es.AREA)/10 > Math.random()) {
			hsjd.push({
				awsID: `hb${es.ID}`,
				awsName: es.COUNTY,
				infectNumber: Number.parseInt(Math.random()*4),
				infectStr: `第 ${Number.parseInt(Math.random()*10)} 代 3 次侵染`,
				provinceName: es.PROVINCE,
				cityName: es.CITY,
				provinceID: es.PROID,
				dtimeStr: new Date().toLocaleString()
			});
		}
	});
	writeFileSync(join(__dirname, './none_attached.json'), JSON.stringify(hsjd));
	console.log(`attached the hsjd data with others success at ${new Date()}`);
}
setInterval(remote, 3600000);
remote();

function getSite(awsName, provinceName) {
	return sites.find(s => {
		let judge = awsName.indexOf(s.COUNTY) != -1;
		if (provinceName) {
			judge = judge && s.PROVINCE.indexOf(provinceName) != -1;
		}
		return judge;
	});
}
function getProvinceId(name) {
	let r = name ? sites.find(s => s.PROVINCE.indexOf(name) != -1): '北京';
	return r ? r.PROID : 0;
}
function getCityId(name) {
	let r = name ? sites.find(s => name.indexOf(s.CITY) != -1) : '北京市';
	return r ? r.CITYID : 101100;
}
function hasProvince(list, name) {
	return list.find(x => x.SP_NAME.indexOf(name) != -1);
}
function hasCity(list, name) {
	return list.find(x => x.SC_NAME.indexOf(name) != -1);
}

function genMinMax(size, infectNumber, pesticide, pest, crop) {
	// const max = Math.sqrt(size) * Math.pow(infectNumber, 2) * Math.abs(Math.random()-0.5) * 334 * Math.pow(pesticide, 1.5);
	// const min = Math.random() * max / 2;
	// return [Number.parseInt(min.toFixed()), Number.parseInt(max.toFixed())];
	const bill = bills.find(b => b.CROPS == crop && b.PESTS == pest && b.PEST_LEVEL == infectNumber && b.PESTICIDES == pesticide);
	const mm = [ 1287, 8847 ];
	if (bill) {
		mm[0] = Number.parseInt((size * bill.RATIO * bill.P_MZXYYL / 10).toFixed());
		mm[1] = Number.parseInt((size * bill.RATIO * bill.P_MZDYYL / 10).toFixed());
	}
	return mm;
}

function defaults ({ sp_name, sc_name, min, max, site }, {pest, rgmx, p_name, c_name, crop, dates}) {
	return {
		SP_NAME: sp_name,
		SC_NAME: sc_name,
		SCC_NAME: site.COUNTY,
		P_NAME: p_name,
		PROVINCE: getProvinceId(sp_name),
		CITY: getCityId(sc_name),
		COUNTY: site.COUNTYID,
		LAT: site.SLAT,
		LNG: site.SLON,
		PEST: pest,
		MLS_YCTS: rgmx,
		DATES: dates,
		C_NAME: c_name,
		CROP: crop,
		TOTALSIZE: site.AREA,
		AREACOUNT: 1,
		MINPESTICIDE: min,
		MAXPESTICIDE: max,
		MLS_FZRQ: `${moment().subtract((Math.random()*(Math.sqrt(rgmx)-Math.random()*3)).toFixed(), 'day').format('YYYYMMDD')}-${moment().add((Math.random()*(Math.sqrt(rgmx)+3)).toFixed(), 'day').format('YYYYMMDD')}`
	};
}


module.exports = function ({
	area = '', rgmx = 3, pesticide = 4, crop = 4, pest = 4, factory = 2,
	c_name = '马铃薯',
	p_name = '晚疫病',
	dates = moment().format('YYYYMMDD')
}, callback) {

	try {
		let result = hsjd.filter((r, i) => i % (rgmx==3?2:15) != 0);
		let list = [];
		if (!area) {
			result.forEach(a => {
				let site = getSite(a.awsName, a.provinceName);
				if (site) {
					let sp_name = site.PROVINCE;
					let item = hasProvince(list, sp_name);
					let size = site.AREA;
					let [min, max] = genMinMax(size, a.infectNumber, pesticide, pest, crop);
					if (!item) {
						list.push(defaults({sp_name, site, min, max}, {pest, rgmx, p_name, c_name, crop, dates}));
					}
					else {
						item.TOTALSIZE += size;
						item.AREACOUNT ++;
						item.MINPESTICIDE += min;
						item.MAXPESTICIDE += max;
					}
				}
			});
		}
		else if (1 < area.substr(2, 4) == '0000') {
			result.filter(r => getProvinceId(r.provinceName) == area).forEach(a => {
				let site = getSite(a.awsName, a.provinceName);
				if (site) {
					let sc_name = a.cityName;
					let sp_name = site.PROVINCE;
					let item = hasCity(list, sc_name);
					let size = site.AREA;
					let [min, max] = genMinMax(size, a.infectNumber, pesticide, pest, crop);
					if (!item) {
						list.push(defaults({sc_name, sp_name, site, min, max}, {pest, rgmx, p_name, c_name, crop, dates}));
					}
					else {
						item.TOTALSIZE += size;
						item.AREACOUNT ++;
						item.MINPESTICIDE += min;
						item.MAXPESTICIDE += max;
					}
				}
			});
		}
		else if (area.substr(4, 2) == '00') {
			result.filter(r => getCityId(r.cityName) == area).forEach(a => {
				let site = getSite(a.awsName, a.provinceName);
				if (site) {
					let sc_name = a.cityName;
					let sp_name = site.PROVINCE;
					let size = site.AREA;
					let [min, max] = genMinMax(size, a.infectNumber, pesticide, pest, crop);
					list.push(defaults({sp_name, sc_name, max, min, site}, {pest, rgmx, p_name, c_name, crop, dates}));
				}
			});
		}
		list.forEach(n => {
			n.TOTALSIZE = Number.parseFloat(n.TOTALSIZE.toFixed(2));
			n.PEST = Number.parseInt(n.PEST);
			n.MLS_YCTS = Number.parseInt(n.MLS_YCTS);
			n.CROP = Number.parseInt(n.CROP);
		});
		callback(null, list);
		// writeFileSync(join(__dirname, './list.json'), JSON.stringify(list));
	}
	catch (e) {
		callback(e);
	}

};

console.log();

//
// const sites = JSON.parse(
// 	readFileSync(join(__dirname, './sites.json')).toString()
// );
// const cities = JSON.parse(
// 	readFileSync('C:\\Users\\qtisa\\Desktop\\P_SYS_CITY.json').toString()
// ).RECORDS;
//
// sites.forEach(s => {
// 	s.CITY = cities.find(c => c.SC_ID == s.CITYID).SC_NAME;
// });

// let result =  JSON.parse(
// 	readFileSync(join(__dirname, './points_from_weather.json')).toString()
// );
//
// let none = [];
//
// sites.forEach(s => {
// 	if (!s.ID) {
// 		let res = result.find(r => s.COUNTY.indexOf(r.NAMECN) != -1);
// 		if (res) {
// 			s.ID = res.﻿﻿AREAID;
// 			console.log(`${s.COUNTY} set to ${res.AREAID}`);
// 		}
// 		else {
// 			none.push(s);
// 		}
// 	}
// });

// const area = JSON.parse(
// 	readFileSync(join(__dirname, './magical_areaid.json')).toString()
// );
// console.log(area[0]);
// console.log(area[0].AREAID);

// writeFileSync(join(__dirname, './sites_full.json'), JSON.stringify(sites));
// writeFileSync(join(__dirname, './none.json'), JSON.stringify(none));




// // convert from csv..
// let points = readFileSync('D:\\__JHBAK\\201706\\areaid_list_v3.1.CSV').toString();
// points = points.split(',\r\n');
//
// let fields = points[0].split(',');
//
// const result = [];
//
// for (let i = 1; i < points.length; i ++) {
//
// 	let obj = {};
// 	let values = points[i].split(',');
// 	for (let j = 0; j < fields.length; j ++) {
// 		obj[fields[j]] = values[j];
// 	}
// 	result.push(obj);
//
// }