import spv from '../../../spv'
import cachedField from '../cachedField'

import NestSelector from '../nest_sel/item'
import NestCntDeclr from '../nest_conj/item'
import NestDcl from '../nest/item'
import NestCompx from '../nest_compx/item'
import NestModel from '../nest_model/item'
import buildNest from '../nest/build'
import buildModel from '../nest_model/build'
var cloneObj = spv.cloneObj

var parse = function(name, data) {
  if (!data) {
    // allow to erase item
    return null
  }
  var type = data[0]
  switch (type) {
    case 'nest': {
      if (!data[1]) {
        // allow to erase legacy internal cache
        return null
      }
      return data[1] && new NestDcl(name, data[1])
    }
    case 'conj': {
      return new NestCntDeclr(name, data[1])
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
      return new NestModel(name, data[1])
    }
  }

  throw new Error('unsupported type ' + type)
}

var extend = function(index, more_nests) {
  var cur = cloneObj({}, index) || {}

  for (var name in more_nests) {
    var data = more_nests[name]
    if (!data) {
      console.warn('implement nest erasing for: ', name)
      continue
    }

    var dcl = parse(name, data)
    cur[name] = {
      dcl: dcl,
      type: data[0],
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

var rebuildType = function(self, type, result) {
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

var rebuild = function(self, newV, oldV) {
  for (var type in newV) {
    if (!newV.hasOwnProperty(type)) {
      continue
    }

    if (!notEqual(newV[type], oldV[type])) {
      continue
    }

    rebuildType(self, type, newV[type])
  }
}

var checkModern = function(self, props) {
  if (!props['rels']) {
    return
  }

  self._extendable_nest_index = extend(
    self._extendable_nest_index,
    props['rels']
  )
}

var handleLegacy = function(self, prop, type) {
  if (!self.hasOwnProperty(prop)) {
    return
  }

  var result = cloneObj({}, self._extendable_nest_index) || {}

  for (var name in self[prop]) {
    if (!self[prop].hasOwnProperty(name)) {
      continue
    }
    var cur = self[prop][name]
    result[name] = {
      dcl: cur,
      type: type,
    }
  }

  self._extendable_nest_index = result
}

var checkLegacy = function(self) {
  handleLegacy(self, '_legacy_nest_dcl', 'nest')
  handleLegacy(self, '_chi_nest_conj', 'conj')
  handleLegacy(self, '_chi_nest_sel', 'sel')
  handleLegacy(self, '__nest_rqc', 'model')
}

const relToCompAttr = function relToCompAttr(result, comp_rels_list) {
  if (!comp_rels_list || !comp_rels_list.length) {
    return
  }

  for (var i = 0; i < comp_rels_list.length; i++) {
    var cur = comp_rels_list[i]
    result[cur.comp_attr.name] = cur.comp_attr
  }
}

const checkCompAttrsFromRels = cachedField(
  '__dcls_comp_attrs_from_rels',
  ['_nest_by_type_listed'],
  false,
  function collectCheck(nest_by_type_listed) {
    let result = {}

    relToCompAttr(result, nest_by_type_listed.comp)
    relToCompAttr(result, nest_by_type_listed.conj)
    relToCompAttr(result, nest_by_type_listed.sel)

    return result
  }
)



const attrToRelValue = function relToCompAttr(attr_to_rel_name, comp_rels_list) {
  if (!comp_rels_list || !comp_rels_list.length) {
    return
  }

  for (var i = 0; i < comp_rels_list.length; i++) {
    var cur = comp_rels_list[i]
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

export default function checkPass(self, props) {
  var currentIndex = self._extendable_nest_index

  checkLegacy(self, props)
  checkModern(self, props)

  if (currentIndex === self._extendable_nest_index) {
    return
  }


  var oldByType = self._nest_by_type || {}
  self._nest_by_type = byType(self._extendable_nest_index)

  rebuild(self, self._nest_by_type, oldByType)

  self._nest_by_type_listed = {}
  for (var type_name in self._nest_by_type) {
    if (!self._nest_by_type.hasOwnProperty(type_name)) {
      continue
    }

    var result = []

    var cur = self._nest_by_type[type_name]
    for (var nest_name in cur) {
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

  return true
}
