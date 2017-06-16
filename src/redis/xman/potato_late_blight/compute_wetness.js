
const {timer, trigger, logger} = require('../../utils');

const getSolutionInfect = require('../../data/solution_infect');

const computeSingle = (siteWetness, {time, temp, humid}, solution,
  { onWetnessSingleHourComputeStart,
    onWetnessSingleHourComputeInterrupt,
    onWetnessSingleHourComputeEnd }
) => {

  trigger(onWetnessSingleHourComputeStart, {
    siteWetness,
    weather1Hour: {time, temp, humid},
    solution });

  // TODO: is the time continously ?
  let last = siteWetness.last_time;
  let interrupt = (() => {
    let i = solution.humidInterrupt, res = '';
    while (i --) {
      res += '0';
    }
    return res;
  })();
  siteWetness.continous += (humid >= solution.humidBound ? '1' : '0');
  siteWetness.humid_array.push(humid);
  siteWetness.temp_avg = (siteWetness.temp_avg * last + temp) / (last + 1);
  siteWetness.last_time += 1;
  if (siteWetness.continous.indexOf(interrupt) != -1) {
    siteWetness.end_time = timer.earlier(3, time);
    siteWetness.start_time = time;
    siteWetness.last_time -= 3;
    trigger(onWetnessSingleHourComputeInterrupt, {
      siteWetness,
      weather1Hour: {time, temp, humid},
      solution });
    clearSiteWetness(siteWetness);
  }
  trigger(onWetnessSingleHourComputeEnd, {
    siteWetness,
    weather1Hour: {time, temp, humid},
    solution });
};

function clearSiteWetness (siteWetness) {
  siteWetness.continous = '';
  siteWetness.humid_array = [];
  siteWetness.temp_avg = 0;
  siteWetness.start_time = timer.later(1);
  siteWetness.end_time = '';
  siteWetness.last_time = 0;
}

module.exports = {
  computeSingle,
  compute: (siteWetness, siteWeather) => {
    let solution = getSolutionInfect(siteWetness.site_id);
  }
};
