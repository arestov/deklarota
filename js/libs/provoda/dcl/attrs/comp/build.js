import groupDeps from './groupDeps'
import getEncodedState from '../../../utils/getEncodedState'
import asString from '../../../utils/multiPath/asString'
import mentionsSupportedAddr from '../../../Model/mentions/supportedAttrTargetAddr'
import isJustAttrAddr from '../../../utils/multiPath/isJustAttrAddr'

import isGlueTargetAttr from './isGlueTargetAttr'
import cachedField from '../../cachedField'

var makeGroups = groupDeps(getEncodedState)
const emptyObject = Object.freeze({})

const compressList = (result, prop) => {
  if (result[prop].length == 1) {
    result[prop] = result[prop][0]
  } else {
    Object.freeze(result[prop])
  }
}

var makeWatchIndex = function(full_comlxs_list) {
  if (!full_comlxs_list.length) {
    return emptyObject
  }
  var full_comlxs_index = {}
  var i, jj, cur, state_name
  for (i = 0; i < full_comlxs_list.length; i++) {
    cur = full_comlxs_list[i]
    for (jj = 0; jj < cur.watch_list.length; jj++) {
      state_name = cur.watch_list[jj]
      if (state_name === cur.name) {continue}
      if (!full_comlxs_index[state_name]) {
        full_comlxs_index[state_name] = []
      }
      full_comlxs_index[state_name].push(cur)
    }
  }

  for (var attr_name in full_comlxs_index) {
    if (!full_comlxs_index.hasOwnProperty(attr_name)) {
      continue
    }

    compressList(full_comlxs_index, attr_name)
  }

  for (var prop of Object.getOwnPropertySymbols(full_comlxs_index)) {
    compressList(full_comlxs_index, prop)
  }

  Object.freeze(full_comlxs_index)

  return full_comlxs_index
}

var collectCheck = cachedField(
  'compx_check',
  ['__attrs_all_comp'],
  false,
  function collectCheck(dcl_cache__compx) {
    var compx_check = {}

    for (var key_name_one in dcl_cache__compx) {
      compx_check[key_name_one] = dcl_cache__compx[key_name_one]
    }

    for (var prop of Object.getOwnPropertySymbols(dcl_cache__compx)) {
      compx_check[prop] = dcl_cache__compx[prop]
    }


    return compx_check
  }
)

var collectList = cachedField(
  'full_comlxs_list',
  ['__attrs_all_comp'],
  false,
  function collectList(dcl_cache__compx) {
    var full_comlxs_list = []

    for (var key_name_one in dcl_cache__compx) {
      full_comlxs_list.push(dcl_cache__compx[key_name_one])
    }

    for (var prop of Object.getOwnPropertySymbols(dcl_cache__compx)) {
      full_comlxs_list.push(dcl_cache__compx[prop])
    }

    return full_comlxs_list
  }
)

export default function(self) {
  if (!self.hasOwnProperty('__attrs_all_comp')) {return}

  collectCheck(self)
  collectList(self)
  self.full_comlxs_index = makeWatchIndex(self.full_comlxs_list)

  collectStatesConnectionsProps(self, self.full_comlxs_list)

  return true
}

function uniqExternalDeps(full_comlxs_list) {
  var uniq = new Map()

  for (var i = 0; i < full_comlxs_list.length; i++) {
    var cur = full_comlxs_list[i]
    for (var jj = 0; jj < cur.addrs.length; jj++) {
      var addr = cur.addrs[jj]
      if (isJustAttrAddr(addr)) {
        continue
      }

      if (isGlueTargetAttr(addr)) {
        continue
      }

      const key = asString(addr)

      if (uniq.has(key)) {
        continue
      }

      uniq.set(key, addr)
    }
  }

  return [...uniq.values()]
}

function collectStatesConnectionsProps(self, full_comlxs_list) {
  /*

  [['^visible', '@some:complete:list', '#vk_id'], function(visible, complete){

  }]
  */
  /*
      nest_match: [
    ['songs-list', 'mf_cor', 'sorted_completcs']
  ]
  */
  self.__attrs_full_comlxs_list = full_comlxs_list
  self.__attrs_uniq_external_deps = uniqExternalDeps(full_comlxs_list)

  var result = makeGroups(full_comlxs_list)

  for (var i = 0; i < result.conndst_nesting.length; i++) {
    var addr = result.conndst_nesting[i].addr
    if (mentionsSupportedAddr(addr)) {
      continue
    }

    throw new Error('should not be reason to use legacy nestwatch')
  }

  self.connect_self = result.connect_self

  self.conndst_parent = result.conndst_parent
  self.conndst_nesting = result.conndst_nesting
  self.conndst_root = result.conndst_root
  self.__temp_connect_glue = result.connect_glue
}
