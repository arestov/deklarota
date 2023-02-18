import callApiDclFn from './callApiFn'

const CH_GR_LE = 2

function checkApi(declr, value, self) {
  if (!value) {
    self.useInterface(declr.name, null, declr.destroy)
    return
  }

  const api = callApiDclFn(self, declr)
  self.useInterface(declr.name, api)
}

function iterateApis(changes_list, context) {
  //index by uniq
  const index = context.__apis_$_index
  if (!index) {
    return
  }

  for (let i = 0; i < changes_list.length; i += CH_GR_LE) {
    const state_name = changes_list[i]
    if (!index[state_name]) {
      continue
    }

    checkApi(index[state_name], changes_list[i + 1], context)
  }
}

export default iterateApis
