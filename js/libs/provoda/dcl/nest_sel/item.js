

import spv from '../../../spv'
import getShortStateName from '../../utils/getShortStateName'
import asMultiPath from '../../utils/NestingSourceDr/asMultiPath'
import createUpdatedAddr from '../../utils/multiPath/createUpdatedAddr'
import { createAddrByPart } from '../../utils/multiPath/parse'
import asString from '../../utils/multiPath/asString'

import CompxAttrDecl from '../attrs/comp/item'
import emptyArray from '../../emptyArray'

import relShape from '../nests/relShape'
import { calcRelSelByDcl } from './NestSelector'
import getParsedPath from '../../routes/legacy/getParsedPath'
import where from './where'
const push = Array.prototype.push

const startsWith = spv.startsWith

const types = ['sort', 'map', 'cond']

/*
EXAMPLE

{
  from: 'all_sources',
  where: {
    '>ready': [['=', 'boolean'], [true]]
  },
  sort: [
    ['>search_name', 'searches_pr'],
    function (one, two, base) {
      return byBestSearchIndex(one, two, pvState(base, 'searches_pr'));
    }
  ]
},

*/

const getMap = function(map_chunk) {
  if (typeof map_chunk != 'string') {
    return map_chunk
  }

  const from_distant_model = map_chunk.charAt(0) === '>'
  const path = from_distant_model ? map_chunk.slice(1) : map_chunk
  return {
    from_distant_model: from_distant_model,
    template: getParsedPath(path)
  }
}


const SelectNestingDeclaration = function(dest_name, data) {
  this.rel_shape = relShape(data.rel_shape)

  if (!this.rel_shape) {
    throw new Error('rel_shape is required')
  }

  this.map = null
  if (data.map) {
    this.map = getMap(data.map)
  }

  if (this.map && typeof this.map !== 'object') {
    throw new Error('unsupported map type')
  }
  const multi_path = createUpdatedAddr(asMultiPath(data.from), {zip_name: 'all'})

  this.dest_name = dest_name
  this.deps_dest = null
  this.source_state_names = null
  this.args_schema = null
  this.selectFn = null
  this.sortFn = null

  where(this, data.where)

  if (data.sort) {
    this.sortFn = data.sort[1]
  }

  this.deps = getDeps(data, this.map, this.where_states)

  const local = createAddrByPart({})
  const toBase = function(attr_name) {
    return createUpdatedAddr(local, {state: attr_name})
  }
  const toDeep = function(attr_name) {
    return createUpdatedAddr(multi_path, {state: attr_name})
  }

  const base_deps = this.deps.base.all.list
  const deep_deps = this.deps.deep.all.list

  const all_base_deps = base_deps ? base_deps.map(toBase) : []
  const all_deep_deps = deep_deps ? deep_deps.map(toDeep) : []

  const dcl = this
  const comp_attr_deps = ['<<<<', ...[multi_path, ...all_base_deps, ...all_deep_deps].map(asString)]
  const rel_name = '__/internal/rels//_/' + this.dest_name

  this.comp_attr = new CompxAttrDecl(rel_name, [comp_attr_deps, function calcRelSel(self, list) {
    const result = calcRelSelByDcl(dcl, self, list)
    if (result == null) {
      return result
    }
    if (!result.length) {
      return emptyArray
    }

    return result
  }])
}



function combineStates(obj) {
  const list = []
  const shorts = []

  for (let i = 0; i < types.length; i++) {
    const cur = types[i]
    if (obj[cur]) {
      push.apply(list, obj[cur].list)
      push.apply(shorts, obj[cur].shorts)
    }
  }

  return {
    list: list.length ? list : null,
    shorts: shorts.length ? shorts : null,
  }
}


function getDeps(data, map, where_states) {
  const base = {all: null}
  const deep = {all: null}

  getConditinal(base, deep, where_states)
  getMap2(base, deep, map)
  getSort(base, deep, data.sort)

  base.all = combineStates(base)
  deep.all = combineStates(deep)

  return {
    base: base,
    deep: deep,
  }
}

function getMap2(_base, deep, map) {
  if (!map) {return}

  deep.map = {
    list: map.states,
    shorts: map.states ? map.states.map(getShortStateName) : null
  }
}

function getSort(base, deep, sort) {
  if (!sort) {return}

  const state_names = getStates(sort[0])
  deep.sort = state_names.deep
  base.sort = state_names.base
}


function getConditinal(base, deep, list) {
  if (!list) {return}

  const state_names = getStates(list, true)
  deep.cond = state_names.deep
  base.cond = state_names.base
}

function getIndex(list) {
  const index = {}
  for (let i = 0; i < list.length; i++) {
    index[list[i]] = true
  }
  return index
}

function getStates(list, with_index) {
  const base = []
  const deep = []
  for (let i = 0; i < list.length; i++) {
    const cur = list[i]
    const state_name = isForDeep(cur)
    if (state_name) {
      deep.push(state_name)
    } else {
      base.push(cur)
    }
  }
  return {
    base: getComplect(base, with_index),
    deep: getComplect(deep, with_index)
  }
}

function getComplect(list, with_index) {
  if (!list.length) {return}
  const shorts = list.map(getShortStateName)
  return {
    list: list,
    shorts: shorts,
    index: with_index
      ? getIndex(shorts)
      : null
  }
}

function isForDeep(name) {
  return startsWith(name, '>') && name.slice(1)
}

export default SelectNestingDeclaration
