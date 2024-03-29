
import d_parsers from './directives_parsers'

import getPatchedTree from './getPatchedTree'
import spv from '../../spv'
import parseEasy from './parseEasy'
import parse from './parse'
import buildClone from './buildClone'
import dom_helpers from '../utils/dom_helpers'

const config = d_parsers.config

const dWrap = dom_helpers.wrap

const PvSimpleSampler = (function() {
  const push = Array.prototype.push

  let samplers_counter = 0

  const PvSimpleSampler = function(node, struc_store, getSample) {
    node = dWrap(node)
    node = node[0]
    if (!node) {
      throw new Error('wrong node')
    }
    this.onode = node
    this.mod_root_node = null
    this.patched_cache = null

    this.parsed = false
    this.structure_data_as_root = null
    this.structure_data = null
    this.struc_store = struc_store
    this._id = ++samplers_counter

    this.getSample = getSample
    this.nodes = null
    this.pstd_cache = null
  };
  (function() {
    const likeAttrs = {
      'dk-props': true,
      'dk-style-props': true,
    }
    const setStructureData = function(struc_store, is_root_node, cur_node, bind_data, states_list, children_list, getSample) {
      if (!is_root_node) {
        if (bind_data.instructions['dk-rel']) {
          children_list.push({
            item: parseStructureData(cur_node, struc_store, false, getSample),
            data: bind_data.instructions['dk-rel']
          })
        }


        let has_scope_gen = false
        for (let i = 0; i < config.scope_g_list.length; i++) {
          const directive_name = config.scope_g_list[i]
          if (bind_data.instructions[directive_name]) {
            has_scope_gen = true
            if (config.states_using_directives[directive_name]) {
              //mainaly for dk-repeat
              push.apply(states_list, bind_data.instructions[directive_name].sfy_values)
            }

          }
        }
        if (has_scope_gen) {
          //mainaly dk-repeat and dk-rel
          return
        }
      }
      for (let i = 0; i < config.sud_list.length; i++) {
        const cur = config.sud_list[i]
        if (!bind_data.instructions[cur]) {
          continue
        }

        // 'dk-props'
        if (likeAttrs[cur] !== true) {
          push.apply(states_list, bind_data.instructions[cur].sfy_values)
          continue
        }

        for (let iii = 0; iii < bind_data.instructions[cur].length; iii++) {
          const sub_cur = bind_data.instructions[cur][iii].sfy_values
          push.apply(states_list, sub_cur)
        }
      }
    }


    function parseStructureData(node, struc_store, is_not_root, getSample) {
      const structure_data = {
        node_id: null,
        states: [],
        children: null,
        children_by_mn: null,
        controller_name: null
      }
      const children_list = []


      const bind_data_list = parseEasy(node, !is_not_root && node, struc_store, getSample)
      for (let i = 0; i < bind_data_list.length; i += 3) {
        const
          is_root_node = bind_data_list[ i ]
        const cur_node = bind_data_list[ i + 1 ]
        const bind_data = bind_data_list[ i + 2 ]

        if (is_root_node && bind_data.instructions['dk-rel']) {
          structure_data.controller_name = bind_data.instructions['dk-rel'].controller_name
        }

        setStructureData(struc_store, is_root_node, cur_node, bind_data, structure_data.states, children_list, getSample)
      }
      structure_data.states = spv.getArrayNoDubs(structure_data.states)


      if (children_list.length) {
        let usual = null
        let by_model_name = null

        for (let i = 0; i < children_list.length; i++) {
          const cur = children_list[i]
          if (cur.data.for_model) {
            if (!by_model_name) {
              by_model_name = {}
            }
            spv.setTargetField(by_model_name, [cur.data.coll_name, cur.data.for_model, cur.data.space || 'main'], cur.item)
          } else {
            if (!usual) {
              usual = {}
            }
            spv.setTargetField(usual, [cur.data.coll_name, cur.data.space || 'main'], cur.item)
          }

        }

        structure_data.children = usual
        structure_data.children_by_mn = by_model_name
        /*

        coll_name: "top_songs"
        filterFn: undefined
        for_model: undefined
        space: ""

        */
      }
      structure_data.node_id = node.pvprsd
      return structure_data
    }

    PvSimpleSampler.prototype.getStructure = function(is_not_root) {
      const str_d_prop_name = 'structure_data' + (is_not_root ? '' : '_as_root')

      if (!this.pstd_cache) {this.pstd_cache = {}}

      if (!this.pstd_cache[str_d_prop_name]) {
        this.pstd_cache[str_d_prop_name] = parseStructureData(this.onode, this.struc_store, is_not_root, this.getSample)
        //this[str_d_prop_name]._id = this._id;
        this.parsed = true

      }
      return this.pstd_cache[str_d_prop_name]

    }

  })()

  PvSimpleSampler.prototype.getClone = function(opts) {
    if (!this.onode) {
      return
    }

    if (opts && !opts.key) {
      throw new Error('opts should have uniq key')
    }

    if (opts) {
      console.log('IMPLEMENT OPTIONS SUPPORT')
    }

    if (!this.nodes) {
      this.nodes = parse(this.onode, this.struc_store, this.getSample, opts)
    }

    if (opts) {
      if (!this.patched_cache) {
        this.patched_cache = {}
      }
      if (!this.patched_cache[opts.key]) {
        this.patched_cache[opts.key] = getPatchedTree(
          this.onode, this.struc_store, this.getSample, opts, this._id)
      }

      return buildClone(this.patched_cache[opts.key], this.struc_store, this._id)

    } else {
      if (!this.mod_root_node) {
        this.mod_root_node = getPatchedTree(
          this.onode, this.struc_store, this.getSample, opts, this._id)
      }

      return buildClone(this.mod_root_node, this.struc_store, this._id)
    }

    // if (!this.parsed){
    // 	this.parsed = true;
    // 	parser.parse(this.onode, this.struc_store, this.getSample, opts);
    // }


  }
  PvSimpleSampler.prototype.clone = PvSimpleSampler.prototype.getClone

  return PvSimpleSampler
})()

export default PvSimpleSampler
