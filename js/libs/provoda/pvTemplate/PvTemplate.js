define(function(require) {
"use strict";

var spv = require('spv');
var angbo = require('angbo');

var parser = require('./parser');
var PvSimpleSampler = require('./PvSimpleSampler');
var parseEasy = require('./parseEasy');
var BnddChunk = require('./BnddChunk')
var indexPvView = require('./indexPvView')
var handleChunks = require('./handleChunks')

var initPvWhenCond = require('./pv-when-condition/init')
var initPvClass = require('./pv-class/init')
var initPvText = require('./pv-text/init')
var initPvProps = require('./pv-props/init')
var initPvType = require('./pv-type/init')
var initPvEvents = require('./pv-events/init')

var initPvNest = require('./pv-nest/init')
var initPvRepeat = require('./pv-repeat/init')

var push = Array.prototype.push;
var addEvent = spv.addEvent;
var removeEvent = spv.removeEvent;

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

var makeSpecStatesList = function(states) {
  var result = [];
  for (var state_name in states) {
    if (!states.hasOwnProperty(state_name)){
      continue;
    }
    result.push(true, state_name, states[state_name]);
  }
  return result;
};
var PvTemplate = function(opts) {
  this.pv_types_collecting = false;
  this.states_inited = false;
  this.waypoints = null;


  //this.pv_views = null;
  //this.parsed_pv_views = null;

  this.stwat_index = null;
  this.all_chunks = [];

  this.root_node = opts.node;

  this.root_node_raw = 'nodeType' in this.root_node ? this.root_node : this.root_node[0];
  this.pv_repeat_context = null;
  if (opts.pv_repeat_context){
    this.pv_repeat_context = opts.pv_repeat_context;
  }

  this.calls_flow = opts.calls_flow || null;
  if (!this.calls_flow) {
    //debugger;
  }
  this.received_states = null
  this.calls_flow_index = this.calls_flow ? {} : null;
  this.scope = null;
  if (opts.scope){
    this.scope = opts.scope;
  }
  this.spec_states_props_list = null;
  if (opts.spec_states){
    this.spec_states_props_list = makeSpecStatesList(opts.spec_states);
    //spec_states
  }
  if (opts.callCallbacks){
    this.sendCallback = opts.callCallbacks;
  }
  this.pvTypesChange = opts.pvTypesChange;
  this.pvTreeChange = opts.pvTreeChange;
  this.struc_store = opts.struc_store;
  this.ancs = null;
  //this.pv_views = [];
  //this.parsed_pv_views = [];
  this.pv_repeats = null;
  this.children_templates = null;

  this.data_limitations = opts.data_limitations;

  this.states_watchers = [];
  this.stwat_index = {};
  this.pv_types = null;
  this.pv_repeats_data = null;
  this.destroyers = null;

  this.getSample = opts.getSample;

  this.pv_types_collecting = true;
  this.parsePvDirectives(this.root_node, opts.struc_store);
  if (!angbo || !angbo.interpolateExpressions){
    console.log('cant parse statements');
  }

  // if (this.pv_replacers_simple) {
  // 	for (var i = 0; i < this.pv_replacers_simple.length; i++) {
  // 		var cur = this.pv_replacers_simple[i];
  // 		var sample = this.getSample(cur.sample_name);
  // 		$(cur.node).after(sample);
  // 		this.parsePvDirectives(sample, opts.struc_store);


  // 	}
  // }

  if (this.scope){
    this.setStates(this.scope);
  }
  this.pv_types_collecting = false;
  if (this.pv_types) {
    this._pvTypesChange();
  }


};


spv.Class.extendTo(PvTemplate, {
  _pvTypesChange: function() {
    if (this.pv_types_collecting){
      return;
    } else {
      if (this.pvTypesChange){
        this.pvTypesChange.call(this, this.getTypedNodes());
      }
    }
  },
  destroy: function() {
    this.dead = true;
    for (var i = 0; i < this.all_chunks.length; i++) {
      this.all_chunks[i].dead = true;
    }
    handleChunks(this.all_chunks, this, false);
    this.all_chunks = null;
    this.stwat_index = {};

    if (this.destroyers) {


      while (this.destroyers.length) {
        var cur = this.destroyers.shift();
        cur.call(this);
      }
    }
    if (this.calls_flow_index) {
      for (var w_cache_key in this.calls_flow_index) {
        if (this.calls_flow_index.hasOwnProperty(w_cache_key) && typeof this.calls_flow_index[w_cache_key] == 'function') {
          this.calls_flow_index[w_cache_key].abort();
          this.calls_flow_index[w_cache_key] = null;

        }
      }
    }
  },
  getTypedNodes: function() {
    var result = [];
    var objs = [this];
    while (objs.length){
      var cur = objs.shift();
      if (cur.pv_types && cur.pv_types.length){
        result.push(cur.pv_types);
      }

      if (!cur.pv_repeats_data) {
        continue;
      }

      for (var i = 0; i < cur.pv_repeats_data.length; i++) {
        if (cur.pv_repeats_data[i].array){
          objs = objs.concat(cur.pv_repeats_data[i].array);
        }

      }
    }
    return result;
  },


  scope_generators:{

    'pv-nest': initPvNest,
    'pv-repeat': initPvRepeat,
  },

  empty_state_obj: {},

  bindPVEvent: (function() {
    var getDestroer = function(node, event_name, callback) {
      return function destroyer() {
        removeEvent(node, event_name, callback);
      };
    };

    return function(node, evdata) {
      var _this = this;

      var userCallback = evdata.fn;
      var event_name = evdata.event_name;

      evdata = null;

      var callback = function(e) {
        userCallback.call(this, e, _this);
      };

      var destroyer = getDestroer(node, event_name, callback);

      addEvent(node, event_name, callback);

      // if (!this.destroyers) {
      // 	this.destroyers = [];
      // }

      // this.destroyers.push(destroyer);
      return destroyer;
    };
  })(),


  callEventCallback: function(node, e, data) {
    this.sendCallback({
      event: e,
      node: node,
      callback_name: data[0],
      callback_data: data,
      pv_repeat_context: this.pv_repeat_context,
      scope: this.scope
    });
  },
  initStates: function(async_changes, current_motivator) {
    // we should try render every states_watchers since states could not have every key

    var states_summ = this.received_states
    var remainded_stwats = this.states_watchers
    for (var i = 0; i < remainded_stwats.length; i++) {
      if (this.dead) {return;}
      var cur = remainded_stwats[i]
      if (cur.states_inited) {
        continue
      }
      cur.checkFunc(states_summ, async_changes, current_motivator);
    }
  },
  checkChanges: function(changes, full_states, async_changes, current_motivator) {
    if (this.dead) {return;}
    if (async_changes && !current_motivator) {
      // throw new Error('should be current_motivator');
    }
    //вместо того что бы собирать новый хэш на основе массива изменений используются объект всеъ состояний
    var states_summ = this.getStatesSumm(full_states);
    this.received_states = states_summ

    if (!this.states_inited){
      this.states_inited = true;
      this.initStates()

      return
    }

    var matched = [], i = 0;
    for (i = 0; i < changes.length; i+= 3 ) { //ищем подходящие директивы
      var name = changes[i+1];
      if (this.stwat_index[name]){
        push.apply(matched, this.stwat_index[name]);
      }
    }

    matched = spv.getArrayNoDubs(matched);//устраняем повторяющиеся директивы


    for (i = 0; i < matched.length; i++) {
      matched[i].checkFunc(states_summ, async_changes, current_motivator);
      if (this.dead) {return;}
    }
  },
  getStatesSumm: function(states) {
    var states_summ;
    if (this.spec_states_props_list){
      states_summ = Object.create(states);

      for (var i = 0; i < this.spec_states_props_list.length; i+=3) {
        var state_name = this.spec_states_props_list[ i + 1 ];
        var state_value = this.spec_states_props_list[ i + 2];
        states_summ[ state_name ] = state_value;
      }

      spv.cloneObj(states_summ, this.spec_states);

    } else {
      states_summ = states;
    }
    return states_summ;
  },
  setStates: function(states) {
    var states_summ = this.getStatesSumm(states);
    for (var i = 0; i < this.states_watchers.length; i++) {
      this.states_watchers[i].checkFunc(states_summ);
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
    var directives_h = {
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
      'pv-when-condition': initPvWhenCond,
      'pv-text': initPvText,
      'pv-class': initPvClass,
      'pv-props': initPvProps,

      'pv-anchor': function(node, full_declaration) {
        var anchor_name = full_declaration;
        return new BnddChunk('ancs', {
          anchor_name: anchor_name,
          node: node
        });
      },
      'pv-type': initPvType,
      'pv-events': initPvEvents,
    };

    return function(directive_name, node, full_declaration) {
      var method = directives_h[directive_name];
      if (!method){
        //window.dizi = [directive_name, node, full_declaration]
        //window.dizi2 = directives_h;
        //window.dizi3 = directives_h[directive_name];
        console.log(directive_name, node, full_declaration);
        console.log(directives_h);
      }
      var result = method.call(this, node, full_declaration);
      return result;


    };
  })(),
  indexPvViews: function(array, result) {

    for (var i = 0; i < array.length; i++) {
      var cur = array[i];
      indexPvView(cur, result);

    }
    return result;
  },
  parseAppended: function(node) {
    var result = this.parsePvDirectives(node);
    this.initStates()
    return result
  },
  iterateBindingList: (function() {

    var config = parser.config;

    var pseudo_list = config.pseudo_list;
    var scope_g_list = config.scope_g_list;
    var directives_names_list = config.directives_names_list;
    var comment_directives_names_list = config.comment_directives_names_list;

    var pushChunks = function(all_chunks, chunks) {
      if (chunks) {
        if (Array.isArray(chunks)) {
          push.apply(all_chunks, chunks);
        } else {
          all_chunks.push(chunks);
        }
      }
      return all_chunks;
    };

    return function(is_root_node, cur_node, directives_data, all_chunks) {
      var i = 0;
      var directive_name;
      if (!is_root_node){
        //используем директивы генерирующие scope только если это не корневой элемент шаблона
        for (i = 0; i < pseudo_list.length; i++) {
          directive_name = pseudo_list[i];
          if (directives_data.instructions[directive_name]){
            var chunks_o = this.handleDirective(directive_name, cur_node, directives_data.instructions[directive_name]);
            pushChunks(all_chunks, chunks_o);
          }
        }

        for (i = 0; i < scope_g_list.length; i++) {
          directive_name = scope_g_list[i];
          if (directives_data.instructions[directive_name]){
            var chunks_s = this.scope_generators[directive_name]
              .call(this, cur_node, directives_data.instructions[directive_name]);

            pushChunks(all_chunks, chunks_s);
          }

        }
      }
      if (!directives_data.new_scope_generator || is_root_node){
        //используем директивы если это node не генерирующий scope или это корневой элемент шаблона

        for (i = 0; i < directives_names_list.length; i++) {
          directive_name = directives_names_list[i];
          if (directives_data.instructions[directive_name]){
            var chunks_d = this.handleDirective(directive_name, cur_node, directives_data.instructions[directive_name]);
            pushChunks(all_chunks, chunks_d);
          }
        }

        for (i = 0; i < comment_directives_names_list.length; i++) {
          directive_name = comment_directives_names_list[i];
          if (directives_data.instructions[directive_name]){
            var chunks_c = this.handleDirective(directive_name, cur_node, directives_data.instructions[directive_name]);
            pushChunks(all_chunks, chunks_c);
          }
        }

      }
      return all_chunks;
    };
  })(),
  checkChunks: function() {
    this.all_chunks = handleChunks(this.all_chunks, this, true);
    this.stwat_index = spv.makeIndexByField(this.states_watchers, 'sfy_values', true);
  },
  parsePvDirectives: function(start_node) {
    if (this.dead) {return;}
    var struc_store = this.struc_store;
    start_node = 'nodeType' in start_node ? start_node : start_node[0];

    var vroot_node = this.root_node_raw;

    var list_for_binding = parseEasy(start_node, vroot_node, struc_store, this.getSample);

    var all_chunks = [];
    for (var i = 0; i < list_for_binding.length; i+=3) {
      this.iterateBindingList(
        list_for_binding[ i ],
        list_for_binding[ i + 1 ],
        list_for_binding[ i + 2 ],
        all_chunks);
    }
    if (this.dead) {return;}
    this.all_chunks = this.all_chunks.concat(all_chunks);


    this.checkChunks();
    //this.children_templates = this.indexPvViews(this.parsed_pv_views, this.children_templates);

    // this.pv_views = this.pv_views.concat(this.parsed_pv_views);
    // this.parsed_pv_views = [];


    return all_chunks;
  }
});
PvTemplate.SimplePVSampler = PvSimpleSampler;

PvTemplate.templator = function(calls_flow, getSample, struc_store) {
  struc_store = struc_store || {};
  function template(node, callCallbacks, pvTypesChange, spec_states, pvTreeChange) {
    return new PvTemplate({
      node: node[0] || node,
      spec_states: spec_states,
      callCallbacks: callCallbacks,
      pvTypesChange: pvTypesChange,
      struc_store: struc_store,
      calls_flow: calls_flow,
      getSample: getSample,
      pvTreeChange: pvTreeChange
    });
  }

  function sampler(sample_node) {
    return new PvSimpleSampler(sample_node, struc_store, getSample);
  }

  return {
    template: template,
    sampler: sampler
  };
};

return PvTemplate;
});
