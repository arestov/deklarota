

import spv from '../../spv'
import angbo from '../StatementsAngularParser.min'
import dom_helpers from '../utils/dom_helpers'
import { emptyObject } from '../utils/sameObjectIfEmpty'
import parser from './parser'
import PvSimpleSampler from './PvSimpleSampler'
import parseEasy from './parseEasy'
import { ViewFlowStepInternalRuntimeFn } from '../View/viewFlowStepHandlers.types'
const CH_GR_LE = 2

const push = Array.prototype.push
const addEvent = spv.addEvent
const removeEvent = spv.removeEvent

const append = dom_helpers.append
const after = dom_helpers.after
const detach = dom_helpers.detach
const before = dom_helpers.before
const wrap = dom_helpers.wrap
const unwrap = dom_helpers.unwrap

/*

<!--
<div pv-import="imp-area_for_button">
  <script type="pv-import-map">
    [
      {
        "imp-desc_item": "imp-desc_item-tag"
      },
      {
        "nav_title": "nav_title"
      },
      {
        "previews": [
          [{
            "title": "full_title"
          }],
          "songs"
        ]
      }
    ]
  </script>
</div>
-->
*/

const makeSpecStatesList = function(states) {
  const result = []
  for (const state_name in states) {
    if (!states.hasOwnProperty(state_name)) {
      continue
    }
    result.push(state_name, states[state_name])
  }
  return result
}

const mutateStwat = (target) => {
  if (Object.isFrozen(target.stwat_index)) {
    target.stwat_index = {}
  }

  return target.stwat_index
}

const PvTemplate = function(opts) {
  this.dead = false
  this.pv_types_collecting = false
  this.states_inited = false
  this.waypoints = null


  //this.pv_views = null;
  //this.parsed_pv_views = null;

  this.stwat_index = emptyObject
  this.all_chunks = []

  this.root_node = opts.node

  this.root_node_raw = 'nodeType' in this.root_node ? this.root_node : this.root_node[0]
  this.pv_repeat_context = null
  if (opts.pv_repeat_context) {
    this.pv_repeat_context = opts.pv_repeat_context
  }

  this.calls_flow = opts.calls_flow || null
  if (!this.calls_flow) {
    //debugger;
  }
  this.received_states = null
  this.calls_flow_index = this.calls_flow ? {} : null
  this.scope = null
  if (opts.scope) {
    this.scope = opts.scope
  }
  this.spec_states_props_list = null
  if (opts.spec_states) {
    this.spec_states_props_list = makeSpecStatesList(opts.spec_states)
    //spec_states
  }
  if (opts.callCallbacks) {
    this.sendCallback = opts.callCallbacks
  }
  this.pvTypesChange = opts.pvTypesChange
  this.pvTreeChange = opts.pvTreeChange
  this.anchorStateChange = opts.anchorStateChange
  this.struc_store = opts.struc_store
  this.ancs = null
  //this.pv_views = [];
  //this.parsed_pv_views = [];
  this.pv_repeats = null
  this.children_templates = null

  this.data_limitations = opts.data_limitations

  this.states_watchers = []
  this.pv_types = null
  this.pv_repeats_data = null
  this.destroyers = null

  this.getSample = opts.getSample

  this.pv_types_collecting = true
  this.parsePvDirectives(this.root_node, opts.struc_store)
  if (!angbo || !angbo.interpolateExpressions) {
    console.log('cant parse statements')
  }

  // if (this.pv_replacers_simple) {
  // 	for (var i = 0; i < this.pv_replacers_simple.length; i++) {
  // 		var cur = this.pv_replacers_simple[i];
  // 		var sample = this.getSample(cur.sample_name);
  // 		$(cur.node).after(sample);
  // 		this.parsePvDirectives(sample, opts.struc_store);


  // 	}
  // }

  if (this.scope) {
    this.setStates(this.scope)
  }
  this.pv_types_collecting = false
  if (this.pv_types) {
    this._pvTypesChange()
  }

  Object.seal(this)
}


