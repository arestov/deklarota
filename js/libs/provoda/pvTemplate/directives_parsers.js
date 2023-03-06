

import spv from '../../spv'
import angbo from '../StatementsAngularParser.min'
import StandartChange from './StandartChange'
import dom_helpers from '../utils/dom_helpers'

const capitalize = spv.capitalize
const startsWith = spv.startsWith
const getTargetField = spv.getTargetField
const setTargetField = spv.setTargetField

const getText = dom_helpers.getText
const setText = dom_helpers.setText


const DOT = '.'
const regxp_complex_spaces = /(^\s+)|(\s+$)|(\s{2,})/gi
const regxp_spaces = /\s+/gi

const convertFieldname = function(prop_name) {
  const parts = prop_name.replace(/^-/, '').split('-')
  if (parts.length > 1) {
    for (let i = 1; i < parts.length; i++) {
      parts[i] = capitalize(parts[i])
    }
  }
  return parts.join('')
}
const createPropChange = (function() {
  const getValue = function(node, prop) {
    return getTargetField(node, prop)
  }

  const setPropValue = function(node, prop, raw_value) {
    const value = raw_value == null ? '' : raw_value
    setTargetField(node, prop, value)
  }

  const setValue = function(node, value, _old_value, wwtch) {
    const prop = wwtch.data
    const new_value = value

    if (!wwtch.standch.needs_recheck) {
      return setPropValue(node, prop, new_value)
    }

    const current_value = getValue(node, prop)
    if (current_value == new_value) {
      return
    }

    return setPropValue(node, prop, value)
  }

  return function(node, prop, statement, directive_name) {
    const parts = prop.split(DOT)
    for (let i = 0; i < parts.length; i++) {
      parts[i] = convertFieldname(parts[i])
    }
    prop = parts.join(DOT)

    const needs_recheck = prop == 'value'
    // we should avoid reading dom. it could be perfomance problem, but
    // we don't want to rewrite value for input since it will break cursor position
    // p.s. we could add more clever check for noteName === 'textarea' and other attrs
    // TODO: check if this realy needed

    return new StandartChange(node, {
      data: prop,
      needs_recheck: needs_recheck,
      statement: statement,
      getValue: getValue,
      setValue: setValue
    }, directive_name)
  }
})()


const createStylePropChange = (function() {
  const getValue = function(node, prop) {
    return node.style.getPropertyValue(prop)
  }

  const setPropValue = function(node, prop, value) {
    if (value == null) {
      node.style.removeProperty(prop)
      return
    }

    node.style.setProperty(prop, value)

  }

  const setValue = function(node, value, _old_value, wwtch) {
    const prop = wwtch.data
    const new_value = value

    if (!wwtch.standch.needs_recheck) {
      return setPropValue(node, prop, new_value)
    }

    const current_value = getValue(node, prop)
    if (current_value === new_value) {
      return
    }

    return setPropValue(node, prop, new_value)
  }

  return function(node, prop, statement, directive_name) {
    return new StandartChange(node, {
      data: prop,
      needs_recheck: false,
      statement: statement,
      getValue: getValue,
      setValue: setValue
    }, directive_name)
  }
})()



