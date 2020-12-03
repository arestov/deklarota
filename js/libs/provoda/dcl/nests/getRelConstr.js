import { getNestingConstr } from '../../structure/get_constr'

const getRelConstr = (self, rel_name) => {
  if (!self.RootConstr) {
    debugger
  }
  var result = getNestingConstr(self.RootConstr.prototype, self, rel_name)
  if (!result) {
    // find by ref rel addr
  }

  return result
}


export default getRelConstr