const appendSpace = function() {
  //fixme
  //$(target).append(document.createTextNode(' '));
}


const abortFlowStep = function(tpl, w_cache_key) {
  const flow_step = tpl.calls_flow_index[w_cache_key]
  if (flow_step) {
    tpl.calls_flow_index[w_cache_key] = null
    flow_step.abort()
  }
}

const removeFlowStep = function(tpl, w_cache_key) {
  tpl.calls_flow_index[w_cache_key] = null
}

const hndPVRepeat = function(new_fv, states) {
  const wwtch = this
  removeFlowStep(wwtch.context, wwtch.w_cache_key)
  //var new_fv = spv.getTargetField(states, wwtch.field_name);


  if (wwtch.original_fv != new_fv) {
    const context = wwtch.context
    //var node = wwtch.node;
    const old_nodes = wwtch.old_nodes
    const repeat_data = wwtch.repeat_data
    const field_name = wwtch.field_name
    const valueIdent = wwtch.valueIdent
    const keyIdent = wwtch.keyIdent
    const comment_anchor = wwtch.comment_anchor
    const sampler = wwtch.sampler
    /*var new_value = calculator(states);
    if (simplifyValue){
      new_value = simplifyValue.call(_this, new_value);
    }*/


    const repeats_array = []
    repeat_data.array = []
    context.pv_types_collecting = true

    detach(old_nodes)
    old_nodes.length = 0

    wwtch.original_fv = new_fv
    const collection = wwtch.calculator(states)


    let full_pv_context = ''
    if (context.pv_repeat_context) {
      full_pv_context = context.pv_repeat_context + '.$.'
    }
    full_pv_context += field_name

    const fragt = window.document.createDocumentFragment()

    for (let i = 0; collection != null && i < collection.length; i++) {
      const scope = {}
      scope[valueIdent] = collection[i]
      if (keyIdent) {scope[keyIdent] = i}
      scope.$index = i

      scope.$first = (i === 0)
      scope.$last = (i === (collection.length - 1))
      scope.$middle = !(scope.$first || scope.$last)

      const cur_node = sampler.getClone()
      const template = new PvTemplate({
        node: cur_node,
        pv_repeat_context: full_pv_context,
        scope: scope,
        callCallbacks: context.sendCallback,
        struc_store: context.struc_store,
        calls_flow: context.calls_flow
      })

      old_nodes.push(cur_node)
      append(fragt, cur_node)
      appendSpace(fragt)
      repeats_array.push(template)
      repeat_data.array.push(template)
    }
    after(comment_anchor, fragt)
    if (!context.pv_repeats) {
      context.pv_repeats = {}
    }
    context.pv_repeats[full_pv_context] = repeats_array
    context.pv_types_collecting = false
    context._pvTypesChange()

  //	setValue.call(_this, node, attr_obj, new_value, original_value);
  //	original_value = new_value;
  }
}


const checkPVRepeat = function(states, async_changes) {
  const wwtch = this
  abortFlowStep(wwtch.context, wwtch.w_cache_key)
  const new_fv = spv.getTargetField(states, wwtch.field_name)



  if (wwtch.original_fv != new_fv) {
    if (async_changes) {
      const flow_step = wwtch.context.calls_flow.pushToFlowWithMotivator(ViewFlowStepInternalRuntimeFn, hndPVRepeat, this, [new_fv, states], true)
      wwtch.context.calls_flow_index[wwtch.w_cache_key] = flow_step
    } else {
      hndPVRepeat.call(this, new_fv, states)
    }
  }
}


const removePvView = function(item, index) {
  const real_name = item.coll_name
  const space = item.space || 'main'
  if (item.for_model) {
    const field = [real_name, 'by_model_name', space]
    const storage = spv.getTargetField(index, field)
    if (storage) {
      storage.index[item.for_model] = null
    }
  } else {
    spv.setTargetField(index, [real_name, 'usual', space], null)

    //result[real_name][space] = cur;
  }
}


