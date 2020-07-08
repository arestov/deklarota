define(function(require) {
'use strict'

var BitField = require('./BitField')

var reserved = 2

var ok = Object.freeze({
  enumerable: true,
  configurable: true
});

var notOk = Object.freeze({
  value: null,
  writable: true,
  enumerable: false,
  configurable: false,
})

var Wrap = function() {}

Wrap.prototype = {
  get: function(target, name) {
    var collector = target[0]

    var bitnum = collector.boolByName[name]
    if (bitnum != null) {
      var bitfield = target[1]
      if (!bitfield) {
        return false
      }
      return bitfield.get(bitnum)
    }


    var num = collector.getAttrNum(name)
    if (num == null) {
      return
    }

    if (target.length <= num) {
      return
    }

    return target[num]
  },
  set: function(target, name, value) {
    var collector = target[0]

    var bitnum = collector.boolByName[name]
    if (bitnum != null) {
      if (!target[1]) {
        target[1] = collector.makeBitField()
      }
      var bitfield = target[1]

      bitfield.set(bitnum, Boolean(value))
      return true
    }

    var num = collector.ensureAttrNum(name)
    var length = target.length
    if (num > length) {
      target.length = num + 1
    // we should grow array to no let it has holes
      for (var i = length; i < num; i++) {
        target[i] = undefined
      }
    }

    target[num] = value

    return true
  },
  enumerate: function (target) {
    return target[0].all;
  },
  ownKeys: function (target) {
    return target[0].all;
  },
  has: function (target, name) {
    return target[0].hasAttr(name)
  },

  getOwnPropertyDescriptor: function(target, prop) { // вызывается для каждого свойства
    if (prop === 'length') {
      return notOk
    }
    return ok;
  }
  // ownKeys
}

var wrap = new Wrap()

if (wrap.__nothing) {
  // to fast props magic
  console.log('what?')
}


function AttrsCollector(defined_attrs) {
  // Collect possible attrs
  this.counter = reserved;
  // 0 is reserved to ref to collector
  // 1 is reserved to bitfield
  this.indexByName = Object.create( null )

  this.bools = 0
  this.boolByName = Object.create( null )

  this.publicNums = []
  this.all = []

  this.defineAttr('length')
  this.defineAttr('_provoda_id')

  for (var i = 0; i < defined_attrs.length; i++) {
    var cur = defined_attrs[i]
    this.defineAttr(cur.name, cur.type)
  }
}

var grow = {grow: Infinity}

AttrsCollector.prototype = {
  defineAttr: function(name, type) {
    if (this.hasAttr(name)) {
      return
    }

    switch (type) {
      case "bool": {
        this.boolByName[name] = this.bools++
      }
      break;
      default: {
        this.indexByName[name] = this.counter++
      }
    }

    this.all.push(name)
  },
  hasAttr: function(name) {
    return (name in this.indexByName) || (name in this.boolByName)
  },
  ensureAttr: function (name) {
    // ensure usual attr without type
    if (this.hasAttr(name)) {
      return
    }

    this.ensureAttrNum(name)
  },
  ensureAttrNum: function(name) {
    if (name in this.indexByName) {
      return this.indexByName[name]
    }

    // console.warn(new Error('define ' + name))

    var num = this.counter++
    this.indexByName[name] = num

    this.all.push(name)
    return num
  },
  getAttrNum: function(name) {
    return this.indexByName[name]
  },
  makeBitField: function() {
    return new BitField(this.bools, grow)
  },
  makeAttrsValues: function() {
    // Create object that will store values in shape of our attrs
    var array = [
      this, // 0 - reserved for collector
      this.bools ? this.makeBitField() : null,// 1 - reserved for BitField
    ]
    return new Proxy(array, Wrap.prototype)
  }
}

return AttrsCollector
})
