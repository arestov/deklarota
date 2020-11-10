

var doCopy = function(item, self, extended_comp_attrs) {
  for (var i = 0; i < item.compxes.length; i += 2) {
    var name = item.compxes[ i ]
    var deps = item.compxes[ i + 1 ]
    extended_comp_attrs[name] = deps
  }
}

var empty = []

export default function getDepsToInsert(source, self, extended_comp_attrs) {
  if (!source) {return empty}

  var result = []

  for (var name in source) {
    if (!source.hasOwnProperty(name)) {continue}

    var cur = source[name]
    if (!cur.compxes) {continue}

    result.push(name)

    doCopy(cur, self, extended_comp_attrs)
  }

  return result
};
