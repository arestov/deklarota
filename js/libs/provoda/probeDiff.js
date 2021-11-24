
import getNesting from './provoda/getNesting'
import getParentsBranch from './bwlev/getParentsBranch'

const getModelByIdUniversal = function(highway_holder, _provoda_id) {
  const _highway = highway_holder._highway
  if (_highway.models) {
    return _highway.models[_provoda_id]
  }

  if (!_highway.views_proxies) {
    return _highway.sync_r.models_index[_provoda_id]
  }

  const view = highway_holder
  const proxies_space = view.proxies_space || view.root_view.proxies_space
  const mpx = _highway.views_proxies.spaces[proxies_space].mpxes_index[_provoda_id]
  return mpx.md
}

const getModelByR = function(highway_holder, mdr) {
  const _provoda_id = mdr._provoda_id
  return getModelByIdUniversal(highway_holder, _provoda_id)
}

export const getBwlevsTree = function(highway_holder, mdrp) {
  return getParentsBranch(mdrp && getModelByR(highway_holder, mdrp))
}

export const isOneStepZoomIn = (list) => list.length == 1 && list[0].name == 'zoom-in' && list[0].changes.length < 3

const pathAsSteps = function(path, value) {
  if (!path) {return}
  const result = new Array(path.length)
  for (let i = 0; i < path.length; i++) {
    const cur = path[i]

    result[i] = {
      type: 'move-view',
      value: value,
      bwlev: cur.getMDReplacer(),
      target: getNesting(cur, 'pioneer').getMDReplacer()
    }
  }

  return result
}

function getClosestStep(value_full_path, oldvalue_full_path) {
  const length = Math.max(value_full_path.length, oldvalue_full_path.length)
  for (let i = 0; i < length; i++) {
    const curA = value_full_path[i]
    const curB = oldvalue_full_path[i]
    if (curA !== curB) {
      return i
    }
  }
}

const asMDR = function(md) {
  return md && md.getMDReplacer()
}

const last = (list) => list && list[list.length - 1]


const zooming = (value_full_path, oldvalue_full_path) => {
  const closest_step = getClosestStep(value_full_path, oldvalue_full_path)

  const value_path_to = closest_step != null && value_full_path.slice(closest_step)
  const oldvalue_path_from = closest_step != null && oldvalue_full_path.slice(closest_step).reverse()

  const changes_wrap = []
  if (oldvalue_path_from && oldvalue_path_from.length) {
    changes_wrap.push({
      name: 'zoom-out',
      changes: pathAsSteps(oldvalue_path_from, false)
    })
  }
  if (value_path_to && value_path_to.length) {
    changes_wrap.push({
      name: 'zoom-in',
      changes: pathAsSteps(value_path_to, true)
    })
  }

  return changes_wrap
}

export default function probeDiff(value_full_path, oldvalue_full_path) {

  const bwlev = last(value_full_path)
  const target = getNesting(bwlev, 'pioneer').getMDReplacer()


  const prev_bwlev = last(oldvalue_full_path)

  const changes_list = zooming(value_full_path, oldvalue_full_path)

  return {
    bwlev: bwlev?.getMDReplacer(),
    prev_bwlev: prev_bwlev?.getMDReplacer(),
    target: target,
    value_full_path: value_full_path.map(asMDR),
    oldvalue_full_path: oldvalue_full_path.map(asMDR),
    array: changes_list,
  }
}
