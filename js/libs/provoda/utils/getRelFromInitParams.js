const getRelFromInitParams = (params) => {
  if (params == null) {
    return null
  }

  return params.nestings
}

export default getRelFromInitParams