const indexPvView = function(item, index) {
  const real_name = item.coll_name
  const space = item.space || 'main'
  if (item.for_model) {
    const field = [real_name, 'by_model_name', space]
    let storage = spv.getTargetField(index, field)
    if (!storage) {
      storage = {index: {}}
      spv.setTargetField(index, field, storage)
    }
    if (storage.index[item.for_model]) {
      throw new Error('you can\'t have multiple `by_model` views')
      // not implemented yet. so don't use it;
    }

    item.comment_anchor = window.document.createComment(
      'collch anchor for: ' + real_name + ', ' + item.for_model + ' (by_model_name)'
    )
    before(item.node, item.comment_anchor)

    //cur.sampler
    item.original_node = item.node
    //cur.sampler =
    detach(item.node)

    storage.index[item.for_model] = item
  } else {
    spv.setTargetField(index, [real_name, 'usual', space], item)

    //result[real_name][space] = cur;
  }
}

const BnddChunk = function(type, data) {
  this.type = type
  this.data = data
  this.dead = false
  this.handled = false
  this.states_inited = false
  this.destroyer = null
}


const handleChunks = (function() {
  const chunk_destroyers = {
    'states_watcher': function(chunk, tpl) {
      tpl.states_watchers = spv.findAndRemoveItem(tpl.states_watchers, chunk.data)
    },
    'ancs': function(chunk, tpl) {

      const anchor_name = chunk.data.anchor_name

      if (tpl.anchorStateChange) {
        tpl.anchorStateChange(anchor_name, null)
      }

      if (!tpl.ancs) {return}



      tpl.ancs[anchor_name] = null
    },
    'pv_type': function(chunk, tpl) {
      if (!tpl.pv_types) {return}
      tpl.pv_types = spv.findAndRemoveItem(tpl.pv_types, chunk.data)
    },
    'pv_event': function(chunk) {
      chunk.destroyer()
    },
    'pv_view': function(chunk, tpl) {
      if (!tpl.children_templates) {return}
      removePvView(chunk.data, tpl.children_templates)
      if (chunk.data.destroyers) {
        while (chunk.data.destroyers.length) {
          const cur = chunk.data.destroyers.pop()
          cur()
        }
      }
    },
    'pv_repeat': function(chunk, tpl) {
      if (!tpl.pv_repeats_data) {return}
      tpl.pv_repeats_data = spv.findAndRemoveItem(tpl.pv_repeats_data, chunk.data)
    }
  }
  const chunk_handlers = {
    'states_watcher': function(chunk, tpl) {
      tpl.states_watchers.push(chunk.data)
    },
    'ancs': function(chunk, tpl) {
      if (!tpl.ancs) {
        tpl.ancs = {}
      }
      const anchor_name = chunk.data.anchor_name
      if (tpl.ancs[anchor_name]) {
        throw new Error('anchors exists')
      } else {
        if (tpl.anchorStateChange) {
          tpl.anchorStateChange(anchor_name, unwrap(chunk.data.node))
        }

        tpl.ancs[anchor_name] = wrap(chunk.data.node)
      }
    },
    'pv_type': function(chunk, tpl) {
      if (!tpl.pv_types) {
        tpl.pv_types = []
      }
      tpl.pv_types.push(chunk.data)
    },
    'pv_event': function(chunk, tpl) {
      chunk.destroyer = tpl.bindPVEvent(chunk.data.node, chunk.data.evdata)
    },
    'pv_view': function(chunk, tpl) {
      if (!tpl.children_templates) {
        tpl.children_templates = {}
      }
      indexPvView(chunk.data, tpl.children_templates)
    },
    'pv_repeat': function(chunk, tpl) {
      if (!tpl.pv_repeats_data) {
        tpl.pv_repeats_data = []
      }
      tpl.pv_repeats_data.push(chunk.data)
    }
  }

  return function handleChunks(items, tpl, need_clean) {
    if (!items) {return need_clean && []}
    const result = need_clean && []
    for (let i = 0; i < items.length; i++) {
      const chunk = items[i]
      if (!chunk.dead) {
        result.push(chunk)
      } else {
        const destroyer = chunk_destroyers[chunk.type]
        if (destroyer) {
          destroyer(chunk, tpl)
        }
      }
      if (!chunk.dead && !chunk.handled) {
        chunk.handled = true
        chunk_handlers[chunk.type](chunk, tpl)
      }
    }
    return result
  }
})()

