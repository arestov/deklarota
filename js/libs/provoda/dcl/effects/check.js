
import { doCopy } from '../../../spv/cloneObj'

// var NestReqMap = null

// var NestSelector = require('../nest_sel/item');
// var NestCntDeclr = require('../nest_conj/item')
// var NestDcl = require('../nest/item');
// var NestCompx = require('../nest_compx/item')
import NestReqMap from './legacy/nest_req/dcl'

import buildNestReqs from './legacy/nest_req/rebuild'
import StateReqMap from './legacy/state_req/dcl'
import buildStateReqs from './legacy/state_req/rebuild'
import StateBindDeclr from './legacy/subscribe/dcl'
import buildSubscribes from './legacy/subscribe/rebuild'
import ProduceEffectDeclr from './legacy/produce/dcl'
import buildProduce from './legacy/produce/rebuild'
import buildApi from './legacy/api/rebuild'
import ApiDeclr from './legacy/api/dcl'

import parseCompItems from '../attrs/comp/parseItems'
import cachedField from '../cachedField'
import copyWithSymbols from '../copyWithSymbols'

// var buildSel = require('../nest_sel/build');


var parse = function(type, name, data) {
  switch (type) {
    case 'consume-state_request': {
      return new StateReqMap(name, data)
    }
    case 'consume-nest_request': {
      return new NestReqMap(name, data)
    }
    case 'consume-subscribe': {
      return new StateBindDeclr(name, data)
    }
    case 'produce-': {
      return new ProduceEffectDeclr(name, data)
    }
    case 'api-': {
      return new ApiDeclr(name, data)
    }
  }

  throw new Error('unsupported type ' + type)
}

var extend = function(prefix, index, more_effects) {
  var cur = doCopy({}, index) || {}
  var prefix_string = prefix ? (prefix + '-') : ''

  for (var name in more_effects) {
    var data = more_effects[name]
    var type = prefix_string + (data.type || '')
    var dcl = parse(type, name, data)
    cur[name] = {
      dcl: dcl,
      type: type,
    }
  }

  return cur
}

var byType = function(index) {
  var result = {}
  for (var name in index) {
    if (!index.hasOwnProperty(name)) {
      continue
    }

    var cur = index[name]
    var type = cur.type

    result[type] = result[type] || {}
    result[type][name] = cur.dcl
  }

  return result
}


var notEqual = function(one, two) {
  if (!one || !two) {
    return one !== two
  }

  for (var name in one) {
    if (!one.hasOwnProperty(name)) {
      continue
    }
    if (one[name] !== two[name]) {
      return true
    }
  }

  for (var name in two) {
    if (!two.hasOwnProperty(name)) {
      continue
    }

    if (one[name] !== two[name]) {
      return true
    }
  }
}

var rebuildType = function(self, type, result, list) {
  switch (type) {
    case 'consume-state_request': {
      let extended_comp_attrs = {}
      buildStateReqs(self, list, extended_comp_attrs)
      parseCompItems(extended_comp_attrs)
      self.___dcl_eff_consume_req_st = extended_comp_attrs
      return
    }
    case 'consume-nest_request': {
      let extended_comp_attrs = {}
      buildNestReqs(self, result, extended_comp_attrs)
      parseCompItems(extended_comp_attrs)
      self.___dcl_eff_consume_req_nest = extended_comp_attrs
      return
    }
    case 'consume-subscribe': {
      buildSubscribes(self, list)
      return
    }
    case 'produce-': {
      let extended_comp_attrs = {}
      buildProduce(self, result, extended_comp_attrs)
      parseCompItems(extended_comp_attrs)
      self.___dcl_eff_produce = extended_comp_attrs
      return
    }
    case 'api-': {
      let extended_comp_attrs = {}
      buildApi(self, result, extended_comp_attrs)
      parseCompItems(extended_comp_attrs)
      self.___dcl_eff_api = extended_comp_attrs
    }
  }
}

var rebuild = function(self, newV, oldV, listByType) {
  for (var type in newV) {
    if (!newV.hasOwnProperty(type)) {
      continue
    }

    if (!notEqual(newV[type], oldV[type])) {
      continue
    }

    rebuildType(self, type, newV[type], listByType[type])
  }
}

var checkModern = function(self) {
  if (!self.hasOwnProperty('effects')) {
    return
  }
  var effects = self.effects

  self._extendable_effect_index = extend(
    'consume',
    self._extendable_effect_index,
    effects.in
  )

  self._extendable_effect_index = extend(
    'produce',
    self._extendable_effect_index,
    effects.out
  )

  self._extendable_effect_index = extend(
    'api',
    self._extendable_effect_index,
    effects.api
  )
}


const fxAttrs = cachedField(
  '__dcls_comp_attrs_from_effects',
  ['___dcl_eff_consume_req_st', '___dcl_eff_consume_req_nest', '___dcl_eff_produce', '___dcl_eff_api'],
  false,
  function collectCheck(s1, s2, s3, s4) {
    let result = {}

    doCopy(result, s1)
    doCopy(result, s2)
    copyWithSymbols(result, s3)
    copyWithSymbols(result, s4)

    return result
  }
)

const checkNetworkSources = cachedField(
  'netsources_of_all',
  ['netsources_of_nestings', 'netsources_of_states'],
  false,
  (netsources_of_nestings, netsources_of_states) => {
    return {
      nestings: netsources_of_nestings,
      states: netsources_of_states
    }
  }
)

const checkListed = cachedField('_effect_by_type_listed', ['_effect_by_type'], false, (_effect_by_type) => {
  var _effect_by_type_listed = {}
  for (var type_name in _effect_by_type) {
    if (!_effect_by_type.hasOwnProperty(type_name)) {
      continue
    }

    var result = []

    var cur = _effect_by_type[type_name]
    for (var effect_name in cur) {
      if (!cur.hasOwnProperty(effect_name)) {
        continue
      }
      result.push(cur[effect_name])
    }

    _effect_by_type_listed[type_name] = result

  }
  return _effect_by_type_listed
})

export default function checkEffects(self, props) {
  var currentIndex = self._extendable_effect_index

  checkModern(self, props)

  if (currentIndex === self._extendable_effect_index) {
    return
  }

  var oldByType = self._effect_by_type || {}
  self._effect_by_type = byType(self._extendable_effect_index)

  checkListed(self)

  rebuild(self, self._effect_by_type, oldByType, self._effect_by_type_listed)

  checkNetworkSources(self)

  fxAttrs(self)

  return true
}
