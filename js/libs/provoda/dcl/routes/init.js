export default function(self) {
  self.__modern_subpages_valid = false
  self.__modern_subpages = null
  self.__routes_matchers_state = null

  if (!self.__routes_matchers_defs) {
    return
  }

  self.__routes_matchers_state = new Map()
}
