

/* Simple JavaScript Inheritance
  * By John Resig http://ejohn.org/
  * http://ejohn.org/blog/simple-javascript-inheritance/
  * MIT Licensed.
  * Gleb Arestov mod
  */
// Inspired by base2 and Prototype

const fnTest = /xyz/.test(function() {return 'xyz'}) ? /\b_super\b/ : /.*/
const allowParentCall = function(name, fn, _super) {
  return function() {
    const tmp = this._super

    // Add a new ._super() method that is the same method
    // but on the super-class
    this._super = _super[name]

    // The method only need to be bound temporarily, so we
    // remove it when we're done executing
    const ret = fn.apply(this, arguments)
    if (typeof tmp != 'undefined') {
      this._super = tmp
    } else {
      delete this._super
    }
    return ret
  }
}

const copyProps = function(prototype, props, _super) {
  for (const prop_name in props) {
    // Check if we're overwriting an existing function
    const needSuper = typeof props[prop_name] == 'function' &&
      typeof _super[prop_name] == 'function' && fnTest.test(props[prop_name])
    prototype[prop_name] = needSuper ?
      allowParentCall(prop_name, props[prop_name], _super) :
      props[prop_name]
  }
  return prototype
}

export default copyProps
