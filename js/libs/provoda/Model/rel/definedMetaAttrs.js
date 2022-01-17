export function defaultMetaAttrValues(rel_name) {
  const name_for_length_modern = '$meta$rels$' + rel_name + '$length'

  const name_for_exists_modern = '$meta$rels$' + rel_name + '$exists'

  return [
    name_for_length_modern, 0,
    name_for_exists_modern, false,
  ]
}

export default function definedMetaAttrs(rel_name) {
  const name_for_length_modern = '$meta$rels$' + rel_name + '$length'

  const name_for_exists_modern = '$meta$rels$' + rel_name + '$exists'

  return [
    [name_for_length_modern, 'int'],
    [name_for_exists_modern, 'bool'],
  ]
}
