const invalidate = (self, dcl) => {
  self.__routes_matchers_state.delete(dcl.path_template)
  self.__modern_subpages_valid = false
  self.__modern_subpages = null
}

const remakeData = (self, dcl) => {
  invalidate(self, dcl)
}

export const checkRoutesMatching = (self, chain) => {
  const dcl = chain.handler_payload
  remakeData(self, dcl)
}

export const checkRoutesMatchingOnAttrsChange = (mention_match) => {
  const dcl = mention_match.link.chain.handler_payload
  remakeData(mention_match.mention_owner, dcl)
}

