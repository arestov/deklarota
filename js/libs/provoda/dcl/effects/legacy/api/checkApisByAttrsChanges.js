const CH_GR_LE = 2

function checkApi(declr, value, self) {
  if (!value) {
    self.useInterface(declr.name, null, declr.destroy)
    return
  }

  if (!declr.needed_apis) {
    self.useInterface(declr.name, declr.fn())
    return
  }

  const args = new Array(declr.needed_apis.length)
  for (let i = 0; i < declr.needed_apis.length; i++) {
    args[i] = self._interfaces_used[declr.needed_apis[i]]
  }

  self.useInterface(declr.name, declr.fn.apply(null, args))

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
