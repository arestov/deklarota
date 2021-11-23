
import pvState from '../../provoda/state'
import getNesting from '../../provoda/getNesting'
import zip_fns from '../zip/multipath-as-dep'

const readState = function(md, multi_path) {
  return pvState(md, multi_path.state.path)
}

const readNesting = function(md, multi_path) {
  return getNesting(md, multi_path.nesting.target_nest_name)
}

const getOne = function(items) {
  if (!Array.isArray(items)) {
    return items
  }

  return items && items[0]
}

export default function(models, multi_path) {
  switch (multi_path.result_type) {
    case 'state': {
      if (!Array.isArray(models)) {
        return readState(models, multi_path)
      }

      if (multi_path.zip_name == 'one') {
        return models[0] && readState(models[0], multi_path)
      }

      const result = new Array(models.length)
      for (var i = 0; i < models.length; i++) {
        result[i] = readState(models[i], multi_path)
      }

      var zipFn = zip_fns[multi_path.zip_name || 'all']

      return zipFn(result)
    }

    case 'nesting': {
      if (multi_path.zip_name == 'one') {
        if (!Array.isArray(models)) {
          return getOne(readNesting(models, multi_path))
        }

        return models[0] && getOne(readNesting(models[0], multi_path))
      }

      // results is always array here
      const list_of_rels = []
      for (var i = 0; i < models.length; i++) {
        const cur = readNesting(models[i], multi_path)
        if (!cur) {continue}

        list_of_rels.push(cur)
      }

      const flat = Array.prototype.concat.apply([], list_of_rels)
      const uniq = Array.from(new Set(flat))

      var zipFn = zip_fns[multi_path.zip_name || 'all']

      return zipFn(uniq)
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

}
