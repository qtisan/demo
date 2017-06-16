
const moment = require('moment');

const logger = {
  info: console.info,
  warn: console.warn,
  error: console.error,
  log: console.log,
  start: console.time,
  end: console.timeEnd
};

const defaultFormat = 'YYYYMMDDHHmmss';
const timer = {
  current: () => moment().format(defaultFormat),
  later: (hour, base) => (base ? moment(translateDatetimeFromString(base)) : moment()).add(hour || 0, 'hour').format(defaultFormat),
  earlier: (hour, base) => (base ? moment(translateDatetimeFromString(base)) : moment()).subtract(hour || 0, 'hour').format(defaultFormat),
  sameHour: (time1, time2) => time1.slice(8, 10) == time2.slice(8, 10),
  sameDay: (time1, time2) => time1.slice(6, 8) == time2.slice(6, 8)
};

const trigger = (func, ...args) => typeof func === 'function' && func.apply(this, args);

function translateDatetimeFromString(dateString) {
	let result = '';
	if (typeof dateString == 'string' && dateString.length == 14) {
		result = [ dateString.slice(0, 8), dateString.slice(8) ].join(' ');
	}
	return result;
}

module.exports = { logger, timer, trigger };
