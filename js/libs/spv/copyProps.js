define(function() {
'use strict'

/* Simple JavaScript Inheritance
  * By John Resig http://ejohn.org/
  * http://ejohn.org/blog/simple-javascript-inheritance/
  * MIT Licensed.
  * Gleb Arestov mod
  */
// Inspired by base2 and Prototype

var fnTest = /xyz/.test(function() {return "xyz"}) ? /\b_super\b/ : /.*/;
var allowParentCall = function(name, fn, _super) {
  return function() {
    var tmp = this._super

    // Add a new ._super() method that is the same method
    // but on the super-class
    this._super = _super[name];

    // The method only need to be bound temporarily, so we
    // remove it when we're done executing
    var ret = fn.apply(this, arguments);
    if (typeof tmp != 'undefined'){
      this._super = tmp;
    } else {
      delete this._super;
    }
    return ret;
  };
};

var copyProps = function(prototype, props, _super) {
  for (var prop_name in props) {
    // Check if we're overwriting an existing function
    var needSuper = typeof props[prop_name] == "function" &&
      typeof _super[prop_name] == "function" && fnTest.test(props[prop_name]);
    prototype[prop_name] = needSuper ?
      allowParentCall(prop_name, props[prop_name], _super) :
      props[prop_name];
  }
  return prototype;
};

return copyProps

})
