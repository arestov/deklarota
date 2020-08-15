define(function(require) {
'use strict'
var coe = require('./coe')
var copyProps = require('./copyProps')
var countConstr = require('./countConstr')

// The base Class implementation (does nothing)
var Class = function() {}

// Create a new Class that inherits from this class
Class.extendTo = function(namedClass, props) {
  if (typeof props == 'function') {
    //props
    props = coe(props)
  }

  var _super = this.prototype

  // Instantiate a base class (but only create the instance,
  // don't run the init constructor)
  var prototype = new this()
  prototype.constr_id = countConstr()

  prototype = copyProps(prototype, props, _super)
  // Copy the properties over onto the new prototype

  // Populate our constructed prototype object
  namedClass.prototype = prototype

  // Enforce the constructor to be what we expect
  namedClass.prototype.constructor = namedClass

  if (namedClass.prototype.onExtend) {
    namedClass.prototype.onExtend.call(namedClass.prototype, props, _super)
  }

  // And make this class extendable
  namedClass.extendTo = Class.extendTo
  namedClass.extend = Class.extend
  return namedClass
}
Class.extend = function(props) {
  return this.extendTo(function() {}, props)
}

return Class
})
