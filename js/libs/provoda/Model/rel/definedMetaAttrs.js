export function defaultMetaAttrValues(rel_name) {
  var name_for_length_modern = '$meta$nests$' + rel_name + '$length'

  var name_for_exists_modern = '$meta$nests$' + rel_name + '$exists'

  return [
    name_for_length_modern, 0,
    name_for_exists_modern, false,
  ]
}

export default function definedMetaAttrs(rel_name) {
  var name_for_length_modern = '$meta$nests$' + rel_name + '$length'

  var name_for_exists_modern = '$meta$nests$' + rel_name + '$exists'

  return [
    [name_for_length_modern, 'int'],
    [name_for_exists_modern, 'bool'],
  ]
}
