import validateActionsDestinations from '../dcl/passes/validateActionsDestinations'

const relink = (Constr, RootConstr) => {

  const self = Constr.prototype


  const all = self._all_chi

  for (var prop in all) {
    if (!all.hasOwnProperty(prop)) {continue}

    if (!all[prop]) {continue}

    relink(all[prop], RootConstr)
  }

  validateActionsDestinations(RootConstr.prototype, self)

}

export default relink
