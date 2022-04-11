
export const TARGET_TYPE_ATTR = 0 as const
export const TARGET_TYPE_GLUE_REL = 1 as const
export const TARGET_TYPE_HEAVY_REQUESTER = 2 as const
export const TARGET_TYPE_UNIQ_REL_BY_ATTR = 3 as const
export const TARGET_TYPE_ROUTE_MATCHING = 4 as const

export type MENTION_TARGET =
  typeof TARGET_TYPE_ATTR |
  typeof TARGET_TYPE_GLUE_REL |
  typeof TARGET_TYPE_HEAVY_REQUESTER |
  typeof TARGET_TYPE_UNIQ_REL_BY_ATTR |
  typeof TARGET_TYPE_ROUTE_MATCHING
