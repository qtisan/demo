const {XPLBLogger: logger} = require('../../../utils');

// TODO: modify the function, by the mysql database functions & export different types in saving.
module.exports = (name) => {
  logger.warn(`save ${name} result to the mysql database...`);
};
