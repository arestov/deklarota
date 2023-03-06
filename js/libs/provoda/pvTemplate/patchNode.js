
import d_parsers from './directives_parsers'
import dom_helpers from '../utils/dom_helpers'
import getCachedPVData from './getCachedPVData'
import StandartChange from './StandartChange'
import getTemplateOptions from './pv-import/getTemplateOptions'
import PvSimpleSampler from './PvSimpleSampler'
// var patching_directives = d_parsers.patching_directives;
const getIndexList = d_parsers.getIndexList
const setStrucKey = getCachedPVData.setStrucKey

const dRemove = dom_helpers.remove
const dAfter = dom_helpers.after

const patching_directives = {
  'pv-import': (function() {
    let counter = 1

    function createKey() {
      return counter++
    }

    return function(node, params, getSample, _opts) {
      const comment_anchor = window.document.createComment('anchor for pv-import ' + params.sample_name)
      const parent_node = node.parentNode
      parent_node.replaceChild(comment_anchor, node)

      const template_options = getTemplateOptions(params, createKey)

      const directives_data = {
        new_scope_generator: true,
        instructions: {
          'pv-when-condition': makePvWhen(comment_anchor, '_node_id', function() {
            return getSample(params.sample_name, true, template_options)
          }, null)
        }
      }
      comment_anchor.directives_data = directives_data
      return comment_anchor
    }
  })(),
  'pv-when': function(node, params, _getSample, _opts) {
    const parent_node = node.parentNode
    const full_declaration = params

    const comment_anchor = window.document.createComment('anchor for pv-when')
    parent_node.replaceChild(comment_anchor, node)
    const directives_data = {
      new_scope_generator: true,
      instructions: {
        'pv-when-condition': makePvWhen(comment_anchor, full_declaration, false, node)
      }
    }
    comment_anchor.directives_data = directives_data
    return comment_anchor
  },
  'pv-replace': function(node, params, getSample, opts) {
    params.done = true
    const map = opts && opts.samples

    const sample_name = (map && map[params.sample_name]) || params.sample_name

    const parent_node = node.parentNode
    if (!params['pv-when']) {
      const tnode = getSample(sample_name, true)
      parent_node.replaceChild(tnode, node)
      return tnode
    } else {
      const comment_anchor = window.document.createComment('anchor for pv-when')
      parent_node.replaceChild(comment_anchor, node)
      const directives_data = {
        new_scope_generator: true,
        instructions: {
          'pv-when-condition': makePvWhen(comment_anchor, params['pv-when'], function() {
            return getSample(sample_name, true)
          }, null)
        }
      }
      comment_anchor.directives_data = directives_data
      return comment_anchor
    }
  }
}

const patching_directives_list = getIndexList(patching_directives)

const patchNode = function(node, struc_store, directives_data, getSample, opts) {
  const instructions = directives_data && directives_data.instructions

  if (instructions) {
    if (instructions['pv-when'] && instructions['pv-nest']) {
      throw new Error('do not use pv-when and pv-nest on same node')
      /*
        1 - it's not osbiois what should be handled 1st
        2 - there is bug:
          when pv-when is true it appends node,
          pv-nest remove it. clone it.
          so when pv-when is false it tries to remove wrong node
      */
    }

  }

  for (let i = 0; i < patching_directives_list.length; i++) {
    const cur = patching_directives_list[i]
    if (!directives_data || !instructions[cur]) {
      continue
    }
    // cur
    // node, params, getSample, opts
    const result = patching_directives[cur].call(null, node, instructions[cur], getSample, opts)
    if (!result) {
      return
    }

    if (!result.directives_data && !result.pvprsd) {
      throw new Error('should be directives_data')
    }
    if (result.directives_data) {
      setStrucKey(result, struc_store, result.directives_data)
    }
    return result
  }
}

function PvWhenState(wwtch) {
  // local state for pv when
  this.wwtch = wwtch
  this.all_chunks = Array.prototype
  this.all_chunks = null
  this.root_node = null
  this.value = false
  Object.seal(this)
}

PvWhenState.prototype = {
  destroyer: function() {
    if (!this.root_node) {
      return
    }
    dRemove(this.root_node)
    this.root_node = null

    for (let i = 0; i < this.all_chunks.length; i++) {
      const cur = this.all_chunks[i] // BnddChunk
      if (cur.destroyer) {
        cur.destroyer()
      }
      cur.dead = true
    }

    this.all_chunks = null

    this.wwtch.context.checkChunks()
  }
}

const destroyerUsualWWtch = function destroyerUsualWWtch() {
  this.local_state.destroyer()
}

function makePvWhen(anchor, expression, getSample, sample_node) {
  // Make instructions how to handle this pv when;
  return new StandartChange(anchor, {
    data: {
      ExtraState: PvWhenState, // we are going to mutate wwtch.local_state
      sample_node: sample_node,
      getSample: getSample
    },
    simplifyValue: function(value) {
      return Boolean(value)
    },
    statement: expression,
    getValue: function() {
      // node is comment-anchor. we are not mutating it. so nothing to read
      return false
    },
    setValue: function(node, new_value, _old_value, wwtch) {
      const real_value = wwtch.local_state.value
      if (!new_value && real_value) {
        wwtch.local_state.value = false
        wwtch.destroyer()
        return
      }

      if (real_value) {
        return
      }

      wwtch.local_state.value = true
      let root_node
      const tpl = wwtch.context
      if (wwtch.data.getSample) {
        root_node = wwtch.data.getSample()
      } else {
        if (!wwtch.data.sampler) {
          wwtch.data.sampler = new PvSimpleSampler(wwtch.data.sample_node, tpl.struc_store, tpl.getSample)
        }
        root_node = wwtch.data.sampler.getClone()
      }
      wwtch.local_state.root_node = root_node

      dAfter(node, root_node)
      wwtch.local_state.all_chunks = wwtch.context.parseAppendedAndInit(root_node)
      wwtch.destroyer = destroyerUsualWWtch

      // hotfix for pv-repeat
      // pvTreeChange should be passed inside pv-repeat
      if (wwtch.context.pvTreeChange) {
        wwtch.context.pvTreeChange()
      }

      // clean this for GC
      wwtch = null
      root_node = null

    }
  }, 'pv-when')
}
export default patchNode
