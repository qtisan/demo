const {XPLBLogger: logger} = require('../../../utils');

// TODO: modify the function, by the redis cache functions & export different types in saving and loading.
module.exports = {
  save: (name) => {
    logger.warn(`save ${name} to the redis cache...`);
  },
  load: (name) => {
    logger.warn(`load ${name} from the redis cache...`);
  }
};
