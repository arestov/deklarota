
import addFrom from '../../nest-watch/addFrom'
import RouteRunner from './RouteRunner'


export default function(self) {
  self.__modern_subpages_valid = false
  self.__modern_subpages = null
  self.__routes_matchers_runs = null
  self.__routes_matchers_state = null

  if (!self.__routes_matchers_defs) {
    return
  }

  const list = new Array(self.__routes_matchers_defs.length)

  for (let i = 0; i < self.__routes_matchers_defs.length; i++) {
    const cur1 = self.__routes_matchers_defs[i]
    const cur = new RouteRunner(self, cur1)
    list[i] = cur
    addFrom(self, cur.lnwatch)
  }

  self.__routes_matchers_runs = list

  self.__routes_matchers_state = new Map()
}
