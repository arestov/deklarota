import target_types from './target_types'
const { TARGET_TYPE_ATTR, TARGET_TYPE_GLUE_REL, TARGET_TYPE_HEAVY_REQUESTER } = target_types

const matchChainFinalTarget = (chain, mention_owner) => {
  switch (chain.target_type) {
    case TARGET_TYPE_ATTR:
    case TARGET_TYPE_GLUE_REL: {
      return chain.target_matcher == mention_owner.constructor.prototype
    }
    case TARGET_TYPE_HEAVY_REQUESTER: {
      return chain.target_matcher == mention_owner
    }
    default: {
      throw new Error('unknown type')
    }

  }

}

export default matchChainFinalTarget
