
import _updateRel from '../../_internal/_updateRel'

import { switchCurrentBwlev } from '../../bwlev/animateMapChanges'
import getSPByPathTemplate from '../../routes/legacy/getSPByPathTemplate'
import getModelById from '../../utils/getModelById'
import createLevel from '../../bwlev/createLevel'
import pvState from '../../provoda/state'
import _updateAttr from '../../_internal/_updateAttr'
import getKey from './getKey'
import getBWlev from '../../bwlev/getBWlev'

const getPioneer = function(lev) {
  return lev && lev.getNesting('pioneer')
}

const changeCurrentLev = function(probe_md, next_lev, prev_lev) {
  _updateRel(probe_md, 'current_mp_md', getPioneer(next_lev) || null)
  switchCurrentBwlev(next_lev, prev_lev)
  _updateRel(probe_md, 'current_mp_bwlev', next_lev || null)
}

const ensureBwLev = function(probe_md, probe_name, md) {
  if (!probe_md.bwlevs.hasOwnProperty(md._node_id)) {
    probe_md.bwlevs[md._node_id] = createLevel(probe_name, -1, null, md, probe_md)
  }

  return probe_md.bwlevs[md._node_id]
}

/*
  probe is perspectivator (router/map)
*/

const getProbeChange = function(toggle) {
  return function(bwlev, data) {
    // data.bwlev + data.context_md - optional
    const target_id = data.target_id // required
    const probe_name = data.probe_name // required
    const value = data.value // optional
    const probe_container_uri = data.probe_container_uri // optional
    const req = data.req

    const app = bwlev.app

    const target = getModelById(bwlev, target_id)

    // var probe_mds = bwlev.getNesting(transportName(probe_name));
    const index = pvState(bwlev, 'spyglasses_index')
    if (!index) {
      console.error(new Error('make router requqest before calling router'))
      return
    }
    const probe_id = index[getKey({name: probe_name, bwlev: data.bwlev, context_md: data.context_md})]
    const probe_md = probe_id && getModelById(bwlev, probe_id)
    // var probe_md = spv.set.get(set, key);
    if (!probe_md) {
      return // throw ?
    }

    let subpage
    if (!value && !probe_container_uri) {
      subpage = target
    } else {
      const container = probe_container_uri ? getSPByPathTemplate(app, target, probe_container_uri) : target
      subpage = getSPByPathTemplate(app, container, value)
    }

    const nested_bwlev = subpage && ensureBwLev(probe_md, probe_name, subpage)
    const prev_subpage = probe_md.getNesting('current_mp_md')
    const prev_nested_bwlev = prev_subpage && getBWlev(probe_md, prev_subpage)

    if (nested_bwlev && req) {
      _updateAttr(nested_bwlev, 'currentReq', req)
    }

    if (!toggle) {
      changeCurrentLev(probe_md, nested_bwlev, prev_nested_bwlev)
      return
    }

    const cur = probe_md.getNesting('current_mp_md')
    if (cur === subpage) {
      changeCurrentLev(probe_md, null, prev_nested_bwlev)
    } else {
      changeCurrentLev(probe_md, nested_bwlev, prev_nested_bwlev)
    }

  }
}

const updateProbe = getProbeChange()
const toggleProbe = getProbeChange(true)
updateProbe.toggle = toggleProbe

export default updateProbe
