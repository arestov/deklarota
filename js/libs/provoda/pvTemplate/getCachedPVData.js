

import spv from '../../spv'
import directives_parsers from './directives_parsers'
import parsePVImport from './pv-import/parse'

const comment_directives_p = directives_parsers.comment_directives_p
const directives_p = directives_parsers.directives_p
const scope_generators_p = directives_parsers.scope_generators_p
const config = directives_parsers.config

const comment_directives = config.comment_directives

const template_struc_store = {}
const comment_pvdiv_regexp = /(^.+?)\s/
const getUnprefixedPV = spv.getDeprefixFunc('pv-', true)

const getNodeInstanceCount = function(pvprsd, struc_store) {
  if (!struc_store.instances_ci) {
    struc_store.instances_ci = {}
  }
  const instances_ci = struc_store.instances_ci
  if (!instances_ci.hasOwnProperty(pvprsd)) {
    instances_ci[pvprsd] = 0
  } else {
    instances_ci[pvprsd]++
  }

  return instances_ci[pvprsd]
}

const getCommentDirectivesData = function(cur_node, getSample) {
  //возвращает объект с индексом одной инструкции, основанной на тексте коммента
  const directives_data = {
    new_scope_generator: null,
    instructions: {},
    replacing_data: null
  }

  const text_content = cur_node.textContent
  let directive_name = text_content.match(comment_pvdiv_regexp)
  directive_name = directive_name && directive_name[1]

  if (comment_directives.hasOwnProperty(directive_name)) {
    const full_declaration = text_content.replace(comment_pvdiv_regexp, '')
    const chunk = comment_directives_p[directive_name].call(null, cur_node, full_declaration, directive_name, getSample)
    // if (Array.isArray(chunk) && chunk[0] === 'replaced') {
    // 	if (directives_data.replacing_data) {
    // 		throw new Error('cant be 2 replacers');
    // 	}
    // 	directives_data.replacing_data = {
    // 		replacer: true,
    // 		node: chunk[1],
    // 		data: chunk[2]
    // 	};
    // } else {
    directives_data.instructions[directive_name] = chunk
    // }

  }

  return directives_data
}
const getDirectivesData = (function() {
  const one_parse_list = config.one_parse_list
  const scope_g_list = config.scope_g_list
  const directives_names_list = config.directives_names_list
  const one_parse = config.one_parse

  return function(cur_node, getSample) {

    //возвращает объект с индексом инструкций нода, основанный на аттрибутах элемента
    const
      directives_data = {
        new_scope_generator: null,
        instructions: {},
        replacing_data: null
      }

    let attr_name = ''
    let directive_name = ''
    const attributes = cur_node.attributes
    let new_scope_generator = false// current_data = {node: cur_node};

    const attributes_list = []
    for (let i = 0; i < attributes.length; i++) {
      //создаём кэш, список "pv-*" атрибутов
      attr_name = attributes[i].name

      if (getUnprefixedPV(attr_name)) {
        attributes_list.push({
          name: attr_name,
          node: attributes[i]
        })
      }
    }

    //создаём индекс по имени
    const attrs_by_names = spv.makeIndexByField(attributes_list, 'name')
    let value

    for (let i = 0; i < one_parse_list.length; i++) {
      //проверяем одноразовые директивы ноды
      directive_name = one_parse_list[i]
      if (attrs_by_names[directive_name] && attrs_by_names[directive_name].length) {
        value = attrs_by_names[directive_name][0].node.value

        if (directives_p[directive_name]) {
          value = directives_p[directive_name].call(null, cur_node, value, directive_name, getSample)
        }
        // if (Array.isArray(value) && value[0] === 'replaced') {
        // 	if (directives_data.replacing_data) {
        // 		throw new Error('cant be 2 replacers');
        // 	}
        // 	directives_data.replacing_data = {
        // 		replacer: true,
        // 		node: value[1],
        // 		data: value[2]
        // 	};
        // } else {
        directives_data.instructions[directive_name] = value
        // }

      }
    }

    for (let i = 0; i < scope_g_list.length; i++) {
      //проверяем есть ли среди атрибутов директивы создающие новую область видимости
      directive_name = scope_g_list[i]
      if (attrs_by_names[directive_name] && attrs_by_names[directive_name].length) {
        if (new_scope_generator) {
          throw new Error('can\'t be multiply scrope generators on one node')
        }
        value = attrs_by_names[directive_name][0].node.value

        if (scope_generators_p[directive_name]) {
          value = scope_generators_p[directive_name].call(null, cur_node, value)
        }

        directives_data.instructions[directive_name] = value
        if (!one_parse[directive_name]) {
          directives_data.new_scope_generator = true
          new_scope_generator = true
        }

      }
    }
    for (let i = 0; i < directives_names_list.length; i++) {
      //проверяем остальные директивы нода
      directive_name = directives_names_list[i]
      if (attrs_by_names[directive_name] && attrs_by_names[directive_name].length) {
        value = attrs_by_names[directive_name][0].node.value

        if (directives_p[directive_name]) {
          value = directives_p[directive_name].call(null, cur_node, value, directive_name, getSample)
        }
        directives_data.instructions[directive_name] = value

      }
    }

    if (attrs_by_names['pv-import']) {
      directives_data.instructions['pv-import'] = parsePVImport(cur_node, attrs_by_names['pv-import'][0].node.value)
    }

    for (let i = 0; i < attributes_list.length; i++) {
      cur_node.removeAttributeNode(attributes_list[i].node)
    }



    return directives_data
  }
})()

const asignId = function(cur_node, _cache_index) {
  const pvprsd = ++_cache_index.struc_counter
  cur_node.pvprsd = pvprsd
  cur_node.pvprsd_inst = getNodeInstanceCount(pvprsd, _cache_index)
  return pvprsd
}

const setStrucKey = function(cur_node, struc_store, directives_data) {
  const _cache_index = struc_store || template_struc_store
  _cache_index[asignId(cur_node, _cache_index)] = directives_data
}

const unsetStrucKey = function(cur_node) {
  cur_node.pvprsd = null
  cur_node.pvprsd_inst = null
  return cur_node
}

const result = (function() {

  return function(cur_node, struc_store, is_comment, getSample) {
    let directives_data = null
    const replacer = null
    const pvprsd = cur_node.pvprsd
    const _cache_index = struc_store || template_struc_store
    if (pvprsd) {
      directives_data = _cache_index[pvprsd]
    } else {
      if (!_cache_index.struc_counter) {
        _cache_index.struc_counter = 1
      }

      if (is_comment) {
        directives_data = getCommentDirectivesData(cur_node, getSample)
      } else {
        directives_data = getDirectivesData(cur_node, getSample)
      }


      // replacer = directives_data.replacing_data;

      // if (replacer && replacer.data) {
      // 	var r_pvprsd = asignId(replacer.node, _cache_index);
      // 	_cache_index[r_pvprsd] = replacer.data;
      // }
      setStrucKey(cur_node, struc_store, directives_data)

    }
    return replacer || directives_data
  }
})()
result.setStrucKey = setStrucKey
result.unsetStrucKey = unsetStrucKey
result.getNodeInstanceCount = getNodeInstanceCount
export default result
