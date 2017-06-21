
const moment = require('moment');

// TODO: replace logger plugin with log server.
const logger = {
  info: (text) => console.info(withPid(text)),
  warn: (text) => console.warn(withPid(text)),
  error:(text) => console.error(withPid(text)),
  log: (text) => console.log(withPid(text)),
  start: (name, text) => {
	  text !== false && console.info(`${name} process start...`);
	  console.time(withPid(name));
	  text && console.info(text);
  },
  end: (name, text) => {
	  console.timeEnd(withPid(name));
	  text && console.info(text);
  }
};

const noop = () => {};

const defaultFormat = 'YYYYMMDDHHmmss',
			defaultFormatDate = 'YYYYMMDD';
// 处理时间字符串的方法
const timer = {
  current: (base) => (base ? moment(translateDatetimeFromString(base)) : moment()).format(defaultFormat),
	currentDate: (base) => (base ? moment(translateDatetimeFromString(base)) : moment()).format(defaultFormatDate),
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
function withPid (text) {
	return `[${process.pid}]-${text}`;
}

const trigger = (func, ...args) => typeof func === 'function' && func.apply(this, args);


module.exports = { logger, timer, trigger, noop };
