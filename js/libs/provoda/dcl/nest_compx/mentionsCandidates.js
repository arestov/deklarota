export default function getAllPossibleRelMentionsCandidates(model) {
  if (model._nest_by_type_listed == null) {
    return
  }

  var compx_list = model._nest_by_type_listed.comp
  if (compx_list == null) {
    return
  }

  var result = []

  for (var i = 0; i < compx_list.length; i++) {
    var cur = compx_list[i]
    for (var jj = 0; jj < cur.parsed_deps.nest_watch.length; jj++) {
      var addr = cur.parsed_deps.nest_watch[jj]
      result.push({addr: addr, dest_name: cur.dest_name})
    }
  }

  return result
}
