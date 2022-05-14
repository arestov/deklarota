import { nestingMark } from '../../dcl/effects/legacy/nest_req/nestingMark'

export function defaultMetaAttrValues(rel_name) {
  const name_for_length_modern = nestingMark(rel_name, 'length')

  const name_for_exists_modern = nestingMark(rel_name, 'exists')

  return [
    name_for_length_modern, 0,
    name_for_exists_modern, false,
  ]
}

export default function definedMetaAttrs(rel_name) {
  const name_for_length_modern = nestingMark(rel_name, 'length')

  const name_for_exists_modern = nestingMark(rel_name, 'exists')

  return [
    [name_for_length_modern, 'int'],
    [name_for_exists_modern, 'bool'],
  ]
}
