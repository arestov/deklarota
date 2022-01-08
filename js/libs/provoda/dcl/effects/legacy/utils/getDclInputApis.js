const getDclInputApis = (self, dcl) => {
  if (dcl.apis_as_input === false) {
    throw new Error('handle dcl.apis_as_input===false without calling getDclInputApis')
  }

  const apis_names = dcl.apis_as_input || dcl.apis
  const apis_list = new Array(apis_names.length)
  for (let i = 0; i < apis_names.length; i++) {
    apis_list[i] = self.getInterface(apis_names[i])
  }

  return apis_list
}

export default getDclInputApis
