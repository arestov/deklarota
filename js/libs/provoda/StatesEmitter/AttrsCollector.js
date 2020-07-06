define(function() {
'use strict'


function AttrsCollector(defined_attrs) {
  this.counter = 0;
  this.indexByName = Object.create( null )
  this.publicNums = []
  this.all = []

  for (var i = 0; i < defined_attrs.length; i++) {
    var cur = defined_attrs[i]
    this.defineAttr(cur.name, cur.type)
  }

  // this.AttrsValues = function AttrsValues() {
  //
  // }
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

}

return AttrsCollector
})
