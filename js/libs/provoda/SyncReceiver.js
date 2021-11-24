
import spv from '../spv'
import { doCopy } from '../spv/cloneObj'
import getBwlevParent from './bwlev/getBwlevParent'

import MDProxy from './MDProxy'
const CH_GR_LE = 2

const slice = Array.prototype.slice

const FakeModel = function(model_skeleton, stream) {
  this.stream = stream
  this._provoda_id = model_skeleton._provoda_id

  this.children_models = Object.assign({}, model_skeleton.children_models)
  this.map_parent = model_skeleton.map_parent
  this.hierarchy_num = model_skeleton.hierarchy_num
  this.constr_id = model_skeleton.constr_id
  this.model_name = model_skeleton.model_name
  this.mpx = model_skeleton.mpx
  this.states = Object.assign({}, model_skeleton.states)
  this.md_replacer = null
  Object.seal(this)
}

const MDReplace = function(_provoda_id) {
  this._provoda_id = _provoda_id
}

FakeModel.prototype = {
  _assignPublicAttrs: function(target) {
    return spv.cloneObj(target, this.states)
  },
  getParentMapModel: function() {
    if (this.model_name != 'bwlev') {
      return this.map_parent
    }

    return getBwlevParent(this)
  },
  RealRemoteCall: function(arguments_obj) {
    this.stream.RPCLegacy(this._provoda_id, slice.call(arguments_obj))
  },
  RPCLegacy: function() {
    this.RealRemoteCall(arguments)
  },
  getMDReplacer: function() {
    if (!this.md_replacer) {
      this.md_replacer = new MDReplace(this._provoda_id)
    }
    return this.md_replacer
  },
  getNesting: function(rel_name) {
    return this.children_models[rel_name]
  },
  getAttr: function(attr_name) {
    return this.states[attr_name]
  }
}


const idToModel = function(index, ids) {
  if (typeof ids == 'number') {
    return index[ids]
  } else if (Array.isArray(ids)) {
    const result = new Array(ids.length)
    for (let i = 0; i < ids.length; i++) {
      result[i] = index[ids[i]]

    }
    return result
  } else {
    /*if (ids){
      debugger;
    }*/

    return ids
  }
}


const SyncReceiver = function(stream) {
  this.stream = stream
  this.md_proxs_index = {}
  this.models_index = {}

}

SyncReceiver.prototype = {

  buildTree: function(array) {
    let i
    let cur
    let cur_pvid

    for (i = 0; i < array.length; i++) {
      cur = array[i]
      cur_pvid = cur._provoda_id
      if (!this.models_index[cur_pvid]) {
        this.models_index[cur_pvid] = new FakeModel(cur, this.stream)
      }
      //резервируем объекты для моделей
      //big_index[cur_pvid] = true;
      //^_highway.models[cur_pvid] = true;
    }

    for (i = 0; i < array.length; i++) {
      //восстанавливаем связи моделей
      cur_pvid = array[i]._provoda_id
      cur = this.models_index[cur_pvid]
      cur.map_parent = idToModel(this.models_index, cur.map_parent)
      for (const nesting_name in cur.children_models) {
        cur.children_models[nesting_name] = idToModel(this.models_index, cur.children_models[nesting_name])

      }

    }


    for (i = 0; i < array.length; i++) {
      //создаём передатчики обновлений во вьюхи
      cur = array[i]
      cur_pvid = cur._provoda_id
      const fake_model = this.models_index[cur_pvid]
      if (!this.md_proxs_index[cur_pvid]) {
        this.md_proxs_index[cur_pvid] = new MDProxy(cur._provoda_id, doCopy({}, fake_model.children_models), fake_model)
        fake_model.mpx = this.md_proxs_index[cur_pvid]
      }
    }
    return array.length && this.models_index[array[0]._provoda_id]
  },
  actions: {
    buildtree: function(message) {
      return this.buildTree(message.value)
    },
    update: function(list) {
      for (let i = 0; i < list.length; i++) {
        const cur = list[i]
        const change_name = cur[0]
        switch (change_name) {
          case 'state-ch': {
            this.updateStates(cur[1], cur[2])
            continue
          }
          case 'nest-ch': {
            this.updateNesting(cur[1], cur[2], cur[3], cur[4])
          }
        }
      }
    },
    update_states: function(message) {
      this.updateStates(message._provoda_id, message.value)
    },
    update_nesting: function(message) {
      this.updateNesting(message._provoda_id, message.struc, message.name, message.value)
    }
  },
  updateStates: function(_provoda_id, value) {
    const target_model = this.models_index[_provoda_id]

    for (let i = 0; i < value.length; i += CH_GR_LE) {
      const state_name = value[ i ]
      const state_value = value[ i + 1]
      target_model.states[state_name] = state_value
    }


    this.md_proxs_index[_provoda_id].stackReceivedStates(value)

  },
  updateNesting: function(_provoda_id, struc, name, value) {
    if (struc) {
      this.buildTree(struc)
    }

    const target_model = this.models_index[_provoda_id]
    const target_md_proxy = this.md_proxs_index[_provoda_id]

    const fakes_models = idToModel(this.models_index, value)


    target_model.children_models[name] = fakes_models
    //target_md_proxy.children_models[name] = fakes_models;
    target_md_proxy.sendCollectionChange(name, fakes_models)
  },
}
export default SyncReceiver
