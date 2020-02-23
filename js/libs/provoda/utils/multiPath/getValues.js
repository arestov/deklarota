define(function(require) {
'use strict';
var pvState = require('../../provoda/state')
var getNesting = require('../../provoda/getNesting')

var getValue = function(md, multi_path) {
  switch (multi_path.result_type) {
    case "nesting": {
      if (!multi_path.nesting.target_nest_name) {
        return md
      }
      return getNesting(md, multi_path.nesting.target_nest_name)
    }
    case "state": {
      return pvState(md, multi_path.state.base)
    }
  }


  return md
}

var getOne = function (items) {
  if (!Array.isArray(items)) {
    return items
  }

  return items && items[0]
}

return function(models, multi_path) {
  if (multi_path.zip_name && (multi_path.zip_name != 'one' && multi_path.zip_name != 'all')) {
    throw new Error('implenent me')
  }

  switch (multi_path.result_type) {
    case "state": {
      if (!Array.isArray(models)) {
        return getValue(models, multi_path)
      }

      if (multi_path.zip_name == 'one') {
        return models[0] && getValue(models[0], multi_path)
      }

      var result = new Array(models.length)
      for (var i = 0; i < models.length; i++) {
        result[i] = getValue(models[i], multi_path)
      }

      return result
    }

    case "nesting": {
      if (multi_path.zip_name == 'one') {
        if (!Array.isArray(models)) {
          return getOne(getValue(models, multi_path))
        }

        return models[0] && getOne(getValue(models[0], multi_path))
      }

      // results is always array here
      var result = []
      for (var i = 0; i < models.length; i++) {
        var cur = getValue(models[i], multi_path)
        if (!cur) {continue}

        result.push(cur)
      }

      result = Array.prototype.concat.apply([], result)
      return result
    }
  }

  if (multi_path.zip_name) {
    throw new Error('unexpected zip')
  }

  if (multi_path.as_string != '<<<<') {
    /*
      ok to get
      self
      parent/root
      path
    */
    // console.warn('is it good idea!?', 'should not we throw error here?')
  }

  return models

};
})
