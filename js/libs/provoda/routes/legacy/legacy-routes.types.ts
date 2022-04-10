export type LegacyRouteParamsMap = [string, string, string | undefined][]

export type ParsedLegacyRoute = {
  clean_string_parts: string[]
  states: string[] | null
  states_map: LegacyRouteParamsMap | null
}

export type MarkFromRoot = {
  cutted: string
}

export type MarkFromParent = {
  cutted: string
  count: number
}

export type LegacyRichRoute = {
  full_usable_string: string,
  from_root: boolean,
  from_parent: number | undefined | false,
  parsed: ParsedLegacyRoute,
}
