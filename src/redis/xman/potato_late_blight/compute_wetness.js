
const {timer, trigger, logger} = require('../../utils');


const compute = (weather1Hour, siteWetness,
  { onWetnessComputeStart,
    onWetnessComputeInterrupt,
    onWetnessComputeEnd }
) => {

  trigger(onWetnessComputeStart, { weather1Hour, siteWetness });

  siteWetness.update(weather1Hour, onWetnessComputeInterrupt);

  trigger(onWetnessComputeEnd, { weather1Hour, siteWetness });
};


module.exports = {
  compute
};
