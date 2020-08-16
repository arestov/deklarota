
import spv from 'spv'

import NestSelector from '../nest_sel/item'
import NestCntDeclr from '../nest_conj/item'
import NestDcl from '../nest/item'
import NestCompx from '../nest_compx/item'
import NestModel from '../nest_model/item'
import buildSel from '../nest_sel/build'
import buildNest from '../nest/build'
import buildConj from '../nest_conj/build'
import buildModel from '../nest_model/build'
var cloneObj = spv.cloneObj

var parse = function(name, data) {
  var type = data[0]
  switch (type) {
    case 'nest': {
      return new NestDcl(name, data[1])
    }
    case 'conj': {
      return new NestCntDeclr(name, data[1])
    }
    case 'sel': {
      return new NestSelector(name, data[1])
    }
    case 'compx': {
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
    case 'conj': {
      buildConj(self, result)
      return
    }
    case 'sel': {
      buildSel(self, result)
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
  return true
}
