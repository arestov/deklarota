import { doCopy } from '../../../../spv/cloneObj'
import groupDeps from './groupDeps'
import getEncodedState from '../../../utils/getEncodedState'
import asString from '../../../utils/multiPath/asString'
import mentionsSupportedAddr from '../../../Model/mentions/supportedAttrTargetAddr'
import isJustAttrAddr from './isJustAttrAddr'
import isGlueTargetAttr from './isGlueTargetAttr'
import cachedField from '../../cachedField'

var makeGroups = groupDeps(getEncodedState)

var collectBuildParts = function(self) {
  var compx_check = {}
  var full_comlxs_list = []

  for (var key_name_one in self._dcl_cache__compx) {
    compx_check[key_name_one] = self._dcl_cache__compx[key_name_one]
    full_comlxs_list.push(compx_check[key_name_one])
  }

  self.compx_check = compx_check
  self.full_comlxs_list = full_comlxs_list
}

var makeWatchIndex = function(full_comlxs_list) {
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
  return full_comlxs_index
}

var extendTyped = cachedField(
  '_dcl_cache__compx',
  ['_dcl_cache__compx', '__attrs_added_comp'],
  false,
  function extendTyped(dcl_cache__compx, typed_state_dcls) {
    var result = doCopy(null, dcl_cache__compx) || {}
    result = doCopy(result, typed_state_dcls)

    return result
  }
)

export default function(self, props, typed_part) {
  if (!typed_part) {
    return
  }

  self.__attrs_added_comp = typed_part

  extendTyped(self)

  collectBuildParts(self)
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
