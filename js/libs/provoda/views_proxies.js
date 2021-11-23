

import spv from '../spv'
import MDProxy from './MDProxy'
import isPublicRel from './Model/rel/isPublicRel'
import createMutableRelStore from './Model/rel/createMutableRelStore'

const push = Array.prototype.push


const createMPXes = function(array, store, space) {
  for (let i = 0; i < array.length; i++) {
    const cur = array[i]
    store[cur._provoda_id] = new MDProxy(cur._provoda_id, createMutableRelStore(cur), cur, space)
  }
}

const createMPXesByRawData = function(raw_array, ids_index, mpxes_index, space) {
  if (!raw_array.length) {
    return
  }
  let i
  const clean_array = []
  const local_index = {}
  for (i = 0; i < raw_array.length; i++) {
    const cur_id = raw_array[i]._provoda_id
    if (!ids_index[cur_id] && !local_index[cur_id]) {
      local_index[cur_id] = true
      clean_array.push(raw_array[i])
    }

  }
  if (clean_array.length) {
    const full_array = []
    for (i = 0; i < clean_array.length; i++) {
      push.apply(full_array, clean_array[i].getLinedStructure(ids_index))

    }
    createMPXes(full_array, mpxes_index, space)
  }

}

const noop = function() {}

const Space = function(id, checkAlive, sendRPCLegacy) {
  this.checkAlive = checkAlive || noop
  this.id = id
  this.mpxes_index = {}
  this.ids_index = {}
  this.sendRPCLegacy = sendRPCLegacy || null
}
Space.prototype = {
  dispose: function() {
    this.ids_index = null
    for (const id in this.mpxes_index) {
      if (this.mpxes_index[id] == null) {
        continue
      }
      this.mpxes_index[id].dispose()
      this.mpxes_index[id] = null
    }
    this.mpxes_index = null
  }
}

export const Proxies = function(_check_interval, options = {}) {
  this.spaces = {}
  this.spaces_list = []
  /*
    you can disable check to prevent tests from hang
  */
  const { __proxies_leaks_check = true } = options
  const { __proxies_leaks_check_interval } = options
  //инициализация простанства
  //поддержка простанства в актуальном состоянии
  //очистка пространства

  const self = this

  this.leaksCheck = __proxies_leaks_check && setInterval(function() {
    self.checkAlive()
  }, __proxies_leaks_check_interval || 10000)
}

Proxies.prototype = {
  dispose() {
    clearInterval(this.leaksCheck)
  },
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
    const mpx = this.spaces[space_id].mpxes_index[md._provoda_id]

    return mpx
  },
  addSpaceById: function(id, root_md, checkAlive, sendRPCLegacy) {
    if (!this.spaces[id]) {
      const space = new Space(id, checkAlive, sendRPCLegacy)
      this.spaces[id] = space
      this.spaces_list.push(this.spaces[id])

      const array = root_md.getLinedStructure(this.spaces[id].ids_index)
      createMPXes(array, this.spaces[id].mpxes_index, space)
    } else {
      throw new Error()
    }
  },
  removeSpaceById: function(id) {
    const space = this.spaces[id]
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

    let collected
    let raw_array = []
    for (let i = 0; i < this.spaces_list.length; i++) {
      const cur = this.spaces_list[i]
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
            throw new Error('incorrect rel value')
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
    for (let i = 0; i < this.spaces_list.length; i++) {
      const cur = this.spaces_list[i]
      if (!cur.ids_index[md._provoda_id] || cur.mpxes_index[md._provoda_id] == null) {
        continue
      }

      cur.mpxes_index[md._provoda_id].stackReceivedStates(states_list)
    }
  },
  killMD: function(md) {
    for (let i = 0; i < this.spaces_list.length; i++) {
      const cur = this.spaces_list[i]
      if (cur.ids_index[md._provoda_id]) {
        const mpx = cur.mpxes_index[md._provoda_id]
        mpx.die()
        mpx.dispose()
        cur.mpxes_index[md._provoda_id] = null
      }
    }
  },
  checkAlive: function() {
    for (let i = 0; i < this.spaces_list.length; i++) {
      const cur = this.spaces_list[i]
      const dead = cur.checkAlive()
      if (dead) {
        console.log('leak prevented')
      }
    }
  }
}
