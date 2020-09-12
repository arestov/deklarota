import prsStCon from '../../../prsStCon'

const prefillCompAttr = function prefillCompAttr(self, changes_list) {
  prsStCon.prefill.self(self, changes_list)
  prsStCon.prefill.parent(self, changes_list)
  prsStCon.prefill.root(self, changes_list)
}

export default prefillCompAttr
