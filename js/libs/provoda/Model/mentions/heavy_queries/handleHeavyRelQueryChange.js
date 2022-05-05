import handleExpectedRelChange, { REL_QUERY_TYPE_REL } from '../../../../../models/handleExpectedRelChange'

const handleHeavyRelQueryChange = (self, chain) => {
  const type = chain.handler_payload.handler_type
  switch (type) {
    case REL_QUERY_TYPE_REL: {
      handleExpectedRelChange(chain, self)
      return
    }
  }
  throw new Error('not possible branch')
}

export default handleHeavyRelQueryChange
