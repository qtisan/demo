const {trigger, logger} = require('../../utils');
const computeWetness = require('./compute_wetness').compute;

class Hook {

	constructor(func) {
		this.funcs = {
			'defaults': func || (() => {})
		};
	}

	add(name, func) {
		if (typeof name === 'string' && typeof func === 'function') {
			this.funcs[name] && logger.warn(`the hook ${name} exists, and has been overrided.`);
			this.funcs[name] = func;
		}
		return this;
	}

	remove (name) {
		if (this.funcs[name]) {
			delete this.funcs[name];
		}
		return this;
	}
}

const handleCompute = (objs, hooks) => {
  const { siteWetnessList, siteInfectList, siteOccurList } = objs;
  const {
    onStart,
	  onSingleSiteComputeStart,
	  onSingleSiteComputeEnd,
	  onWetnessComputeStart,
	  onWetnessComputeInterrupt,
	  onWetnessComputeEnd,
    onInfectComputeStart,
    onInfectComputeEnd,
    onEnd
  } = hooks;
  return (weatherSiteList) => {
    trigger(onStart, { siteWetnessList, siteInfectList, siteOccurList });

	  weatherSiteList.site_list.forEach(site => {
		  let siteId = site.site_id;
		  let forecast = site.forecast;
		  let siteWetness = siteWetnessList.getSite(siteId);

		  trigger(onSingleSiteComputeStart, { weatherSite: site, siteWetness });
		  forecast.forEach(weather => {
			  computeWetness(weather, siteWetness, {
				  onWetnessComputeStart,
				  onWetnessComputeInterrupt: (...eventArgs) => {
					  trigger.apply(this, [onWetnessComputeInterrupt, ...eventArgs]);
					  let {weather1Hour, siteWetness} = eventArgs[0];
						trigger(onInfectComputeStart, {weather1Hour, siteWetness});
					  
				  },
				  onWetnessComputeEnd});
		  });
		  trigger(onSingleSiteComputeEnd, { weatherSite: site, siteWetness });

	  });

    trigger(onEnd, { siteWetnessList, siteInfectList, siteOccurList });
  }
};

module.exports = { handleCompute, Hook };
