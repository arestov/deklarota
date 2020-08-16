

import spv from 'spv'
import toTransferableStatesList from './Model/toTransferableStatesList'
import toSimpleStructure from './Model/toSimpleStructure'
var parseNesting = toSimpleStructure.parseNesting

var SyncSender = function() {
  this.sockets = {}
  this.streams_list = []
  this.sockets_m_index = {}
  this.batched_by_id = {}

  this.st_counter = 0
  this.batched = []
  this.schedule_timer = null
  this.has_nothing = true

  var self = this

  // 1 send operation cost is about 1ms-12ms. so 100 operations can take up to 100ms-1000ms
  // lets butch operations. 60fps is 16ms per frame. lets batch by 16ms.

  this.flush = function() {
    self.has_nothing = true

    for (var i = 0; i < self.streams_list.length; i++) {
      var cur = self.streams_list[i]
      var list = self.batched_by_id[cur.id]
      if (!list.length) {
        continue
      }

      self.has_nothing = false

      self.batched_by_id[cur.id] = null // protect from race conditions

      cur.send(list)

      list.length = null
      self.batched_by_id[cur.id] = list
    }

    if (self.has_nothing) {
      clearInterval(self.schedule_timer)
      self.schedule_timer = null
    }
  }
  Object.seal(this)
}

var toTransferableNestings = function(value) {
    if (!value) {
      return value
    }

    var parsed_value

    if (value && value.each_items) {
      // creating value to pass
      var copy = spv.cloneObj({
        $not_model: true,
      }, value)
      delete copy.each_items
      return copy
    }

    if (value._provoda_id) {
      parsed_value = value._provoda_id
    } else if (Array.isArray(value)) {

      parsed_value = new Array(value.length)
      for (var jj = 0; jj < value.length; jj++) {
        parsed_value[jj] = value[jj]._provoda_id
      }
    } else {
      console.warn('unparsed', value)
    }
    if (typeof parsed_value == 'undefined') {
      parsed_value = null
    }

    return parsed_value
}

SyncSender.prototype = {
  schedule: function() {
    if (this.schedule_timer !== null) {
      return
    }

    this.schedule_timer = setInterval(this.flush, 16)
  },
  removeSyncStream: function(stream) {
    if (!this.sockets[stream.id]) {
      return
    }
    this.sockets_m_index[stream.id] = null
    this.batched_by_id[stream.id] = null
    this.sockets[stream.id] = null
    this.streams_list = spv.findAndRemoveItem(this.streams_list, stream)
  },
  addSyncStream: function(start_md, stream) {
    this.sockets_m_index[stream.id] = {}
    this.batched_by_id[stream.id] = []

    this.sockets[stream.id] = stream
    this.streams_list.push(stream)

    var struc = start_md.toSimpleStructure(this.sockets_m_index[stream.id])
    stream.buildTree(struc)

  },
  pushNesting: function(md, nesname, value) {
    //var struc;
    var parsed_value = toTransferableNestings(value)


    for (var i = 0; i < this.streams_list.length; i++) {
      var cur = this.streams_list[i]
      var index = this.sockets_m_index[cur.id]
      if (!index[md._provoda_id]) {
        continue
      }

      var struc

      if (value) {
        struc = []
        struc = parseNesting(this.sockets_m_index[cur.id], value, [])
      }

      var list = this.batched_by_id[cur.id]
      list.push(
        ['nest-ch', md._provoda_id, struc, nesname, parsed_value]
      )
    }

    this.schedule()
  },
  pushStates: function(md, states_raw) {
  //	var struc;
    var states = toTransferableStatesList(states_raw)

    for (var i = 0; i < this.streams_list.length; i++) {
      var cur = this.streams_list[i]
      var index = this.sockets_m_index[cur.id]
      if (!index[md._provoda_id]) {
        continue
      }

      var list = this.batched_by_id[cur.id]
      list.push(
        ['state-ch', md._provoda_id, states]
      )
    }

    this.schedule()
  }
}
export default SyncSender
