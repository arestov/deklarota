const handleHeavyRelQueryChange = (self, chain) => {
  const fn = chain.handler_payload.handler
  fn(chain, self)
}

export default handleHeavyRelQueryChange
