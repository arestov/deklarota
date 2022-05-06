import { getTargetField, setTargetField, toRealArray } from '../spv'
import cloneObj from './cloneObj.js'


const getFullFieldPath = function(last_part, data) {
  let cur = data
  const result = [last_part]
  while (cur && cur.prop_name) {
    result.unshift(cur.prop_name)
    cur = cur.parent
  }
  return result.join('.')
}

const getPropsListByTree = function(obj) {
  const all_objects = [{
    parent: null,
    prop_name: '',
    obj: obj
  }]
  let cur
  let i
  let prop_name
  const objects_list = []
  const result_list = []

  while (all_objects.length) {
    cur = all_objects.shift()
    for (prop_name in cur.obj) {
      if (!cur.obj.hasOwnProperty(prop_name) || !cur.obj[prop_name]) {
        continue
      }
      if (Array.isArray(cur.obj[prop_name])) {
        continue
      }
      if (typeof cur.obj[prop_name] == 'object') {
        all_objects.push({
          parent: cur,
          prop_name: prop_name,
          obj: cur.obj[prop_name]
        })
      }
    }
    objects_list.push(cur)
  }

  for (i = 0; i < objects_list.length; i++) {
    cur = objects_list[i]
    for (prop_name in cur.obj) {
      if (!cur.obj.hasOwnProperty(prop_name)) {
        continue
      }
      if (typeof cur.obj[prop_name] == 'string' || !cur.obj[prop_name] || Array.isArray(cur.obj[prop_name])) {
        result_list.push({
          field_path: getFullFieldPath(prop_name, cur),
          field_path_value: cur.obj[prop_name]
        })
      }
    }
  }
  return result_list


}

const parseMap = function(map) {
  //var root = map;

  const all_targets = [map]
  const full_list = []
  let cur
  let i

  while (all_targets.length) {
    cur = all_targets.shift()
    if (cur.parts_map) {
      for (const prop_name in cur.parts_map) {
        if (!cur.parts_map.hasOwnProperty(prop_name)) {
          continue
        }
        const child_part = cur.parts_map[prop_name]
        if (typeof child_part.props_map == 'string' && child_part.parts_map) {
          console.log(['you can not have parts in', child_part, 'since it is simple string from field:' + child_part.props_map])
          throw new Error('you can not have parts in this place since it is simple string from field:' + child_part.props_map)
        }
        all_targets.push(child_part)
      }
    }
    full_list.push(cur)
  }


  for (i = 0; i < full_list.length; i++) {
    cur = full_list[i]
    //cur.props_map
    if (typeof cur.props_map == 'object' && !Array.isArray(cur.props_map)) {
      const full_propslist = getPropsListByTree(cur.props_map)
      //	console.log(full_propslist);
      cur.props_map = full_propslist
    }

  }


  return map
  //'весь список подчинённостей';
  //''
}


const getTargetProps = function(obj, scope, iter, spec_data, converters) {
  for (let i = 0; i < iter.map_opts.props_map.length; i++) {
    const cur = iter.map_opts.props_map[i]

    let fpv = cur.field_path_value
    if (!fpv) {
      fpv = cur.field_path
    }

    const cur_value = getComplexPropValueByField(fpv, scope, iter, spec_data, converters)

    setTargetField(obj, cur.field_path, cur_value)
  }

}


const getPropValueByField = function(fpv, iter, scope, spec_data) {
  let source_data = scope
  let state_name = fpv
  const start_char = fpv.charAt(0)
  if (start_char == '^') {
    state_name = fpv.slice(1)
    let count = fpv.length - state_name.length
    while (count) {
      --count
      source_data = iter.parent_data
      if (!source_data) {
        break
      }
    }
    //states_of_parent[fpv] = this.prsStCon.parent(fpv);
  } else if (start_char == '@') {
    throw new Error('')
    //states_of_nesting[fpv] = this.prsStCon.nesting(fpv);
  } else if (start_char == '#') {
    state_name = fpv.slice(1)
    source_data = spec_data
    if (!spec_data) {
      throw new Error()
    }
    //states_of_root[fpv] = this.prsStCon.root(fpv);
  }
  return getTargetField(source_data, state_name)
}


