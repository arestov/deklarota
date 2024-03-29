
import { doCopy } from '../../../spv/cloneObj'

// var NestReqMap = null

// var NestSelector = require('../nest_sel/item');
// var NestCntDeclr = require('../nest_conj/item')
// var NestDcl = require('../nest/item');
// var NestCompx = require('../nest_compx/item')
import NestReqMap from './legacy/nest_req/dcl'

import { netsources_of_nestings, ___dcl_eff_consume_req_nest } from './legacy/nest_req/rebuild'
import StateReqMap from './legacy/state_req/dcl'
import { _states_reqs_index, netsources_of_states, ___dcl_eff_consume_req_st } from './legacy/state_req/rebuild'
import StateBindDeclr from './legacy/subscribe/dcl'
import { __fxs_subscribe_by_name, __fxs_subscribe_by_api, __api_root_dep_apis_subscribe_eff } from './legacy/subscribe/rebuild'
import ProduceEffectDeclr, { getEffectsTriggeringAttrs } from './legacy/produce/dcl'
import { __api_effects_out, __api_root_dep_apis } from './legacy/produce/rebuild'
import { $attrs$from_apis$expected_input, __apis_$_index, __apis_$_usual, __apis_$__needs_root_apis, __apis_$__needs_self,
  __defined_api_attrs_bool, ___dcl_eff_api } from './legacy/api/rebuild'
import ApiDeclr from './legacy/api/dcl'

import parseCompItems from '../attrs/comp/parseItems'
import cachedField, { cacheFields } from '../cachedField'
import copyWithSymbols from '../copyWithSymbols'
import getDepsToInsert from './legacy/api/utils/getDepsToInsert'
import emptyArray from '../../emptyArray'
import { __dcls_extended_fxs } from './rel-api-glue'
import { fxByNameP, fxListP } from './fxP'

// var buildSel = require('../nest_sel/build');


