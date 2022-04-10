
import spv from '../../../spv'
import type { LegacyRichRoute, MarkFromParent, MarkFromRoot } from './legacy-routes.types'
import parsePath from './parse'

const isFromRoot = function(first_char: string, string_template: string): MarkFromRoot | undefined {
  const from_root = first_char == '#'
  if (!from_root) {return}

  return {
    cutted: string_template.slice(1)
  }
}

const parent_count_regexp = /^\^+/gi
const isFromParent = function(first_char: string, string_template: string): MarkFromParent | undefined {
  if (first_char != '^') {return}

  const cutted = string_template.replace(parent_count_regexp, '')
  return {
    cutted: cutted,
    count: string_template.length - cutted.length
  }
}

const getParsedPath = spv.memorize(function(string_template: string): LegacyRichRoute {
  //example "#tracks/[:artist],[:track]"
  //example "^^tracks/[:artist],[:track]"
  //example "^"
  const first_char = string_template.charAt(0)
  const from_root = isFromRoot(first_char, string_template)
  const from_parent = !from_root && isFromParent(first_char, string_template)

  const full_usable_string = from_root
    ? from_root.cutted
    : (from_parent
      ? from_parent.cutted
      : string_template)



  if (!full_usable_string && !from_parent && !from_root) {
    throw new Error('path cannot be empty')
  }

  const parsed = parsePath(full_usable_string)

  return {
    full_usable_string: full_usable_string,
    from_root: Boolean(from_root),
    from_parent: from_parent && from_parent.count,
    parsed: parsed,
  }
})

export default getParsedPath
