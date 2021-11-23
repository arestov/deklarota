
import spv from '../../spv'
import hp from '../helpers'
import get_constr from './get_constr'


const getEncodedState = hp.getEncodedState
const getNestingConstr = get_constr.getNestingConstr

const modelInfo = function(md) {
  if (typeof md == 'function') {
    return md.prototype
  }

  return md
}


const getNestReq = function(md, nest_name) {
  return modelInfo(md)._nest_reqs && modelInfo(md)._nest_reqs[nest_name]
}
const getNestConstr = function(md, nest_name) {
  return modelInfo(md)._nest_rqc && modelInfo(md)._nest_rqc[nest_name]
}

let dep_counter = 1

function NestingDep(path, needed, nesting_path, limit) {
  this.dep_id = dep_counter++
  this.type = 'nesting'
  this.value = path
  this.needed = needed
  this.nesting_path = nesting_path
  this.limit = limit
}

const preciseNesting = function(app, array, path, original_need) {
  const index = {}
  for (let i = 0; i < array.length; i++) {
    const cur = array[i].prototype

    const dep = new NestingDep(path, original_need)

    const checked = checkNestingPath(app, cur, dep, path, original_need)
    index[cur.constr_id] = chechTreeStructure(app, cur, checked)
  }
  return {
    dep_id: dep_counter++,
    type: 'precise_nesting',
    value: index
  }
}

function checkNestingPath(app, md, dep, path, original_need) {
  const result = []
  let cur = md

  for (let i = 0; i < path.length; i++) {
    const nesting_name = path[i]

    const constr = getNestingConstr(modelInfo(app), cur, nesting_name)
    const right_nesting_name = hp.getRightNestingName(cur, nesting_name)
    if (!constr) {
      console.log('no const', nesting_name)
      break
    }

    let type
    const declr = getNestReq(cur, right_nesting_name)
    if (declr || getNestConstr(cur, right_nesting_name)) {
      type = 'countless'
    } else if (Array.isArray(constr)) {
      // `posbl_` could lead to incorrect type
      type = 'finite'
    } else {
      type = 'single'
    }

    const item = {
      name: nesting_name,
      type: type,
      constr: constr,
      related: null
    }

    if (type == 'countless') {
      const countless_nesting_dep = {
        dep_id: dep_counter++,
        type: 'countless_nesting',
        value: right_nesting_name,
        state: null,
        related: null,
        limit: dep.limit
      }

      if (declr && declr.state_dep) {

        const state_dep = chechTreeStructure(app, cur, {
          dep_id: dep_counter++,
          type: 'state',
          value: declr.state_dep
        })

        if (state_dep.related && state_dep.related.length) {
          countless_nesting_dep.state = declr.state_dep
          countless_nesting_dep.related = state_dep
        }
      }

      item.related = countless_nesting_dep
    }

    result.push(item)

    if (item.type == 'finite') {
      return new NestingDep(
        path.slice(0, i),
        [preciseNesting(app, constr, path.slice(i), original_need)],
        result
      )
    }

    cur = constr.prototype
    dep.last_constr = constr
  }

  dep.nesting_path = result

  return dep
}

const relatedDeps = function(app, md, state_name) {
  const short_name = state_name
  const is_compx_state = modelInfo(md).hasComplexStateFn(short_name)
  if (!is_compx_state) {
    return null
  }
  const dependence_list = modelInfo(md).compx_check[short_name].watch_list


  const related = []

  for (let i = 0; i < dependence_list.length; i++) {
    const cur = dependence_list[i]
    if (state_name == cur) {
      continue
    }

    const conv = chechTreeStructure(app, md, {
      dep_id: dep_counter++,
      type: 'state',
      value: cur
    })

    if (conv) {
      related.push(conv)
    }

  }

  return related
}

const convertEncoded = function(enc) {
  const needed = [{
    dep_id: dep_counter++,
    type: 'state',
    value: enc.state_name
  }]

  switch (enc.rel_type) {
    case 'root': {
      return {
        dep_id: dep_counter++,
        type: enc.rel_type,
        needed: needed
      }
    }
      break
    case 'nesting': {
      return {
        dep_id: dep_counter++,
        type: enc.rel_type,
        value: enc.nwatch.selector,
        needed: needed
      }
    }
      break
    case 'parent': {
      return {
        dep_id: dep_counter++,
        type: enc.rel_type,
        value: enc.ancestors,
        needed: needed
      }
    }
      break
  }
}

const getRelated = function(app, md, needed) {
  const related = []

  for (let i = 0; i < needed.length; i++) {
    related.push(chechTreeStructure(app, md, needed[i]))
  }

  return related
}

function chechTreeStructure(app, md, dep) {
  if (dep.type == 'state') {
    const enc = getEncodedState(dep.value)
    if (!enc) {
      if (dep.needed) {
        console.log(new Error('should not be `needed` here'))
      }
      const short_name = hp.getShortStateName(dep.value)
      const can_request = modelInfo(md)._states_reqs_index && modelInfo(md)._states_reqs_index[short_name]
      if (can_request) {
        dep.can_request = true
        return dep
      }

      dep.related = relatedDeps(app, md, dep.value)
      return dep
    } else {
      return chechTreeStructure(app, md, convertEncoded(enc))
    }
  } else if (dep.type == 'nesting') {
    let nesting_dep = dep
    let last_constr_md = !dep.value.length && md

    if (!last_constr_md) {
      nesting_dep = checkNestingPath(app, md, dep, dep.value, dep.needed)
      last_constr_md = nesting_dep.last_constr && nesting_dep.last_constr.prototype
      if (!last_constr_md) {
        return dep
      }
    }

    if (!nesting_dep.needed) {
      return nesting_dep // !? what
    }

    nesting_dep.related = getRelated(app, last_constr_md, nesting_dep.needed)
    return nesting_dep
  } else if (dep.type == 'parent') {

    let parent_md
    for (let i = 0; i < dep.value; i++) {
      parent_md = modelInfo(md)._parent_constr.prototype
    }
    dep.related = getRelated(app, parent_md, dep.needed)
    return dep

  } else if (dep.type == 'root') {
    dep.related = getRelated(app, modelInfo(md)._root_constr.prototype, dep.needed)
    return dep
  }

  return dep
}

function flatStruc(md, struc, appArg) {
  const result = []

  const app = appArg || md.app

  const list = flatSources(struc)
  for (let i = 0; i < list.length; i++) {
    if (!list[i]) {
      continue
    }

    const item = chechTreeStructure(app, md, list[i])
    if (item) {
      result.push(item)
    }
  }
  console.log(result)
  return result
}
const result = spv.memorize(flatStruc, function(md) {
  return modelInfo(md).constr_id
})

result.flatStruc = flatStruc

export default result

function flatSources(struc, parent_path) {
  if (!struc || !struc.main) {return}

  const result_list = []

  const parent = parent_path || []

  const needed = []

  for (let i = 0; i < struc.main.merged_states.length; i++) {
    const state_name = struc.main.merged_states[i]
    needed.push({
      dep_id: dep_counter++,
      type: 'state',
      value: state_name
    })
  }

  result_list.push(new NestingDep(parent, needed, null, struc.main.limit))

  const obj = struc.main.m_children.children
  for (const name in obj) {
    const copy = parent.slice()
    copy.push(name)
    const path = copy

    result_list.push(new NestingDep(path, null, null, obj[name].main && obj[name].main.limit))

    result_list.push.apply(result_list, flatSources(obj[name], path))
  }

  return result_list
}
