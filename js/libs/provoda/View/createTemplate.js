

import spv from '../../spv'
import pvState from '../utils/state'
import getRelPath from './getRelPath'

const getTargetField = spv.getTargetField
const arrayExclude = spv.arrayExclude

const parent_count_regexp = /^\^+/gi

export default function(view, con) {
  if (!view._lbr.hndTriggerTPLevents) {
    const showError = (target_view, e, error) => {
      console.error(error, '\n', getRelPath(target_view), '\n', '\n', e.path, target_view.__code_path)
    }

    view._lbr.hndTriggerTPLevents = function(e) {
      const cb_data = e.callback_data

      for (var i = 0; i < cb_data.length; i++) {
        const cur = cb_data[i]
        if (typeof cur == 'function') {
          cb_data[i] = cur(e.scope || view.states)
        }
      }

      const isLocal = Boolean(cb_data[0])
      const fnNameRaw = cb_data[0] || cb_data[1]
      let target_view
      var fnName

      const firstChar = fnNameRaw.charAt(0)

      if (firstChar === '#') {
        target_view = view.root_view
        fnName = fnNameRaw.slice(1)
      } else if (firstChar === '^') {
        var fnName = fnNameRaw.replace(parent_count_regexp, '')
        const parent_count = fnNameRaw.length - fnName.length
        target_view = view
        for (var i = 0; i < parent_count; i++) {
          target_view = target_view.parent_view
        }
      } else {
        fnName = fnNameRaw
        target_view = view
      }

      const args_list = cb_data.slice(isLocal ? 1 : 2).map(function(argumentRaw) {
        let argument
        const stringed_variable = argumentRaw && argumentRaw.match(/\%(.*?)\%(.*)/)
        if (!stringed_variable || !stringed_variable[2]) {
          argument = argumentRaw
        } else {
          const rest_part = stringed_variable[2]
          const inverted = rest_part.charAt(0) === '!'
          const path = inverted ? rest_part.slice(1) : rest_part
          switch (stringed_variable[1]) {
            case 'node': {
              argument = getTargetField(e.node, path)
              break
            }
            case 'event': {
              argument = getTargetField(e.event, path)
              break
            }
            case 'attrs': {
              argument = e.scope ? getTargetField(e.scope, path) : pvState(view, path)
              break
            }
            default: {
              console.warn('unknown event data source: ' + stringed_variable[1])
            }
          }
          argument = inverted ? (!argument) : argument
        }
        return argument
      })

      if (!isLocal) {
        if (!args_list.length) {
          target_view.handleTemplateRPC.call(target_view, fnName)
          return
        }

        target_view.handleTemplateRPC.apply(target_view, [fnName].concat(args_list))
        return
      }

      if (!e.pv_repeat_context || args_list.length) {
        var fn = target_view.tpl_events[fnName]
        if (!fn) {
          var error = new Error('cant find tpl_events item: ' + fnName)
          showError(target_view, e.event, error)
          throw error
        }
        fn.apply(target_view, [e.event, e.node].concat(args_list))
      } else {
        var fn = target_view.tpl_r_events[e.pv_repeat_context][fnName]
        if (!fn) {
          var error = new Error('cant find tpl_r_events item: ' + fnName)
          showError(target_view, e.event, error)
          throw error
        }
        fn.call(target_view, e.event, e.node, e.scope)
      }

    }
  }

  if (!view._lbr.hndPvTypeChange) {
    view._lbr.hndPvTypeChange = function(arr_arr) {
      //pvTypesChange
      //this == template
      //this != provoda.View
      const old_waypoints = this.waypoints
      const total = []
      let i = 0
      for (i = 0; i < arr_arr.length; i++) {
        if (!arr_arr[i]) {
          continue
        }
        total.push.apply(total, arr_arr[i])
      }
      const matched = []
      for (i = 0; i < total.length; i++) {
        const cur = total[i]
        if (!cur.marks) {
          continue
        }
        if (cur.marks['hard-way-point'] || cur.marks['way-point']) {
          matched.push(cur)
        }
      }
      const to_remove = old_waypoints && arrayExclude(old_waypoints, matched)
      this.waypoints = matched
      view.updateTemplatedWaypoints(matched, to_remove)
    }
  }

  if (!view._lbr.hndPvTreeChange) {
    view._lbr.hndPvTreeChange = function(current_motivator) {
      view.checkTplTreeChange(current_motivator)
    }
  }

  if (!view._lbr.anchorStateChange) {
    view._lbr.anchorStateChange = function(name, node) {
      view.useInterface('anchor-' + name, node)
    }
  }


  return view.getTemplate(
    con,
    view._lbr.hndTriggerTPLevents,
    view._lbr.hndPvTypeChange,
    view._lbr.hndPvTreeChange,
    view._lbr.anchorStateChange
  )
}
