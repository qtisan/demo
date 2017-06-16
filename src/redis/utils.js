
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
  later: (hour, base) => (base ? moment(base) : moment()).add(hour || 0, 'hour').format(defaultFormat),
  earlier: (hour, base) => (base ? moment(base) : moment()).subtract(hour || 0, 'hour').format(defaultFormat),
  sameHour: (time1, time2) => time1.slice(8, 10) == time2.slice(8, 10),
  sameDay: (time1, time2) => time1.slice(6, 8) == time2.slice(6, 8)
};

const trigger = (func, ...args) => return typeof func === 'function' && func.apply(this, args);

module.exports = { logger, timer, trigger };