spv.Class.extendTo(PvTemplate, {
  _pvTypesChange: function() {
    if (this.pv_types_collecting) {
      return
    } else {
      if (this.pvTypesChange) {
        this.pvTypesChange.call(this, this.getTypedNodes())
      }
    }
  },
  destroy: function() {
    this.dead = true
    for (let i = 0; i < this.all_chunks.length; i++) {
      this.all_chunks[i].dead = true
    }
    handleChunks(this.all_chunks, this, false)
    this.all_chunks = null
    this.stwat_index = emptyObject

    if (this.destroyers) {


      while (this.destroyers.length) {
        const cur = this.destroyers.shift()
        cur.call(this)
      }
    }
    if (this.calls_flow_index) {
      for (const w_cache_key in this.calls_flow_index) {
        if (this.calls_flow_index.hasOwnProperty(w_cache_key) && typeof this.calls_flow_index[w_cache_key] == 'function') {
          this.calls_flow_index[w_cache_key].abort()
          this.calls_flow_index[w_cache_key] = null

        }
      }
    }

    this.calls_flow_index = null
  },
  getTypedNodes: function() {
    const result = []
    let objs = [this]
    while (objs.length) {
      const cur = objs.shift()
      if (cur.pv_types && cur.pv_types.length) {
        result.push(cur.pv_types)
      }

      if (!cur.pv_repeats_data) {
        continue
      }

      for (let i = 0; i < cur.pv_repeats_data.length; i++) {
        if (cur.pv_repeats_data[i].array) {
          objs = objs.concat(cur.pv_repeats_data[i].array)
        }

      }
    }
    return result
  },


  scope_generators:{

    'pv-rel': function(node, data) {
      //coll_name for_model filter
      if (typeof data.coll_name == 'string') {
        const pv_view = {
          views: [],
          node: node,
          sampler: new PvSimpleSampler(node, this.struc_store, this.getSample),
          coll_name: data.coll_name,
          controller_name: data.controller_name,
          for_model: data.for_model,
          space: data.space,
          filterFn: data.filterFn,
          destroyers: null,
          onDie: function(cb) {
            if (!pv_view.destroyers) {
              pv_view.destroyers = []
            }
            pv_view.destroyers.push(cb)
          }
        }
        return new BnddChunk('pv_view', pv_view)
      }
    },
    'pv-repeat': function(node, data) {
      if (node == this.root_node) {
        return
      }

      const
        expression = data.expression
      const valueIdent = data.valueIdent
      const keyIdent = data.keyIdent
      const calculator = data.calculator
      const sfy_values = data.sfy_values

      const comment_anchor = window.document.createComment('pv-repeat anchor for: ' + expression)
      after(node, comment_anchor)

      detach(node)
      const repeat_data = {
        array: null
      }
      let nothing

      return [
        new BnddChunk('pv_repeat', repeat_data),
        new BnddChunk('states_watcher', {
          w_cache_key:  node.pvprsd + '_' + node.pvprsd_inst + '*' + 'pv-repeat',
          node: node,
          context: this,
          original_fv: nothing,
          old_nodes: [],


          repeat_data: repeat_data,
          comment_anchor: comment_anchor,


          sampler: new PvSimpleSampler(node, this.struc_store, this.getSample),
          valueIdent: valueIdent,
          keyIdent: keyIdent,
          calculator: calculator,
          field_name: sfy_values[0],

          values: calculator.propsToWatch,
          sfy_values: sfy_values,
          checkFunc: checkPVRepeat
        })
      ]
    }
  },

  empty_state_obj: {},

  bindPVEvent: (function() {
    const getDestroer = function(node, event_name, callback) {
      return function destroyer() {
        removeEvent(node, event_name, callback)
      }
    }

    return function(node, evdata) {
      const _this = this

      const userCallback = evdata.fn
      const event_name = evdata.event_name

      evdata = null

      const callback = function(e) {
        userCallback.call(this, e, _this)
      }

      const destroyer = getDestroer(node, event_name, callback)

      addEvent(node, event_name, callback)

      // if (!this.destroyers) {
      // 	this.destroyers = [];
      // }

      // this.destroyers.push(destroyer);
      return destroyer
    }
  })(),


  callEventCallback: function(node, e, data) {
    this.sendCallback({
      event: e,
      node: node,
      callback_name: data[0],
      callback_data: data,
      pv_repeat_context: this.pv_repeat_context,
      scope: this.scope
    })
  },
  initStates: function(async_changes, current_motivator) {
    // we should try render every states_watchers since states could not have every key
    const states_summ = this.received_states || this.scope
    const remainded_stwats = this.states_watchers
    for (let i = 0; i < remainded_stwats.length; i++) { // UsualWWtch, BnddChunk, ...?
      if (this.dead) {return}
      const cur = remainded_stwats[i]
      if (cur.states_inited) {
        continue
      }
      cur.states_inited = true
      cur.checkFunc(states_summ, async_changes, current_motivator)
    }
  },
  __rememberStates(full_states) {
    //вместо того что бы собирать новый хэш на основе массива изменений используются объект всеъ состояний
    const states_summ = this.getStatesSumm(full_states)
    this.received_states = states_summ
    return states_summ
  },
  __initIfNeeded() {
    if (this.states_inited) {
      return false
    }

    this.states_inited = true
    this.initStates()

    return true
  },
  ensureInitedWithStates(full_states) {
    this.__rememberStates(full_states)

    return this.__initIfNeeded()
  },
  checkChanges: function(changes, full_states, async_changes, current_motivator) {
    // async_changes is always true?
    if (this.dead) {return}
    if (async_changes && !current_motivator) {
      // throw new Error('should be current_motivator');
    }

    const states_summ = this.__rememberStates(full_states)

    if (this.__initIfNeeded()) {
      return
    }

    let matched = []
    let i = 0
    mutateStwat(this)
    for (i = 0; i < changes.length; i += CH_GR_LE) { //ищем подходящие директивы
      const name = changes[i]
      if (this.stwat_index[name]) {
        push.apply(matched, this.stwat_index[name])
      }
    }

    matched = spv.getArrayNoDubs(matched)//устраняем повторяющиеся директивы


    for (i = 0; i < matched.length; i++) {
      matched[i].checkFunc(states_summ, async_changes, current_motivator)
      if (this.dead) {return}
    }
  },
  getStatesSumm: function(states) {
    if (!this.spec_states_props_list) {
      return states
    }

    const states_summ = Object.create(states)

    for (let i = 0; i < this.spec_states_props_list.length; i += 2) {
      const state_name = this.spec_states_props_list[ i ]
      const state_value = this.spec_states_props_list[ i + 1]
      states_summ[ state_name ] = state_value
    }

    spv.cloneObj(states_summ, this.spec_states)
    return states_summ
  },
  setStates: function(states) {
    const states_summ = this.getStatesSumm(states)
    for (let i = 0; i < this.states_watchers.length; i++) {
      this.states_watchers[i].checkFunc(states_summ)
    }

  },
  /*
  checkValues: function(array, all_states) {
    var checked = [];

    for (var i = 0; i < array.length; i++) {
      array[i]
    }
  },*/
  handleDirective: (function() {
    const multipleStandChes = function(node, standches) {
      if (!standches) {
        return
      }

      const result = []
      for (let i = 0; i < standches.length; i++) {
        const wwtch = standches[i].createBinding(node, this)
        result.push(new BnddChunk('states_watcher', wwtch))
      }
      return result
    }
    const directives_h = {
      // 'pv-replace': function(node, index) {
      // 	if (index) {
      // 		if (index['pv-when']) {

      // 		} else {
      // 			var data = {
      // 				sample_name: index.sample_name,
      // 				node: node
      // 			};
      // 			return new BnddChunk('pv_replacer_simple', data);
      // 		}
      // 	}
      // },
      'pv-when-condition': function(node, standch) {
        if (!standch) {
          return
        }

        const wwtch = standch.createBinding(node, this)
        const destroyer = function() {
          if (wwtch.destroyer) {
            wwtch.destroyer()
          }
        }
        const chunk = new BnddChunk('states_watcher', wwtch)
        chunk.destroyer = destroyer
        return chunk

      },
      'pv-text': function(node, standch) {
        if (!standch) {
          return
        }

        const wwtch = standch.createBinding(node, this)
        return new BnddChunk('states_watcher', wwtch)
      },
      'pv-class': multipleStandChes,
      'pv-props': multipleStandChes,
      'pv-style-props': multipleStandChes,
      'pv-anchor': function(node, full_declaration) {
        const anchor_name = full_declaration
        return new BnddChunk('ancs', {
          anchor_name: anchor_name,
          node: node
        })
      },
      'pv-type': function(node, standch) {
        if (!standch) {
          return
        }

        const pv_type_data = {node: node, marks: null}

        const wwtch = standch.createBinding(node, this)
        wwtch.pv_type_data = pv_type_data
        wwtch.checkFunc(this.empty_state_obj)

        return [
          new BnddChunk('states_watcher', wwtch),
          new BnddChunk('pv_type', pv_type_data)
        ]

      },
      'pv-events': function(node, pv_events_data) {
        if (!pv_events_data) {
          return
        }

        if (!this.sendCallback) {
          throw new Error('provide the events callback handler to the Template init func')
        }
        const result = []

        for (let i = 0; i < pv_events_data.length; i++) {
          const evdata = pv_events_data[i]
          result.push(new BnddChunk('pv_event', {node: node, evdata: evdata}))
        }
        return result
      },
      'pv-log'(node, full_declaration) {
        this.callEventCallback(node, null, ['_log', full_declaration])
      }
    }

    return function(directive_name, node, full_declaration) {
      const method = directives_h[directive_name]
      if (!method) {
        //window.dizi = [directive_name, node, full_declaration]
        //window.dizi2 = directives_h;
        //window.dizi3 = directives_h[directive_name];
        console.log(directive_name, node, full_declaration)
        console.log(directives_h)
      }
      const result = method.call(this, node, full_declaration)
      return result


    }
  })(),
  indexPvViews: function(array, result) {

    for (let i = 0; i < array.length; i++) {
      const cur = array[i]
      indexPvView(cur, result)

    }
    return result
  },
  parseAppended: function(node) {
    return this.parsePvDirectives(node)
  },
  parseAppendedAndInit: function(node) {
    const result = this.parsePvDirectives(node)
    if (!result.length) {
      return result
    }
    this.initStates()
    return result
  },
  iterateBindingList: (function() {

    const config = parser.config

    const pseudo_list = config.pseudo_list
    const scope_g_list = config.scope_g_list
    const directives_names_list = config.directives_names_list
    const comment_directives_names_list = config.comment_directives_names_list

    const pushChunks = function(all_chunks, chunks) {
      if (chunks) {
        if (Array.isArray(chunks)) {
          push.apply(all_chunks, chunks)
        } else {
          all_chunks.push(chunks)
        }
      }
      return all_chunks
    }

    return function(is_root_node, cur_node, directives_data, all_chunks) {
      let i = 0
      let directive_name
      if (!is_root_node) {
        //используем директивы генерирующие scope только если это не корневой элемент шаблона
        for (i = 0; i < pseudo_list.length; i++) {
          directive_name = pseudo_list[i]
          if (directives_data.instructions[directive_name]) {
            const chunks_o = this.handleDirective(directive_name, cur_node, directives_data.instructions[directive_name])
            pushChunks(all_chunks, chunks_o)
          }
        }

        for (i = 0; i < scope_g_list.length; i++) {
          directive_name = scope_g_list[i]
          if (directives_data.instructions[directive_name]) {
            const chunks_s = this.scope_generators[directive_name]
              .call(this, cur_node, directives_data.instructions[directive_name])

            pushChunks(all_chunks, chunks_s)
          }

        }
      }
      if (!directives_data.new_scope_generator || is_root_node) {
        //используем директивы если это node не генерирующий scope или это корневой элемент шаблона

        for (i = 0; i < directives_names_list.length; i++) {
          directive_name = directives_names_list[i]
          if (directives_data.instructions[directive_name]) {
            const chunks_d = this.handleDirective(directive_name, cur_node, directives_data.instructions[directive_name])
            pushChunks(all_chunks, chunks_d)
          }
        }

        for (i = 0; i < comment_directives_names_list.length; i++) {
          directive_name = comment_directives_names_list[i]
          if (directives_data.instructions[directive_name]) {
            const chunks_c = this.handleDirective(directive_name, cur_node, directives_data.instructions[directive_name])
            pushChunks(all_chunks, chunks_c)
          }
        }

      }
      return all_chunks
    }
  })(),
  checkChunks: function() {
    this.all_chunks = handleChunks(this.all_chunks, this, true)
    this.stwat_index = spv.makeIndexByField(this.states_watchers, 'sfy_values', true)
  },
  parsePvDirectives: function(start_node) {
    if (this.dead) {return}
    const struc_store = this.struc_store
    start_node = 'nodeType' in start_node ? start_node : start_node[0]

    const vroot_node = this.root_node_raw

    const list_for_binding = parseEasy(start_node, vroot_node, struc_store, this.getSample)

    const all_chunks = []
    for (let i = 0; i < list_for_binding.length; i += 3) {
      this.iterateBindingList(
        list_for_binding[ i ],
        list_for_binding[ i + 1 ],
        list_for_binding[ i + 2 ],
        all_chunks)
    }
    if (this.dead) {return}
    this.all_chunks = this.all_chunks.concat(all_chunks)


    this.checkChunks()
    //this.children_templates = this.indexPvViews(this.parsed_pv_views, this.children_templates);

    // this.pv_views = this.pv_views.concat(this.parsed_pv_views);
    // this.parsed_pv_views = [];


    return all_chunks
  }
})
PvTemplate.SimplePVSampler = PvSimpleSampler

PvTemplate.templator = function(calls_flow, getSample, struc_store) {
  struc_store = struc_store || {}
  function template(node, callCallbacks, pvTypesChange, spec_states, pvTreeChange, anchorStateChange) {
    return new PvTemplate({
      node: node[0] || node,
      spec_states: spec_states,
      callCallbacks: callCallbacks,
      pvTypesChange: pvTypesChange,
      anchorStateChange: anchorStateChange,
      struc_store: struc_store,
      calls_flow: calls_flow,
      getSample: getSample,
      pvTreeChange: pvTreeChange
    })
  }

  function sampler(sample_node) {
    return new PvSimpleSampler(sample_node, struc_store, getSample)
  }

  return {
    template: template,
    sampler: sampler
  }
}

export default PvTemplate