const regxp_props_com = /\S[\S\s]*?\:[\s]*?\{\{[\S\s]+?\}\}/gi
const regxp_props_com_soft = /\S[\S\s]*?\:[\s]*?(?:\{\{[\S\s]+?\}\})|(?:\S+?(\s|$))/gi
const regxp_props_spaces = /^\s*|s*?$/
const regxp_props_coms_part = /\s*\:\s*?(?=\{\{)/
const regxp_props_statement = /(^\{\{)|(\}\}$)/gi

const getFieldsTreesBases = StandartChange.getFieldsTreesBases

const getIndexList = function(obj, arr) {
  const result = arr || []
  for (const prop in obj) {
    result.push(prop)
  }
  return result
}

function multipleParts(createChange, pname) {
  return function(node, full_declaration, directive_name) {
    // example:
    //"style.width: {{play_progress}} title: {{full_name}} style.background-image: {{album_cover_url}}"
    const result = []
    const complex_value = full_declaration
    const complects = complex_value.match(regxp_props_com)
    for (let i = 0; i < complects.length; i++) {
      complects[i] = complects[i].replace(regxp_props_spaces,'').split(regxp_props_coms_part)
      const prop = complects[i][0]
      const statement = complects[i][1] && complects[i][1].replace(regxp_props_statement,'')

      if (!prop || !statement) {
        throw new Error('wrong declaration: ' + complex_value)
        //return;
      }
      const item = createChange(node, prop, statement, pname + '$' + prop + '$' + directive_name)
      if (item) {
        result.push(item)
      }

    }
    return result
  }
}

export default {
  config: (function() {
    const config = {
      one_parse: {
        'pv-import': true,
        'pv-when': true
      },
      one_parse_list: [],
      pseudo: {
        'pv-when-condition': true
      },
      pseudo_list: [],
      scope_generators: {
        'pv-rel': true,
        'pv-repeat': true,
        'pv-foreign': true
      },
      scope_g_list: [],
      states_using_directives: {
        'pv-text': true,
        'pv-class': true,
        'pv-props': true,
        'pv-style-props': true,
        'pv-type': true,
        'pv-repeat': true
      },
      sud_list: [],
      directives: {
        'pv-text': true,
        'pv-class': true,
        'pv-props': true,
        'pv-style-props': true,
        'pv-anchor': true,
        'pv-type': true,
        'pv-events': true,
        'pv-log': true
      },
      directives_names_list: [],

      comment_directives: {
      //	'pv-when': true,
        'pv-replace': true,
        'pv-importable': true
      },
      comment_directives_names_list: [],
    }

    getIndexList(config.directives, config.directives_names_list)
    //порядок директив важен, по идее
    //должен в результате быть таким каким он задекларирован

    getIndexList(config.scope_generators, config.scope_g_list)
    //порядок директив важен, по идее
    //должен в результате быть таким каким он задекларирован

    getIndexList(config.states_using_directives, config.sud_list)

    getIndexList(config.comment_directives, config.comment_directives_names_list)

    getIndexList(config.one_parse, config.one_parse_list)
    getIndexList(config.pseudo, config.pseudo_list)

    return config
  })(),
  getIndexList: getIndexList,
  getFieldsTreesBases: getFieldsTreesBases,
  comment_directives_p: {
    'pv-replace': function(_node, full_declaration, _directive_name, _getSample) {
      const index = {}
      const complex_value = full_declaration
      const complects = complex_value.match(regxp_props_com_soft)

      for (let i = 0; i < complects.length; i++) {
        complects[i] = complects[i].replace(regxp_props_spaces, '')
        const splitter_index = complects[i].indexOf(':')

        const prop = complects[i].slice(0, splitter_index)
        const statement = complects[i].slice(splitter_index + 1).replace(regxp_props_statement, '')

        if (!prop || !statement) {
          throw new Error('wrong declaration: ' + complex_value)
        }
        index[prop] = statement
      }

      return index
    }
  },
  directives_p: {
    'pv-text': (function() {
      const getTextValue = function(node) {
        return getText(node)
      }
      const setTextValue = function(node, new_value) {
        return setText(node, new_value)
      }
      return function(node, full_declaration, directive_name) {
        return new StandartChange(node, {
          complex_statement: full_declaration,
          getValue: getTextValue,
          setValue: setTextValue
        }, directive_name)
      }
    })(),
    'pv-class': (function() {
      const getClassName = function(node, class_name) {
        return node.classList.contains(class_name)
      }
      const setClassName = function(node, new_value, _old, wwtch) {
        const class_name = wwtch.data
        if (new_value) {
          node.classList.add(class_name)
        } else {
          node.classList.remove(class_name)
        }

      }

      const exp = /\S+\s*\:\s*(\{\{.+?\}\}|\S+)/gi
      const two_part = /(\S+)\s*\:\s*(?:\{\{(.+?)\}\}|(\S+))/
      return function(node, full_declaration, directive_name) {
        const statements = full_declaration.match(exp)
        if (!statements.length) { return }

        const result = []
        for (let i = statements.length - 1; i >= 0; i--) {
          const parts = statements[i].match(two_part)
          const class_name = parts[1]
          const condition = parts[2] || parts[3]
          if (!class_name || !condition) {
            throw new Error('wrong statement: ' + statements[i])
          }

          result.push(new StandartChange(node, {
            data: class_name,
            statement: condition,
            getValue: getClassName,
            setValue: setClassName,
            simplifyValue: Boolean
          }, class_name + '$' + directive_name))

        }

        return result
      }
    })(),
    'pv-props': multipleParts(createPropChange, 'props'),
    'pv-style-props': multipleParts(createStylePropChange, 'style-props'),
    'pv-when': function(_node, full_declaration, _directive_name) {
      if (!full_declaration) {
        return
      }
      return full_declaration
    },
    'pv-type': (function() {
      const getPVTypes = function() {
        return ''
      }

      const setPVTypes = function(_node, new_value, _ov, wwtch) {
        const types = new_value.split(regxp_spaces)
        wwtch.pv_type_data.marks = {}
        for (let i = 0; i < types.length; i++) {
          if (types[i]) {
            wwtch.pv_type_data.marks[types[i]] = true
          }
        }

        wwtch.context._pvTypesChange()
      }

      return function(node, full_declaration, directive_name) {
        if (!full_declaration) {
          return
        }
        full_declaration = hlpSimplifyValue(full_declaration)

        //если pv-types не требует постоянных вычислений (не зависит ни от одного из состояний)
        //то использующие шаблон ноды могут выдавать общий результирующий объект - это нужно реализовать fixme

        return new StandartChange(node, {
          complex_statement: full_declaration,
          getValue: getPVTypes,
          setValue: setPVTypes,
          simplifyValue: hlpSimplifyValue
        }, directive_name)
      }
    })(),
    'pv-events': (function() {
      const createPVEventData = function(event_name, data, event_opts) {

        event_opts = event_opts && event_opts.split(',')
        const event_handling = {}
        if (event_opts) {
          for (let i = 0; i < event_opts.length; i++) {
            event_handling[event_opts[i]] = true
          }
        }


        return {
          event_name: event_name,
          fn: function(e, context) {
            if (event_handling.sp) {
              e.stopPropagation()
            }
            if (event_handling.pd) {
              e.preventDefault()
            }
            context.callEventCallback(this, e, data.slice())
          }
        }
      }


      const createEventParams = function(array) {
        for (let i = 0; i < array.length; i++) {
          const cur = array[i]
          if (cur.indexOf('{{') != -1) {
            array[i] = angbo.interpolateExpressions(cur)
          }
        }
        return array
      }

      return function(_node, full_declaration) {
        /*
        click:Callback
        mousemove|sp,pd:MovePoints
        */
        const result = []
        const declarations = full_declaration.split(regxp_spaces)
        for (let i = 0; i < declarations.length; i++) {
          const cur = declarations[i].split(':')
          const dom_event = cur.shift()
          const decr_parts = dom_event.split('|')



          result.push(createPVEventData(decr_parts[0], createEventParams(cur), decr_parts[1]))
        }
        return result
      }
    })(),
    'pv-log'(_node, full_declaration) {
      return full_declaration
    }
  },
  scope_generators_p: {
    'pv-rel': function(_node, full_declaration) {
      const attr_value = full_declaration

      const filter_parts = attr_value.split('|')

      let filterFn
      if (filter_parts[1]) {
        const calculator = angbo.parseExpression('obj |' + filter_parts[1])
        filterFn = function(array) {
          return calculator({obj: array})
        }
      }

      const parts = filter_parts[0].split(/\s+/gi)
      let for_model
      let coll_name
      let controller_name
      let space

      for (let i = 0; i < parts.length; i++) {

        const cur_part = parts[i]
        if (!cur_part) {
          continue
        }

        if (startsWith(cur_part, 'for_model:')) {
          for_model = cur_part.slice('for_model:'.length)
        } else if (startsWith(cur_part, 'controller:')) {
          controller_name = cur_part.slice('controller:'.length)
        } else {
          const space_parts = cur_part.split(':')
          if (!coll_name) {
            coll_name = space_parts[0]
          }
          if (!space) {
            space = space_parts[1] || ''
          }
        }

      }

      return {
        coll_name: coll_name,
        for_model: for_model,
        controller_name: controller_name,
        space: space,
        filterFn: filterFn
      }
    },
    'pv-repeat': function(_node, full_declaration) {

      //start of angular.js code
      const expression = full_declaration//attr.ngRepeat;
      let match = expression.match(/^\s*(.+)\s+in\s+(.*)\s*$/)
      if (!match) {
        throw new Error('Expected ngRepeat in form of \'_item_ in _collection_\' but got \'' +
        expression + '\'.')
      }
      const lhs = match[1]
      const rhs = match[2]
      match = lhs.match(/^(?:([\$\w]+)|\(([\$\w]+)\s*,\s*([\$\w]+)\))$/)
      if (!match) {
        throw new Error('\'item\' in \'item in collection\' should be identifier or (key, value) but got \'' +
        lhs + '\'.')
      }
      const valueIdent = match[3] || match[1]
      const keyIdent = match[2]
      //end of angular.js code

      const calculator = angbo.parseExpression(rhs)
      const all_values = calculator.propsToWatch
      const sfy_values = getFieldsTreesBases(all_values)

      return {
        expression: expression,
        valueIdent: valueIdent,
        keyIdent: keyIdent,
        calculator: calculator,
        sfy_values: sfy_values
      }
    }
  }
}


function hlpFixStringSpaces(_str, p1, p2, p3) {
  if (p1 || p2) {
    return ''
  }
  if (p3) {
    return ' '
  }
  return ''
  //console.log(arguments);
}

function hlpSimplifyValue(value) {
  //this is optimization!
  if (!value) {
    return value
  }
  return value.replace(regxp_complex_spaces, hlpFixStringSpaces)
  // regxp_edge_spaces: /^\s+|\s+$/gi,
  //return value.replace(regxp_spaces,' ').replace(regxp_edge_spaces,'');
}
