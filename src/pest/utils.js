
const moment = require('moment');
const fs = require('fs');
const { join, sep, dirname } = require('path');

const log4js = require('log4js');
const logFile = require('./config').logs;
log4js.clearAppenders();
log4js.loadAppender('dateFile');


const noop = () => {};

const defaultFormat = 'YYYYMMDDHHmmss',
	defaultFormatDate = 'YYYYMMDD';
// 处理时间字符串的方法
const timer = {
	current: (base) => (base ? moment(translateDatetimeFromString(base)) : moment()).format(defaultFormat),
	currentDate: (base) => (base ? moment(translateDatetimeFromString(base)) : moment()).format(defaultFormatDate),
	currentYear: (base) => (base ? moment(translateDatetimeFromString(base)) : moment()).format('YYYY'),
	currentMonth: (base) => (base ? moment(translateDatetimeFromString(base)) : moment()).format('MM'),
	later: (hour, base) => (base ? moment(translateDatetimeFromString(base)) : moment()).add(hour || 0, 'hour').format(defaultFormat),
	earlier: (hour, base) => (base ? moment(translateDatetimeFromString(base)) : moment()).subtract(hour || 0, 'hour').format(defaultFormat),
	between: (time, span) => {
		let [start, end] = span.split('-');
		return moment(translateDatetimeFromString(time)).isBetween(start, end, null, '[]');
	},
	timeToDate: (time) => moment(translateDatetimeFromString(time)).format(defaultFormatDate),
	dateToTime: (date) => moment(date).format(defaultFormat),
	sameHour: (time1, time2) => time1.slice(0, 10) == time2.slice(0, 10),
	sameDay: (time1, time2) => time1.slice(0, 8) == time2.slice(0, 8)
};
function translateDatetimeFromString(dateString) {
	let result = dateString;
	if (typeof dateString == 'string' && dateString.length == 14) {
		result = [ dateString.slice(0, 8), dateString.slice(8) ].join(' ');
	}
	return result;
}


const writeFileSync = new Proxy(fs.writeFileSync, handleFilePathProxy(0));
const createWriteStream = new Proxy(fs.createWriteStream, handleFilePathProxy(0));


const logLayout = '[%d][%c][%p] - %m ----[pid:%z]';
const logPattern = '.yyyy-MM-dd.log';

for (let cate in logFile) {
	if (logFile.hasOwnProperty(cate)) {
		let lp = mergePath(logFile[cate]);
		mkdir(lp);
		log4js.addAppender(log4js.appenders.dateFile(lp,
			logPattern,	log4js.layouts.patternLayout(logLayout), {alwaysIncludePattern: true}), cate);
	}
}


// TODO: replace logger plugin with log server.
const logger = function (category) {
	const con = log4js.getLogger(category);
	con.setLevel('DEBUG');
	con.debugTimer = {};
	return {
		info: (text) =>  con.info(text),
		warn: (text) => con.warn(text),
		error:(text) => con.error(text),
		trace: (text) => con.trace(text),
		fatal: (text) => con.fatal(text),
		debug: (text) => con.debug(text),
		start: (name, text) => {
			typeof text === 'boolean' && con.info(`timing | ${name} now start.`);
			con.debugTimer[name] = new Date().getTime();
			text !== true && text && con.info(text);
		},
		end: (name, text) => {
			let spend = new Date().getTime() - con.debugTimer[name];
			con.info(`timing | ${name} now end, cost ${spend} ms.`);
			text && con.info(text);
		}
	};
};
const XPLBLogger = logger('XPLB');

const trigger = (func, ...args) => typeof func === 'function' && func.apply(this, args);

function handleFilePathProxy(pathArgIndex) {
	const index = pathArgIndex || 0;
	return {
		apply (target, ctx, args) {
			let path = args[index];
			path = mergePath(path);
			mkdir(path);
			let _args = [...args.slice(0, index), path, ...args.slice(index + 1)];
			return Reflect.apply(target, ctx, _args);
		}
	};
}

function mergePath(path) {
	return join(
		path.replace(/\$\{__dirname\}/, __dirname)
		.replace(/\$\{year\}/, timer.currentYear())
		.replace(/\$\{month\}/, timer.currentMonth())
		.replace(/\$\{date\}/, timer.currentDate())
		.replace(/\$\{time\}/, timer.current()));
}
function mkdir(path) {
	let dirs = dirname(path).split(sep);
	let currentDir = dirs[0];
	for (let i = 1; i < dirs.length; i ++) {
		currentDir = join(currentDir, dirs[i]);
		if (!fs.existsSync(currentDir)) {
			fs.mkdirSync(currentDir);
		}
	}
}


module.exports = { logger, timer, trigger, noop, writeFileSync, createWriteStream, XPLBLogger };
