const collect = function(model) {
  if (model._nest_by_type_listed == null) {
    return null
  }

  var compx_list = model._nest_by_type_listed.comp
  if (compx_list == null) {
    return null
  }

  var result = []

  for (var i = 0; i < compx_list.length; i++) {
    var cur = compx_list[i]

    for (var jj = 0; jj < cur.parsed_deps.nest_watch.length; jj++) {
      var addr = cur.parsed_deps.nest_watch[jj]

      result.push({
        addr: addr,
        dest_name: cur.dest_name,
        final_rel_addr: cur.final_rel_addr,
        final_rel_key: cur.final_rel_key,
      })
    }
  }

  return result
}


function getAllPossibleRelMentionsCandidates(model) {
  if (model.hasOwnProperty('__rel_mentions_all_possible')) {
    return model.__rel_mentions_all_possible
  }

  var result = collect(model)
  model.__rel_mentions_all_possible = result
  return result
}

const collectRoot = function(model) {
  if (model._nest_by_type_listed == null) {
    return null
  }

  var compx_list = model._nest_by_type_listed.comp
  if (compx_list == null) {
    return null
  }

  var result = []

  for (var i = 0; i < compx_list.length; i++) {
    var cur = compx_list[i]
    result.push(...cur.glue_sources)
  }

  return result
}

export function getRootRelMentions(model) {
  if (model.hasOwnProperty('__rel_mentions_root')) {
    return model.__rel_mentions_root
  }

  var list = collectRoot(model) || []

  var result = []

  for (var i = 0; i < list.length; i++) {
    var cur = list[i]
    if (cur.source.from_base.type != 'root') {
      continue
    }

    result.push(cur)
  }

  model.__rel_mentions_root = result
  return result
}


export default getAllPossibleRelMentionsCandidates
