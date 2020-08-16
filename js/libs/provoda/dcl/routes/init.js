
import addFrom from '../../nest-watch/addFrom'
import RouteRunner from './RouteRunner'


export default function(self) {
  self.__modern_subpages_valid = false
  self.__modern_subpages = null
  self.__routes_matchers_runs = null

  if (!self.__routes_matchers_defs) {
    return
  }

  var list = new Array(self.__routes_matchers_defs.length)

  for (var i = 0; i < self.__routes_matchers_defs.length; i++) {
    var cur = self.__routes_matchers_defs[i]
    var cur = new RouteRunner(self, cur)
    list[i] = cur
    addFrom(self, cur.lnwatch)
  }

  self.__routes_matchers_runs = list

}
