
import spv from '../../spv'
import Model from '../Model'
import changeBridge from '../bwlev/changeBridge'
import initBWlev from '../bwlev/initBWlev'
import toProperNavParent from '../bwlev/toProperNavParent'
import showInterest from '../bwlev/showInterest'
import getBwlevFromParentBwlev from '../bwlev/getBwlevFromParentBwlev'
import routePathByModels from '../routePathByModels'
import getPrtsByRelPath from '../dcl/nests/getPrtsByRelPath'

const getSPIConstr = routePathByModels.getSPIConstr
const getSPI = routePathByModels.getSPI

/*
поправить навигацию
проверить работу истории
поправить остатки wantSong

генерируемые плейлисты

*/


const BrowseMap = {}


BrowseMap.getBwlevFromParentBwlev = getBwlevFromParentBwlev

BrowseMap.showInterest = showInterest

const interest_part = /(\#(?:\d*\:)?)/gi
BrowseMap.getUserInterest = function(pth_string, start_md) {
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
  getSPIConstr: function(sp_name) {
    return getSPIConstr(this, sp_name)
  },
  getSPI: function(sp_name, options) {
    return getSPI(this, sp_name, options)
  },
  preloadNestings: function(array) {
    //var full_list = [];
    for (let i = 0; i < array.length; i++) {
      const md = this.getNesting(array[i])
      if (md) {
        md.preloadStart()
      }

    }
  },
  toProperNavParent: function() {
    return toProperNavParent(this)
  },
  getParentMapModel: function() {
    return this.map_parent
  },
  getTitle: function() {
    return this.state('nav_title')
  },
  getURL: function() {
    return ''
  }
})

function hookRoot(rootmd, _start_page, states) {
  const [{constructor: SessionRoot}] = getPrtsByRelPath(rootmd, ['$session_root'])
  if (!SessionRoot) {
    throw new Error('$session_root should be defined')
  }
  const bwlev_root = initBWlev(SessionRoot, rootmd, '', -2, null, null, undefined, states)
  return bwlev_root
}

BrowseMap.hookRoot = hookRoot
BrowseMap.changeBridge = changeBridge
export default BrowseMap