const getComplexPropValueByField = function(fpv, scope, iter, spec_data, converters) {



  let cur_value


  if (typeof fpv == 'string') {
    cur_value = getPropValueByField(fpv, iter, scope, spec_data)
  } else if (Array.isArray(fpv)) {
    if (fpv.length > 1) {
      let convert = fpv[0]

      if (typeof convert == 'string') {
        convert = converters[convert]
      }

      cur_value = convert(fpv[1] && getPropValueByField(fpv[1], iter, scope, spec_data))
    } else {
      cur_value = fpv[0]
    }

  }
  return cur_value
}


const handlePropsMapScope = function(spec_data, cur, objects_list, scope, converters) {
  if (typeof cur.map_opts.props_map == 'string') {
    return getComplexPropValueByField(cur.map_opts.props_map, scope, cur, spec_data, converters)
  }

  const result_value_item = {}
  getTargetProps(result_value_item, scope, cur, spec_data, converters)

  for (const prop_name in cur.map_opts.parts_map) {
    //cur.map_opts.parts_map[prop_name];
    const map_opts = cur.map_opts.parts_map[prop_name]

    const result_value = map_opts.is_array ? [] : {} //объект используемый потомками создаётся в контексте родителя, что бы родитель знал о потомках
    setTargetField(result_value_item, prop_name, result_value) //здесь родитель записывает информацию о своих потомках

    objects_list.push({
      map_opts: map_opts,
      parent_data: scope,
      parent_map: cur.map_opts,
      writeable_array: result_value,

      data_scope: null
    })
  }
  return result_value_item
}


const executeMap = function(map, data, spec_data, converters) {

  const root_struc = {
    map_opts: map,
    parent_data: data,
    parent_map: null,
    writeable_array: map.is_array ? [] : {},
    //writeable_array - объект или массив объектов получающихся в результате парсинга одной из областей видимости
    //должен быть предоставлен потомку родителем
    data_scope: null
  }


  const objects_list = [root_struc]
  let result_item

  while (objects_list.length) {
    const cur = objects_list.shift()


    let cvalue
    if (cur.map_opts.source) {
      cvalue = getTargetField(cur.parent_data, cur.map_opts.source)
    } else {
      cvalue = cur.parent_data
    }

    if (!cvalue) {
      continue
    }

    if (!cur.map_opts.is_array) {
      cur.data_scope = cvalue
      result_item = handlePropsMapScope(spec_data, cur, objects_list, cur.data_scope, converters)
      if (typeof result_item != 'object') {
        throw new Error('use something more simple!')
      }
      cloneObj(cur.writeable_array, result_item)
    } else {
      cur.data_scope = toRealArray(cvalue)
      cur.writeable_array.length = cur.data_scope.length

      for (let i = 0; i < cur.data_scope.length; i++) {
        const scope = cur.data_scope[i]
        cur.writeable_array[i] = handlePropsMapScope(spec_data, cur, objects_list, scope, converters)


      }
    }




  }

  return root_struc.writeable_array
}
const MorphMap = function(config, converters) {
  if (config && typeof config != 'object') {
    throw new Error('map should be `object`')
  }
  this.config = config
  this.converters = converters
  this.pconfig = null

  const _this = this
  return function() {
    return _this.execute.apply(_this, arguments)
  }
}
MorphMap.prototype.execute = function(data, spec_data, converters) {
  if (!this.pconfig) {
    this.pconfig = parseMap(this.config)
  }
  return executeMap(this.pconfig, data, spec_data, converters || this.converters)
}
//var data_bymap = executeMap( parseMap(map), raw_testmap_data, {smile: '25567773'} );
//console.log(data_bymap);
const morphMap = function(config, converters) {
  return new MorphMap(config, converters)
}

export default morphMap
