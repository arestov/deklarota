define(function(require) {
'use strict';
 // var getSPByPathTemplate = function(app, start_md, string_template, need_constr, md_for_urldata) {
var spv = require('spv');
var animateMapChanges = require('../probe/animateMapChanges')
var switchCurrentBwlev = animateMapChanges.switchCurrentBwlev;
var initDeclaredNestings = require('../../initDeclaredNestings');
var getSPByPathTemplate = initDeclaredNestings.getSPByPathTemplate;
var getModelById = require('../../utils/getModelById');
var createLevel = require('../../bwlev/createLevel');
var pvState = require('pv/state');
var getKey = require('./getKey');

var getPioneer = function(lev) {
  return lev && lev.getNesting('pioneer')
}

var changeCurrentLev = function(probe_md, next_lev, prev_lev) {
  probe_md.updateNesting('current_md', getPioneer(next_lev) || null);
  switchCurrentBwlev(next_lev, prev_lev);
  probe_md.updateNesting('current_bwlev', next_lev || null);
}

var getBWlev = function(probe_md, md) {
  return probe_md.bwlevs[md._provoda_id];
}

var ensureBwLev = function(BWL, probe_md, probe_name, md) {
  if (!probe_md.bwlevs.hasOwnProperty(md._provoda_id)) {
    probe_md.bwlevs[md._provoda_id] = createLevel(BWL, probe_name, -1, null, md, probe_md);
  }

  return getBWlev(probe_md, md);
};

var getProbeChange = function (toggle) {
  return function (BWL, bwlev, data) {
    // data.bwlev + data.context_md - optional
    var target_id = data.target_id; // required
    var probe_name = data.probe_name; // required
    var value = data.value; // optional
    var probe_container_uri = data.probe_container_uri // optional
    var req = data.req

    var app = bwlev.app;

    var target = getModelById(bwlev, target_id);

    // var probe_mds = bwlev.getNesting(transportName(probe_name));
    var index = pvState(bwlev, 'spyglasses_index');
    var probe_id = index[getKey({name: probe_name, bwlev: data.bwlev, context_md: data.context_md})];
    var probe_md = probe_id && getModelById(bwlev, probe_id);
    // var probe_md = spv.set.get(set, key);
    if (!probe_md) {
      return; // throw ?
    }

    var subpage;
    if (!value && !probe_container_uri) {
      subpage = target
    } else {
      var container = probe_container_uri ? getSPByPathTemplate(app, target, probe_container_uri) : target;
      subpage = getSPByPathTemplate(app, container, value);
    }

    var nested_bwlev = subpage && ensureBwLev(BWL, probe_md, probe_name, subpage);
    var prev_subpage = probe_md.getNesting('current_md');
    var prev_nested_bwlev = prev_subpage && getBWlev(probe_md, prev_subpage);

    if (nested_bwlev && req) {
      nested_bwlev.updateState('currentReq', req)
    }

    if (!toggle) {
      changeCurrentLev(probe_md, nested_bwlev, prev_nested_bwlev)
      return;
    }

    var cur = probe_md.getNesting('current_md');
    if (cur === subpage) {
      changeCurrentLev(probe_md, null, prev_nested_bwlev)
    } else {
      changeCurrentLev(probe_md, nested_bwlev, prev_nested_bwlev)
    }

  };
};

var updateProbe = getProbeChange();
var toggleProbe = getProbeChange(true);
updateProbe.toggle = toggleProbe;

return updateProbe;
});
