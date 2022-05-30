import spv from '../../../spv'
import cachedField, { cacheFields } from '../cachedField'

import NestSelector from '../nest_sel/item'
import NestCntDeclr from '../nest_conj/item'
import NestDcl from '../nest/item'
import NestCompx from '../nest_compx/item'
import NestModel from '../nest_model/item'
import NestInput from './input/item'

import buildNest, { $comp_attrs$derived$from_idle_rels, $actions$derived$from_idle_rels, $rels$idle } from '../nest/build'
import buildModel from '../nest_model/build'
const cloneObj = spv.cloneObj

const parse = function(name, data) {
  if (!data) {
    // allow to erase item
    return null
  }
  const type = data[0]
  switch (type) {
    case 'nest': {
      if (!data[1]) {
        // allow to erase legacy internal cache
        return null
      }
      return data[1] && new NestDcl(name, data[1])
    }
    case 'conj': {
      return new NestCntDeclr(name, data)
    }
    case 'sel': {
      return new NestSelector(name, data[1])
    }
    case 'compx': {
      console.error(new Error('use "comp"'), data)
      return new NestCompx(name, data)
    }
    case 'comp': {
      return new NestCompx(name, data)
    }
    case 'model': {
      return new NestModel(name, data[1], data[2])
    }
    case 'input': {
      return new NestInput(name, data)
    }
  }

  throw new Error('unsupported type ' + type)
}

const extend = function(index, more_nests) {
  const cur = cloneObj({}, index) || {}

  for (const name in more_nests) {
    const data = more_nests[name]
    if (!data) {
      console.warn('implement nest erasing for: ', name)
      continue
    }

    const dcl = parse(name, data)
    cur[name] = {
      dcl: dcl,
      type: data[0],
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

const rebuildType = function(self, type, result) {
  switch (type) {
    case 'nest': {
      buildNest(self, result)
      return
    }
    case 'model': {
      buildModel(self, result)
      return
    }
  }
}

const rebuild = function(self, newV, oldV) {
  for (const type in newV) {
    if (!newV.hasOwnProperty(type)) {
      continue
    }

    if (!notEqual(newV[type], oldV[type])) {
      continue
    }

    rebuildType(self, type, newV[type])
  }
}

const checkModern = function(self) {
  const rels = self.hasOwnProperty('rels') && self.rels
  if (!rels) {
    return
  }

  self._extendable_nest_index = extend(
    self._extendable_nest_index,
    rels
  )
}

const handleLegacy = function(self, prop, type) {
  if (!self.hasOwnProperty(prop)) {
    return
  }

  const result = cloneObj({}, self._extendable_nest_index) || {}

  for (const name in self[prop]) {
    if (!self[prop].hasOwnProperty(name)) {
      continue
    }
    const cur = self[prop][name]
    result[name] = {
      dcl: cur,
      type: type,
    }
  }

  self._extendable_nest_index = result
}

const checkLegacy = function(self) {
  handleLegacy(self, '_legacy_nest_dcl', 'nest')
  handleLegacy(self, '_chi_nest_conj', 'conj')
  handleLegacy(self, '_chi_nest_sel', 'sel')
  handleLegacy(self, '__nest_rqc', 'model')
}

const relToCompAttr = function relToCompAttr(result, comp_rels_list) {
  if (!comp_rels_list || !comp_rels_list.length) {
    return
  }

  for (let i = 0; i < comp_rels_list.length; i++) {
    const cur = comp_rels_list[i]
    result[cur.comp_attr.name] = cur.comp_attr
  }
}

const checkCompAttrsFromRels = cachedField(
  '__dcls_comp_attrs_from_rels',
  ['_nest_by_type_listed'],
  false,
  function collectCheck(nest_by_type_listed) {
    const result = {}

    relToCompAttr(result, nest_by_type_listed.comp)
    relToCompAttr(result, nest_by_type_listed.conj)
    relToCompAttr(result, nest_by_type_listed.sel)

    return result
  }
)

const uniqRel = (mut_result, list) => {
  if (list == null) {
    return
  }

  for (let i = 0; i < list.length; i++) {
    const cur = list[i]
    if (!cur.rel_shape) {
      console.warn(cur)
      throw new Error('no rel_shapre for ' + cur.name)
    }
    if (!cur.rel_shape.uniq) {
      continue
    }
    mut_result.push(cur)
  }
}

const checkUniqRels = cachedField('__dcls_rels_uniq', ['_nest_by_type_listed'], false, function checkUniqRels(nest_by_type_listed) {
  const result = []

  uniqRel(result, nest_by_type_listed.model)
  uniqRel(result, nest_by_type_listed.input)

  return result.length ? result : null
})


const comp_dcls_schema = {
  $rels$idle,
  $comp_attrs$derived$from_idle_rels,
  $actions$derived$from_idle_rels
}



const attrToRelValue = function relToCompAttr(attr_to_rel_name, comp_rels_list) {
  if (!comp_rels_list || !comp_rels_list.length) {
    return
  }

  for (let i = 0; i < comp_rels_list.length; i++) {
    const cur = comp_rels_list[i]
    attr_to_rel_name.set(cur.comp_attr.name, cur.dest_name)
  }
}

const checkAttrsToRelValues = cachedField('__attr_to_rel_name', ['_nest_by_type_listed'], false, (nest_by_type_listed) => {
  const attr_to_rel_name = new Map()

  attrToRelValue(attr_to_rel_name, nest_by_type_listed.comp)
  attrToRelValue(attr_to_rel_name, nest_by_type_listed.conj)
  attrToRelValue(attr_to_rel_name, nest_by_type_listed.sel)

  return attr_to_rel_name
})

export default function checkRels(self) {
  const currentIndex = self._extendable_nest_index

  checkLegacy(self)
  checkModern(self)

  if (currentIndex === self._extendable_nest_index) {
    return
  }


  const oldByType = self._nest_by_type || {}
  self._nest_by_type = byType(self._extendable_nest_index)

  rebuild(self, self._nest_by_type, oldByType)

  self._nest_by_type_listed = {}
  for (const type_name in self._nest_by_type) {
    if (!self._nest_by_type.hasOwnProperty(type_name)) {
      continue
    }

    const result = []

    const cur = self._nest_by_type[type_name]
    for (const nest_name in cur) {
      if (!cur.hasOwnProperty(nest_name)) {
        continue
      }
      result.push(cur[nest_name])
    }

    self._nest_by_type_listed[type_name] = result

  }

  if (!self._nest_by_type_listed) {
    return true
  }

  checkAttrsToRelValues(self)
  checkCompAttrsFromRels(self)

  cacheFields(comp_dcls_schema, self)

  checkUniqRels(self)
  return true
}
