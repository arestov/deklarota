import LocalWatchRoot from '../nest-watch/LocalWatchRoot'
import addRemoveN from '../nest-watch/add-remove'
import NestWatch from '../nest-watch/NestWatch'
import toMultiPath from '../utils/NestingSourceDr/toMultiPath'
import getModelById from '../utils/getModelById'
import spv from '../../spv'
const addRootNestWatch = addRemoveN.addRootNestWatch
const removeRootNestWatch = addRemoveN.removeRootNestWatch

const watchDependence = changeDependence(true)
const unwatchDependence = changeDependence(false)

let count = 1
const ReqDep = function(dep_key, dep, target, supervision, needy) {
  this.id = count++
  this.supervision = supervision
  this.dep_key = dep_key
  this.dep = dep
  this.target = target
  this.needy = needy
  this.anchor = null
}

const sourceKey = function(req_dep, suffix) {
  return req_dep.target._provoda_id + '-' + suffix
}



const noop = function() {}

/*
loading random tracks based on artists list
vs
loading of soundcloud art songslist
*/

const getLimit = function(dep, supervision) {
  if (supervision.greedy) {
    return Infinity
  }

  let i
  for (i = 0; i < dep.nesting_path.length; i++) {
    let cur = dep.nesting_path[i]
    if (cur.type == 'countless') {
      break
    }
    cur = null
  }
  return i
}

const getNestWatch = spv.memorize(function(dep, supervision) {
  const requesting_limit = getLimit(dep, supervision)

  if (!requesting_limit) {
    return
  }

  const complete = dep.related ? function(target, req_dep) {
    for (let i = 0; i < dep.related.length; i++) {
      watchDependence(req_dep.supervision, target, dep.related[i], sourceKey(req_dep, 'end'))
    }
  } : noop

  const addHandler = function addHandler(target, local_nest_watch, skip) {
    const req_dep = local_nest_watch.data
    if (local_nest_watch.nwatch.selector.length == skip) {
      complete(target, req_dep)
      return
    }

    if (skip > requesting_limit) {
      return
    }

    const cur = dep.nesting_path[skip]

    if (cur && cur.type == 'countless' && cur.related) {
      watchDependence(req_dep.supervision, target, cur.related, sourceKey(req_dep, skip))
    }
  }

  const uncomplete = dep.related ? function(target, req_dep) {
    for (let i = 0; i < dep.related.length; i++) {
      unwatchDependence(req_dep.supervision, target, dep.related[i], sourceKey(req_dep, 'end'))
    }
  } : noop

  const removeHandler = function removeHandler(target, local_nest_watch, skip) {

    const req_dep = local_nest_watch.data
    if (local_nest_watch.nwatch.selector.length == skip) {
      uncomplete(target, req_dep)
    } else {
      if (skip > requesting_limit) {
        return
      }
      const cur = dep.nesting_path[skip]

      if (cur && cur.type == 'countless' && cur.related) {
        unwatchDependence(req_dep.supervision, target, cur.related, sourceKey(req_dep, skip))
      }
    }
  }

  return new NestWatch(toMultiPath({selector: dep.value}), null, null, addHandler, removeHandler)
}, function(dep) {
  return dep.dep_id
})

const watchRelated = function(self, dep, req_dep) {
  for (let i = 0; i < dep.related.length; i++) {
    watchDependence(req_dep.supervision, self, dep.related[i], sourceKey(req_dep, 'related'))
  }
}

const unwatchRelated = function(self, dep, req_dep) {
  for (let i = 0; i < dep.related.length; i++) {
    unwatchDependence(req_dep.supervision, self, dep.related[i], sourceKey(req_dep, 'related'))
  }
}

const handleNesting = function(dep, req_dep, self) {
  if (!dep.value.length) {
    watchRelated(self, dep, req_dep)
    return
  }

  if (!dep.nesting_path || !dep.nesting_path.length) {
    return
  }

  const ne_wa = getNestWatch(dep, req_dep.supervision)
  if (!ne_wa) {
    // see:
    // !requesting_limit
    return
  }

  const lo_ne_wa = new LocalWatchRoot(self, ne_wa, req_dep)

  addRootNestWatch(self, lo_ne_wa)
  req_dep.anchor = lo_ne_wa
}

const unhandleNesting = function(dep, req_dep, self) {
  if (!dep.value.length) {
    unwatchRelated(self, dep, req_dep)
    return
  }

  if (!dep.nesting_path || !dep.nesting_path.length) {
    return
  }

  if (!req_dep.anchor) {
    // see:
    // !ne_wa
    // !requesting_limit
    return
  }

  removeRootNestWatch(self, req_dep.anchor)
}

const handleState = function(dep, req_dep, self) {
  if (dep.can_request) {
    self.requestState(dep.value)
  }

  if (dep.related) {
    watchRelated(self, dep, req_dep)
  }
}

