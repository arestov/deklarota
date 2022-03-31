import getDepValue from '../../../utils/multiPath/getDepValue'
import makeMatchingData from './makeMatchingData'

const remakeData = (self, dcl) => {

  const ordered_items = getDepValue(self, dcl.addr)

  const result = self.__routes_matchers_state.get(dcl.path_template) || []
  // reusing

  makeMatchingData(result, dcl, self, ordered_items)

  self.__routes_matchers_state.set(dcl.path_template, result)
}

export const checkRoutesMatching = (self, chain) => {
  const dcl = chain.handler_payload
  remakeData(self, dcl)
}

export const checkRoutesMatchingOnAttrsChange = (mention_match) => {
  const dcl = mention_match.link.chain.handler_payload
  remakeData(mention_match.mention_owner, dcl)
}
