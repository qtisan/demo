const logger = require('../../utils').logger;

const computeWetness = requrie('./wetness_compute');

function Hook(func) {
  this.funcs = {
    'defaults': func || () => {}
  };
  return this;
}
Hook.portotype.add = function (name, func) {
  if (typeof name === 'string' && typeof func === 'function') {
    this.funcs[name] && logger.warn(`the hook ${name} exists, and has been overrided.`);
    this.funcs[name] = func;
  }
  return this;
};
Hook.pototype.remove = function (name) {
  if (this.funcs[name]) {
    delete this.funcs[name];
  }
  return this;
}

const handleCompute = (objs, hooks) => {
  const { siteWetnessList, siteInfectList, siteOccurList } = objs;
  const {
    onStart,
    onWetnessComputeStart,
    onWetnessComputeEnd,
    onWetnessSingleComputeStart,
    onWetnessSingleComputeEnd,
    onWetnessSingleHourComputeStart,
    onWetnessSingleHourComputeInterrupt,
    onInfectComputeStart,
    onInfectComputeEnd,
    onInfectSingleComputeStart,
    onInfectSingleComputeEnd,
    onOccurComputeStart,
    onOccurComputeEnd,
    onOccurSingleComputeStart,
    onOccurSingleComputeEnd,
    onEnd
  } = hooks;
  return (weatherSiteList) => {
    typeof onStart === 'function' && onStart(siteWetnessList, siteInfectList, siteOccurList);

    typeof onEnd === 'function' && onEnd(siteWetnessList, siteInfectList, siteOccurList);
  }
};

module.exports = { handleCompute, Hook };
