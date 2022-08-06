import getNesting from '../../provoda/getNesting'

import getStart from './getStart'

// {
//   result_type: result_type,
//   state: {
//     base: string.split('.')[0],
//     path: string,
//   },
//   nesting: {
//     path: path,
//     zip_name: parts[0] || null,
//   },
//   resource: {
//     path: string,
//   },
//   from_base: {
//     type: 'parent',
//     steps: from_parent_num[0].length,
//   },
// }

const getModels = function(md, multi_path, data, all_nestings, autocreate_routed_deps) {
  const start_md = getStart(md, multi_path, false, data, autocreate_routed_deps)

  const result = start_md && getDeepNesting(
    start_md,
    multi_path,
    all_nestings
  )

  if (!Array.isArray(result)) {
    return result
  }

  return Array.from(new Set(result))

  // var base;
  // var resource;
  // var nesting;

}

function addExisting(result, from, nest_name) {
  const subject = from && getNesting(from, nest_name)
  if (!subject) {
    return
  }
  if (!Array.isArray(subject)) {
    result.push(subject)
    return
  }

  Array.prototype.push.apply(result, subject)
}

function add(result, list, nest_name) {
  if (!list) {
    return
  }

  if (!Array.isArray(list)) {
    addExisting(result, list, nest_name)
    return
  }

  for (let i = 0; i < list.length; i++) {
    addExisting(result, list[i], nest_name)
  }
}

function readRelPath(md, rel_path) {
  let cur = [md]
  for (let i = 0; i < rel_path.length; i++) {
    const nested = []
    const nest_name = rel_path[i]
    add(nested, cur, nest_name)
    cur = nested
  }

  return cur
}

function getDeepNesting(md, multi_path, all_nestings) {
  /*
  {
    path: path,
    zip_name: parts[0] || null,
  }
  */
  const info = multi_path.nesting
  const just_base = !all_nestings && multi_path.result_type === 'nesting'

  if (!info || !info.path) {
    return md
  }

  const exec_path = just_base ? info.base : info.path

  return readRelPath(md, exec_path)
}

export default getModels
