define(function() {
'use strict'



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
    var num = target[0].getAttrNum(name)
    if (num == null) {
      return
    }

    if (target.length <= num) {
      return
    }

    return target[num]
  },
  set: function(target, name, value) {
    var num = target[0].ensureAttr(name)
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
    var num = target[0].getAttrNum(name)
    return num != null
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
  this.counter = 0;
  this.indexByName = Object.create( null )
  this.publicNums = []
  this.all = []

  this.defineAttr('length')
  this.defineAttr('_provoda_id')

  for (var i = 0; i < defined_attrs.length; i++) {
    var cur = defined_attrs[i]
    this.defineAttr(cur.name, cur.type)
  }
}

AttrsCollector.prototype = {
  defineAttr: function(name, type) {
    if (name in this.indexByName) {
      return this.indexByName[name]
    }

    this.indexByName[name] = ++this.counter

    this.all.push(name)
  },
  ensureAttr: function (name) {
    if (name in this.indexByName) {
      return this.indexByName[name]
    }

    // console.warn(new Error('define ' + name))

    var num = ++this.counter
    this.indexByName[name] = num

    this.all.push(name)
    return num
  },
  getAttrNum: function(name) {
    if (name in this.indexByName) {
      return this.indexByName[name]
    }
  },

  makeAttrsValues: function() {
    // Create object that will store values in shape of our attrs
    return new Proxy([this], Wrap.prototype)
  }
}

return AttrsCollector
})
