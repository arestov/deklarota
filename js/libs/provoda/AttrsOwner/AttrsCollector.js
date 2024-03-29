

import BitField from './BitField'
import isPrivate from '../Model/isPrivateState'

const reserved = 2

const ok = Object.freeze({
  enumerable: true,
  configurable: true
})

const notOk = Object.freeze({
  value: null,
  writable: true,
  enumerable: false,
  configurable: false,
})

const Wrap = function() {}

Wrap.prototype = {
  get: function(target, name) {
    const collector = target[0]

    if (collector.boolByName.has(name)) {
      const bitfield = target[1]
      if (!bitfield) {
        return false
      }
      return bitfield.get(collector.boolByName.get(name))
    }


    const num = collector.getAttrNum(name)
    if (num == null) {
      return
    }

    if (target.length <= num) {
      return
    }

    return target[num]
  },
  set: function(target, name, value) {
    const collector = target[0]

    if (collector.boolByName.has(name)) {
      if (!target[1]) {
        target[1] = collector.makeBitField()
      }
      const bitfield = target[1]

      bitfield.set(collector.boolByName.get(name), Boolean(value))
      return true
    }

    const num = collector.ensureAttrNum(name)
    const length = target.length
    if (num > length) {
      target.length = num + 1
    // we should grow array to no let it has holes
      for (let i = length; i < num; i++) {
        target[i] = undefined
      }
    }

    target[num] = value

    return true
  },
  enumerate: function(target) {
    return target[0].all
  },
  ownKeys: function(target) {
    return target[0].all
  },
  has: function(target, name) {
    return target[0].hasAttr(name)
  },

  getOwnPropertyDescriptor: function(_target, prop) { // вызывается для каждого свойства
    if (prop === 'length') {
      return notOk
    }
    return ok
  }
  // ownKeys
}

const wrap = new Wrap()

if (wrap.__nothing) {
  // to fast props magic
  console.log('what?')
}


function AttrsCollector(defined_attrs) {
  // Collect possible attrs
  this.counter = reserved
  // 0 is reserved to ref to collector
  // 1 is reserved to bitfield
  this.indexByName = new Map()

  this.bools = 0
  this.boolByName = new Map()

  this.public_attrs = []
  this.all = []

  this.defineAttr('length')
  this.defineAttr('_node_id')

  for (let i = 0; i < defined_attrs.length; i++) {
    const cur = defined_attrs[i]
    this.defineAttr(cur.name, cur.type)
  }

  Object.seal(this)
}

const grow = Object.freeze({grow: Infinity})

AttrsCollector.prototype = {
  defineAttr: function(name, type) {
    if (this.hasAttr(name)) {
      return
    }

    switch (type) {
      case 'bool': {
        this.boolByName.set(name, this.bools++)
      }
        break
      default: {
        this.indexByName.set(name, this.counter++)
      }
    }


    this.all.push(name)

    if (!isPrivate(name)) {
      this.public_attrs.push(name)
    }
  },
  hasAttr: function(name) {
    return this.indexByName.has(name) || this.boolByName.has(name)
  },
  ensureAttr: function(name) {
    // ensure usual attr without type
    if (this.hasAttr(name)) {
      return
    }

    this.ensureAttrNum(name)
  },
  ensureAttrNum: function(name) {
    if (this.indexByName.has(name)) {
      return this.indexByName.get(name)
    }

    // console.warn(new Error('define ' + name))

    const num = this.counter++
    this.indexByName.set(name, num)

    this.all.push(name)

    if (!isPrivate(name)) {
      this.public_attrs.push(name)
    }

    return num
  },
  getAttrNum: function(name) {
    return this.indexByName.get(name)
  },
  makeBitField: function() {
    return new BitField(this.bools, grow)
  },
  makeAttrsValues: function() {
    // Create object that will store values in shape of our attrs
    const array = [
      this, // 0 - reserved for collector
      this.bools ? this.makeBitField() : null,// 1 - reserved for BitField
    ]
    return new Proxy(array, Wrap.prototype)
  }
}

export default AttrsCollector
