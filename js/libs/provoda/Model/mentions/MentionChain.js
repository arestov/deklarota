import target_types from './target_types'

function addrToLinks(rel_path, chain) {
  var list = []

  for (var i = 0; i < rel_path.length; i++) {
    var rel = rel_path[i]
    list.push(new MentionChainLink(chain, i, rel))
  }

  Object.freeze(list)

  return list
}

function MentionChainLink(chain, num, rel) {
  this.chain = chain
  this.num = num
  this.rel = rel
  Object.freeze(this)
}

function MentionChain(target_type, rel_path, target_matcher, addr, target_name, handler_payload) {
  this.target_matcher = target_matcher
  this.target_type = target_type
  this.addr = addr
  this.list = addrToLinks(rel_path, this)
  switch (target_type) {
    case target_types.TARGET_TYPE_ATTR:
    case target_types.TARGET_TYPE_GLUE_REL: {
      if (!target_name) {
        throw new Error('target_name should be provided')
      }
      break
    }
    case target_types.TARGET_TYPE_HEAVY_REQUESTER: {
      if (!handler_payload) {
        throw new Error('handler_payload should be provided')
      }
    }
    default:
  }

  this.target_name = target_name || ''
  this.handler_payload = handler_payload || null
  Object.freeze(this)
}


export default MentionChain
