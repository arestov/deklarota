
import spv from '../../spv'
import Model from '../Model'
import initBWlev from '../bwlev/initBWlev'
import toProperNavParent from '../bwlev/toProperNavParent'
import routePathByModels from '../routePathByModels'
import getPrtsByRelPath from '../dcl/nests/getPrtsByRelPath'

const getSPI = routePathByModels.getSPI

/*
поправить навигацию
проверить работу истории
поправить остатки wantSong

генерируемые плейлисты

*/


const BrowseMap = {}


const interest_part = /(\#(?:\d*\:)?)/gi

export const getUserInterest = function(pth_string, start_md) {
  /*
    /users/me/lfm:neighbours#3:/users/lfm:kolczyk0
  */
  const parts = pth_string.split(interest_part)

  const interest = []

  while (parts.length) {
    const path = parts.pop()
    const distance_part = parts.pop()
    const distance = distance_part && distance_part.slice(1, distance_part.length - 1)
    interest.push({
      md: BrowseMap.routePathByModels(start_md, path),
      // path: path,
      distance: distance || 1
    })
  }

  return interest.reverse()
}

BrowseMap.routePathByModels = routePathByModels

BrowseMap.Model = spv.inh(Model, {
  strict: true,
  naming: function(fn) {
    return function BrowseMapModel(opts, data, params, more, states) {
      fn(this, opts, data, params, more, states)
    }
  },
  init: function() {},
}, {
  attrs: {
    'url_part': ['input', null],
    'nav_title': ['input', null],
    '$meta$perspective$each_show': ['input'],
    '$meta$perspective$each_focus': ['input'],
    mp_has_focus: ['input'],
    mp_show: ['input'],
  },
  handling_v2_init: true,
  '__required-nav_title': true,
  /*

  */
  getSPI: function(sp_name, options) {
    return getSPI(this, sp_name, options)
  },
  toProperNavParent: function() {
    return toProperNavParent(this)
  },
  getParentMapModel: function() {
    return this.map_parent
  },
})

export function hookSessionRoot(rootmd, _start_page, states) {
  const [{constructor: SessionRoot}] = getPrtsByRelPath(rootmd, ['$session_root'])
  if (!SessionRoot) {
    throw new Error('$session_root should be defined')
  }
  const bwlev_root = initBWlev(SessionRoot, rootmd, '', -2, null, null, undefined, states)
  return bwlev_root
}

export default BrowseMap
