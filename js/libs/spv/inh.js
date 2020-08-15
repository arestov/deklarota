define(function(require) {
'use strict'
var coe = require('./coe')
var cloneObj = require('./cloneObj')
var countConstr = require('./countConstr')
var copyProps = require('./copyProps')
var Class = require('./Class')

var stPartWrapping = function(original, part) {
  return function builderWrap(obj, arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9, arg10) {
    original(obj, arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9, arg10)
    part(obj, arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9, arg10)
  }
}

var stNaming = function(constructor) {
  return function Class(arg1) {
    constructor(this, arg1)
  }
}

var stBuilding = function(parentBuilder) {
  return function classBuilder(obj, arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9, arg10) {
    parentBuilder(obj, arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9, arg10)
  }
}

var wrapExtend = function(original, fresh) {
  return function(resultPrototype, props, originalPrototype, params) {
    original(resultPrototype, props, originalPrototype, params)
    fresh(resultPrototype, props, originalPrototype, params)
  }
}

var empty = function() {}

var extendTo = Class.extendTo

function extend(Class, params, propsArg) {
  if (params == null) {
    params = {}
  }

  var parentNaming = Class.naming || stNaming
  var naming = params.naming || parentNaming
  var building

  var initLength = false
  if (params.init) {
    var init = params.init
    building = function(parentBuilder) {
      return stPartWrapping(parentBuilder, init)
    }
    initLength = init.length
  } else if (params.preinit) {
    var preinit = params.preinit
    building = function(parentBuilder) {
      return stPartWrapping(preinit, parentBuilder)
    }
    initLength = preinit.length
  } else {
    building = stBuilding
  }

  var passedProps = propsArg || params.props
  var props = typeof passedProps == 'function' ?
    coe(passedProps) :
    passedProps

  var asParentExtend = Class.onExtend || empty
  var firstExtend = params.onPreExtend
    ? wrapExtend(params.onPreExtend, asParentExtend)
    : asParentExtend
  var onExtend = params.onExtend
    ? wrapExtend(firstExtend, params.onExtend)
    : firstExtend

  var parentMainBuilder = Class.inh_main_constr
  // building нужен что бы к родительской инициализации добавить какую-то конкретную новую
  var mainConstructor = building(parentMainBuilder || empty)

  var parentPostbuilder = Class.inh_post_constr
  var postConstructor = (function() {
    if (!params.postInit) {
      return parentPostbuilder
    } else if (!parentPostbuilder) {
      return params.postInit
    }
    // parent post init should always be the last in order
    return stPartWrapping(params.postInit, parentPostbuilder)
  })()

  var finalConstructor = postConstructor
    ? stPartWrapping(mainConstructor, postConstructor)
    : mainConstructor

  var result = naming(finalConstructor)

  if (initLength === false) {
    initLength =
      postConstructor
        ? Math.max(mainConstructor.length, postConstructor.length)
        : mainConstructor.length
  }

  if (params.strict) {
    if (initLength > result.length + 1) {
      throw new Error('naming should pass all arguments that expect `builder` or `init` func')
    }

    if (Class.initLength > result.length + 1) {
      throw new Error('naming should pass all arguments that expect parent `builder` or `init` func')
    }
  }



  result.naming = naming
  result.inh_main_constr = mainConstructor
  result.inh_post_constr = postConstructor
  result.inh_constr = finalConstructor
  result.onExtend = onExtend
  result.initLength = Math.max(Class.initLength || initLength, initLength)

  var PrototypeConstr = parentNaming(empty)

  PrototypeConstr.prototype = Class.prototype
  result.prototype = new PrototypeConstr()
  result.prototype.constr_id = countConstr()
  result.prototype.constructor = result
  if (!params.skip_code_path) {
    result.prototype.__code_path = codePath()
  }


  if (props) {
    copyProps(result.prototype, props, Class.prototype)
    // cloneObj(result.prototype, props);
    if (params.skip_first_extend) {
      if (firstExtend) {
        firstExtend(result.prototype, props, Class.prototype, params)
      }
    } else {
      if (onExtend) {
        onExtend(result.prototype, props, Class.prototype, params)
      }
    }

  }

  result.extendTo = function(Class, props) {
    console.log('don\'t use extendTo')
    console.log(codePath())

    if (!result.legacy) {
      result.legacy = naming(empty)
      result.legacy.pureBase = result
      result.legacy.prototype = cloneObj(new PrototypeConstr(), result.prototype)
      result.legacy.prototype.init = makeInit(result.inh_constr)
      result.legacy.prototype.constr_id = countConstr()
      result.legacy.prototype.constructor = result.legacy
      if (!params.skip_code_path) {
        result.prototype.__code_path = codePath()
      }

    }

    return extendTo.call(result.legacy, Class, props)
  }

  return result
}

function codePath() {
  return new Error()
}

function makeInit(builder) {
  return function(arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8) {
    builder(this, arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8)
  }
}

return extend

})
