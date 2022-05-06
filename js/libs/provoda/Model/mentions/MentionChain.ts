import type { RelPath, Addr, RelPathStep } from '../../utils/multiPath/addr.types'
import target_types from './target_types'
import type { MENTION_TARGET } from './target_types.types'

class MentionChainLink {
  // eslint-disable-next-line no-use-before-define
  chain: MentionChain
  num: number
  rel: string
  // eslint-disable-next-line no-use-before-define
  constructor(chain: MentionChain, num: number, rel: RelPathStep) {
    this.chain = chain
    this.num = num
    this.rel = rel
    Object.freeze(this)
  }
}

// eslint-disable-next-line no-use-before-define
function addrToLinks(rel_path: RelPath, chain: MentionChain): MentionChainLink[] {
  const list = []

  for (let i = 0; i < rel_path.length; i++) {
    const rel = rel_path[i]
    list.push(new MentionChainLink(chain, i, rel as RelPathStep))
  }

  Object.freeze(list)

  return list
}

class MentionChain {
  target_matcher: unknown
  target_type: MENTION_TARGET
  addr: Addr | null
  list: MentionChainLink[]
  target_name: string
  handler_payload: unknown
  constructor(
    target_type: MENTION_TARGET,
    rel_path: RelPath,
    target_matcher: unknown,
    addr: Addr | null,
    target_name: string | null,
    handler_payload: unknown
  ) {
    this.target_matcher = target_matcher
    this.target_type = target_type
    this.addr = addr
    this.list = addrToLinks(rel_path, this)
    switch (target_type) {
      case target_types.TARGET_TYPE_ATTR: {
        if (!target_name) {
          throw new Error('target_name should be provided')
        }
        break
      }
      case target_types.TARGET_TYPE_HEAVY_REQUESTER: {
        if (!handler_payload) {
          throw new Error('handler_payload should be provided')
        }
        break
      }
      default:
    }

    this.target_name = target_name || ''
    this.handler_payload = handler_payload || null
    Object.freeze(this)
  }
}


export default MentionChain
