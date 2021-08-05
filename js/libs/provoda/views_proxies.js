

import spv from '../spv'
import MDProxy from './MDProxy'
import isPublicRel from './Model/rel/isPublicRel'
import createMutableRelStore from './Model/rel/createMutableRelStore'

var push = Array.prototype.push


var createMPXes = function(array, store, space) {
  for (var i = 0; i < array.length; i++) {
    var cur = array[i]
    store[cur._provoda_id] = new MDProxy(cur._provoda_id, createMutableRelStore(cur), cur, space)
  }
}

var createMPXesByRawData = function(raw_array, ids_index, mpxes_index, space) {
  if (!raw_array.length) {
    return
  }
  var i, clean_array = [], local_index = {}
  for (i = 0; i < raw_array.length; i++) {
    var cur_id = raw_array[i]._provoda_id
    if (!ids_index[cur_id] && !local_index[cur_id]) {
      local_index[cur_id] = true
      clean_array.push(raw_array[i])
    }

  }
  if (clean_array.length) {
    var full_array = []
    for (i = 0; i < clean_array.length; i++) {
      push.apply(full_array, clean_array[i].getLinedStructure(ids_index))

    }
    createMPXes(full_array, mpxes_index, space)
  }

}

var noop = function() {}

var Space = function(id, checkAlive, sendRPCLegacy) {
  this.checkAlive = checkAlive || noop
  this.id = id
  this.mpxes_index = {}
  this.ids_index = {}
  this.sendRPCLegacy = sendRPCLegacy || null
}
Space.prototype = {
  dispose: function() {
    this.ids_index = null
    for (var id in this.mpxes_index) {
      if (this.mpxes_index[id] == null) {
        continue
      }
      this.mpxes_index[id].dispose()
      this.mpxes_index[id] = null
    }
    this.mpxes_index = null
  }
}

export const Proxies = function(check_interval) {
  this.spaces = {}
  this.spaces_list = []
  //инициализация простанства
  //поддержка простанства в актуальном состоянии
  //очистка пространства

  var self = this

  setInterval(function() {
    self.checkAlive()
  }, check_interval || 10000)
}

Proxies.prototype = {
  addRootView: function(view, root_md) {
    return this.addSpaceById(view.view_id, root_md)
  },
  removeRootView: function(view) {
    return this.removeSpaceById(view.view_id)
  },
  getMPX: function(space_id, md) {
    if (typeof space_id == 'object') {
      space_id = space_id.view_id
    }
    var mpx = this.spaces[space_id].mpxes_index[md._provoda_id]

    return mpx
  },
  addSpaceById: function(id, root_md, checkAlive, sendRPCLegacy) {
    if (!this.spaces[id]) {
      var space = new Space(id, checkAlive, sendRPCLegacy)
      this.spaces[id] = space
      this.spaces_list.push(this.spaces[id])

      var array = root_md.getLinedStructure(this.spaces[id].ids_index)
      createMPXes(array, this.spaces[id].mpxes_index, space)
    } else {
      throw new Error()
    }
  },
  removeSpaceById: function(id) {
    var space = this.spaces[id]
    if (!space) {
      throw new Error()
    }
    space.dispose()
    this.spaces[id] = null
    this.spaces_list = spv.arrayExclude(this.spaces_list, space)
  },


  pushNesting: function(md, nesname, value, oldv, removed) {
    if (!isPublicRel(md, nesname)) {
      return
    }

    var collected
    var raw_array = []
    for (var i = 0; i < this.spaces_list.length; i++) {
      var cur = this.spaces_list[i]
      if (!cur.ids_index[md._provoda_id]) {
        continue
      }

      if (cur.mpxes_index[md._provoda_id] === null) {
        // model & mdproxy were disposed
        continue
      }

      if (!collected) {
        collected = true
        if (value) {
          if (value._provoda_id) {
            raw_array = [value]
          } else if (Array.isArray(value)) {
            raw_array = value
          } else {

            var pos_array = spv.getTargetField(value, 'residents_struc.all_items')
            if (pos_array) {
              raw_array = pos_array
            } else {
              throw new Error('you must provide parsable array in "residents_struc.all_items" prop')
            }

          }
        }
      }
      createMPXesByRawData(raw_array, cur.ids_index, cur.mpxes_index, cur)

      if (!cur.mpxes_index[md._provoda_id]) {
        console.error(new Error(`Couldn't update rel views "${nesname}" of model ${md._provoda_id}.`))
        continue
      }

      cur.mpxes_index[md._provoda_id].sendCollectionChange(nesname, value, oldv, removed)

    }



  },
  pushStates: function(md, states_list) {
    for (var i = 0; i < this.spaces_list.length; i++) {
      var cur = this.spaces_list[i]
      if (!cur.ids_index[md._provoda_id] || cur.mpxes_index[md._provoda_id] == null) {
        continue
      }

      cur.mpxes_index[md._provoda_id].stackReceivedStates(states_list)
    }
  },
  killMD: function(md) {
    for (var i = 0; i < this.spaces_list.length; i++) {
      var cur = this.spaces_list[i]
      var mpx = cur.mpxes_index[md._provoda_id]
      if (cur.ids_index[md._provoda_id]) {
        var mpx = cur.mpxes_index[md._provoda_id]
        mpx.die()
        mpx.dispose()
        cur.mpxes_index[md._provoda_id] = null
      }
    }
  },
  checkAlive: function() {
    for (var i = 0; i < this.spaces_list.length; i++) {
      var cur = this.spaces_list[i]
      var dead = cur.checkAlive()
      if (dead) {
        console.log('leak prevented')
      }
    }
  }
}