const unhandleState = function(dep, req_dep, self) {
  if (dep.related) {
    unwatchRelated(self, dep, req_dep)
  }
}

function requestNesting(md, declr, dep) {
  md.requestNesting(declr, dep.value, dep.limit)
}

const handleCountlessNesting = function(dep, req_dep, self) {
  const declr = self._nest_reqs && self._nest_reqs[dep.value]
  if (!dep.state) {
    requestNesting(self, declr, dep)
    return
  }

  req_dep.anchor = function(state) {
    if (state) {
      requestNesting(self, declr, dep)
    }
  }
  self.lwch(self, dep.state, req_dep.anchor)
  watchDependence(req_dep.supervision, self, dep.related, req_dep.id + 'countless_nesting')

}

const unhandleCountlessNesting = function(dep, req_dep, self) {
  if (!dep.state) {
    return
  }
  self.removeLwch(self, dep.state, req_dep.anchor)
  unwatchDependence(req_dep.supervision, self, dep.related, req_dep.id + 'countless_nesting')


}

const handleRoot = function(dep, req_dep, self) {
  watchRelated(self.getStrucRoot(), dep, req_dep)
}

const unhandleRoot = function(dep, req_dep, self) {
  unwatchRelated(self.getStrucRoot(), dep, req_dep)
}

const getParent = function(self, dep) {
  let cur = self
  for (let i = 0; i < dep.value; i++) {
    // TODO do not require view-attached state from model (like vmp_show)
    cur = cur.getStrucParent(1, true)
  }
  return cur
}

const handleParent = function(dep, req_dep, self) {
  const parent = getParent(self, dep)
  if (!parent) {
    console.log('should be parent', dep)
    return
  }
  watchRelated(parent, dep, req_dep)
}

const unhandleParent = function(dep, req_dep, self) {
  const parent = getParent(self, dep)
  if (!parent) {
    return
  }
  unwatchRelated(parent, dep, req_dep)
}

const unhandleDep = function(dep, req_dep, self) {
  switch (dep.type) {
    case 'nesting': {
      unhandleNesting(dep, req_dep, self)
      break
    }

    case 'state': {
      unhandleState(dep, req_dep, self)
      break
    }

    case 'precise_nesting': {
      break
    }

    case 'countless_nesting': {
      unhandleCountlessNesting(dep, req_dep, self)
      break
    }

    case 'root': {
      unhandleRoot(dep, req_dep, self)
      break
    }

    case 'parent': {
      unhandleParent(dep, req_dep, self)
      break
    }
  }
}

const handleDep = function(dep, req_dep, self) {
  switch (dep.type) {
    case 'nesting': {
      handleNesting(dep, req_dep, self)
      break
    }

    case 'state': {
      handleState(dep, req_dep, self)
      break
    }

    case 'precise_nesting': {
      break
    }

    case 'countless_nesting': {
      handleCountlessNesting(dep, req_dep, self)
      break
    }

    case 'root': {
      handleRoot(dep, req_dep, self)
      break
    }

    case 'parent': {
      handleParent(dep, req_dep, self)
      break
    }
  }
}

const reqKey = function(self, dep) {
  return self._provoda_id + '-' + dep.dep_id
}

const checkWhy = function(supervision, self, dep) {
  const sub_path = [self._provoda_id, dep.dep_id]
  const tree = supervision.store
  const was_active = spv.getTargetField(supervision.is_active, sub_path)


  const keys = spv.getTargetField(tree, sub_path)
  const keys_count = spv.countKeys(keys, true)

  const is_active = !!keys_count

  spv.setTargetField(supervision.is_active, sub_path, is_active)

  if (is_active == was_active) {
    return
  }

  const req_dep = supervision.reqs[reqKey(self, dep)]
  if (is_active) {
    handleDep(dep, req_dep, self)
  } else {
    unhandleDep(dep, req_dep, self)
  }

}

function changeDependence(mark) {
  return function(supervision, self, dep, why) {
    if (dep.type == 'state' && !dep.can_request && !dep.related) {
      return
    }

    if (!why) {
      throw new Error('should be')
    }

    const dep_key = dep.dep_id

    const path = [self._provoda_id, dep.dep_id, why]
    const tree = supervision.store

    const reqs = supervision.reqs
    const kkkey = reqKey(self, dep)
    if (!reqs[ kkkey ]) {
      reqs[ kkkey ] = new ReqDep(dep_key, dep, self, supervision, getModelById(self, supervision.needy_id))
    }

    spv.setTargetField(tree, path, mark)

    checkWhy(supervision, self, dep)

    return
  }
}

export default {
  addReqDependence: function(supervision, dep) {
    watchDependence(supervision, this, dep, supervision.needy_id)
  },
  removeReqDependence: function(supervision, dep) {
    unwatchDependence(supervision, this, dep, supervision.needy_id)
  }
}
