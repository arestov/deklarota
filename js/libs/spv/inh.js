
import coe from './coe'
import cloneObj from './cloneObj'
import countConstr from './countConstr'
import copyProps from './copyProps'
import Class from './Class'

const stPartWrapping = function(original, part) {
  return function builderWrap(obj, arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9, arg10) {
    original(obj, arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9, arg10)
    part(obj, arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9, arg10)
  }
}

const stNaming = function(constructor) {
  return function Class(arg1) {
    constructor(this, arg1)
  }
}

const stBuilding = function(parentBuilder) {
  return function classBuilder(obj, arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9, arg10) {
    parentBuilder(obj, arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9, arg10)
  }
}

const wrapExtend = function(original, fresh) {
  return function(resultPrototype, props, originalPrototype, params) {
    original(resultPrototype, props, originalPrototype, params)
    fresh(resultPrototype, props, originalPrototype, params)
  }
}

const empty = function() {}

const extendTo = Class.extendTo

function extend(Class, params, propsArg) {
  if (params == null) {
    params = {}
  }

  const parentNaming = Class.naming || stNaming
  const naming = params.naming || parentNaming
  let building

  let initLength = false
  if (params.init) {
    const init = params.init
    building = function(parentBuilder) {
      return stPartWrapping(parentBuilder, init)
    }
    initLength = init.length
  } else if (params.preinit) {
    const preinit = params.preinit
    building = function(parentBuilder) {
      return stPartWrapping(preinit, parentBuilder)
    }
    initLength = preinit.length
  } else {
    building = stBuilding
  }

  const passedProps = propsArg || params.props
  const props = typeof passedProps == 'function' ?
    coe(passedProps) :
    passedProps

  const asParentExtend = Class.onExtend || empty
  const firstExtend = params.onPreExtend
    ? wrapExtend(params.onPreExtend, asParentExtend)
    : asParentExtend
  const onExtend = params.onExtend
    ? wrapExtend(firstExtend, params.onExtend)
    : firstExtend

  const parentMainBuilder = Class.inh_main_constr
  // building нужен что бы к родительской инициализации добавить какую-то конкретную новую
  const mainConstructor = building(parentMainBuilder || empty)

  const parentPostbuilder = Class.inh_post_constr
  const postConstructor = (function() {
    if (!params.postInit) {
      return parentPostbuilder
    } else if (!parentPostbuilder) {
      return params.postInit
    }
    // parent post init should always be the last in order
    return stPartWrapping(params.postInit, parentPostbuilder)
  })()

  const finalConstructor = postConstructor
    ? stPartWrapping(mainConstructor, postConstructor)
    : mainConstructor

  const result = naming(finalConstructor)

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

  const PrototypeConstr = parentNaming(empty)

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

export default extend