const parse = function(type, name, data, __isView) {
  switch (type) {
    case 'consume-state_request': {
      return new StateReqMap(name, data)
    }
    case 'consume-nest_request': {
      return new NestReqMap(name, data)
    }
    case 'consume-subscribe': {
      return new StateBindDeclr(name, data, __isView)
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

const extend = function(prefix, index, more_effects, __isView) {
  const cur = doCopy({}, index) || {}
  const prefix_string = prefix ? (prefix + '-') : ''

  for (const name in more_effects) {
    const data = more_effects[name]
    const type = prefix_string + (data.type || '')
    const dcl = parse(type, name, data, __isView)
    cur[name] = {
      dcl: dcl,
      type: type,
    }
  }

  return cur
}

const byType = function(index) {
  const result = {}
  for (const name in index) {
    if (!index.hasOwnProperty(name)) {
      continue
    }

    const cur = index[name]
    const type = cur.type

    result[type] = result[type] || {}
    result[type][name] = cur.dcl
  }

  return result
}


const notEqual = function(one, two) {
  if (!one || !two) {
    return one !== two
  }

  for (const name in one) {
    if (!one.hasOwnProperty(name)) {
      continue
    }
    if (one[name] !== two[name]) {
      return true
    }
  }

  for (const name in two) {
    if (!two.hasOwnProperty(name)) {
      continue
    }

    if (one[name] !== two[name]) {
      return true
    }
  }
}

const ___dcl_eff_produce = [
  ['__api_effects'],
  (effects) => {
    const extended_comp_attrs = {}

    getDepsToInsert(effects, extended_comp_attrs)


    /*
      not very good,
      but lets make comp attr with all triggering attrs, so it will be provided by glue sources
      goal: make attrs of triggering with rels work (comp attrs glue will do that work)
    */
    extended_comp_attrs.__fx_out_triggering_attrs = [
      getEffectsTriggeringAttrs(effects),
      Boolean,
    ]

    parseCompItems(extended_comp_attrs)
    return extended_comp_attrs
  }
]

const rebuildType = function(self, type, result, list) {
  switch (type) {
    case 'consume-state_request': {
      self._states_reqs_list = list
      return
    }
    case 'consume-nest_request': {
      self._nest_reqs = result
      return
    }
    case 'consume-subscribe': {
      self[fxListP(type)] = list
      return
    }
    case 'produce-': {
      self[fxByNameP(type)] = result
      return
    }
    case 'api-': {
      self[fxByNameP(type)] = result
    }
  }
}

const handleUserDcls = function(self, newV, oldV, listByType) {
  for (const type in newV) {
    if (!newV.hasOwnProperty(type)) {
      continue
    }

    if (!notEqual(newV[type], oldV[type])) {
      continue
    }

    rebuildType(self, type, newV[type], listByType[type])
  }
}

const checkModern = function(self) {
  if (!self.hasOwnProperty('effects')) {
    return
  }
  const effects = self.effects

  self._extendable_effect_index = extend(
    'consume',
    self._extendable_effect_index,
    effects.in,
    self.__isView,
  )

  self._extendable_effect_index = extend(
    'produce',
    self._extendable_effect_index,
    effects.out,
    self.__isView,
  )

  self._extendable_effect_index = extend(
    'api',
    self._extendable_effect_index,
    effects.api,
    self.__isView,
  )
}

const __dcls_comp_attrs_from_effects = [
  ['___dcl_eff_consume_req_st', '___dcl_eff_consume_req_nest', '___dcl_eff_produce', '___dcl_eff_api'],
  function collectCheck(s1, s2, s3, s4) {
    const result = {}

    doCopy(result, s1)
    doCopy(result, s2)
    copyWithSymbols(result, s3)
    copyWithSymbols(result, s4)

    return result
  }
]

const __dcls_list_api_to_connect = [
  ['__apis_$__needs_root_apis', '__api_root_dep_apis', '__api_root_dep_apis_subscribe_eff'],
  (l1, l2, l3) => {
    const uniq = new Set([
      ...(l1 || emptyArray),
      ...(l2 || emptyArray),
      ...(l3 || emptyArray),
    ])

    return [...uniq]
  },
]

const netsources_of_all = [
  ['netsources_of_nestings', 'netsources_of_states'],
  (netsources_of_nestings, netsources_of_states) => {
    return {
      nestings: netsources_of_nestings,
      states: netsources_of_states
    }
  },
]

const checkListed = cachedField('_effect_by_type_listed', ['_effect_by_type'], false, (_effect_by_type) => {
  const _effect_by_type_listed = {}
  for (const type_name in _effect_by_type) {
    if (!_effect_by_type.hasOwnProperty(type_name)) {
      continue
    }

    const result = []

    const cur = _effect_by_type[type_name]
    for (const effect_name in cur) {
      if (!cur.hasOwnProperty(effect_name)) {
        continue
      }
      result.push(cur[effect_name])
    }

    _effect_by_type_listed[type_name] = result

  }
  return _effect_by_type_listed
})

const compDclsSchema = {
  __apis_$__needs_root_apis,
  __api_root_dep_apis,
  __api_root_dep_apis_subscribe_eff,
  __dcls_list_api_to_connect,

  __dcls_extended_fxs,
}

const schema = {
  _states_reqs_index,
  netsources_of_states,

  netsources_of_nestings,

  __fxs_subscribe_by_name,
  __fxs_subscribe_by_api,

  __api_effects: [
    [
      /* effects from user */
      fxByNameP('produce-'),

      /*
        effects from dkt
        only "self" as api to execute, but parent/root attrs as deps
      */
      '__dcls_extended_fxs'
    ],
    (arg1, arg2) => ({
      ...arg1,
      ...arg2,
    }),
  ],
  __api_effects_out,

  __apis_$_index, __apis_$_usual, __apis_$__needs_self,

  ___dcl_eff_consume_req_st,
  ___dcl_eff_consume_req_nest,

  ___dcl_eff_produce,

  ___dcl_eff_api,
  __defined_api_attrs_bool,

  netsources_of_all,
  __dcls_comp_attrs_from_effects,

  $attrs$from_apis$expected_input,
}

const makeSchemaPartsFromAllDcls = (self) => {
  cacheFields(schema, self)
}

const makeCompDcls = (self) => {
  cacheFields(compDclsSchema, self)
}

export default function checkEffects(self, props) {
  const currentIndex = self._extendable_effect_index

  checkModern(self, props)

  if (currentIndex === self._extendable_effect_index) {
    return
  }

  const oldByType = self._effect_by_type || {}
  self._effect_by_type = byType(self._extendable_effect_index)

  checkListed(self)

  handleUserDcls(self, self._effect_by_type, oldByType, self._effect_by_type_listed)
  makeCompDcls(self)
  makeSchemaPartsFromAllDcls(self)

  return true
}
