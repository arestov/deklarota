const getRelFromInitParams = (params) => {
  if (params == null) {
    return null
  }

  if (params.nestings) {
    throw new Error('use `rels` instead of `nestings` for initing params')
  }

  return params.rels || null
}

export default getRelFromInitParams
