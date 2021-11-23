
import spv from '../../../spv'

import RouteDcl from './dcl'
const cloneObj = spv.cloneObj

const buildRoutes = function(self, index) {
  // TODO: allow to control matching order

  const result = []
  for (const name in index) {
    result.push(
      index[name]
    )
  }

  self.__routes_matchers_defs = result

  // 1. расставить приоритеты. распарсить?
  // 2. getSPI <- sub_pages <- nestings
  // 3. create -> best route -> nesting


  // dcl -> dcl_runtime (on change -> find old+new key in each list item ->)

}

const parse = function(name, data) {
  return new RouteDcl(name, data)
}

const extend = function(index, more) {
  const cur = cloneObj({}, index) || {}

  for (const name in more) {
    const data = more[name]
    if (!data) {
      console.warn('implement route erasing for: ', name)
      continue
    }

    const dcl = parse(name, data)
    cur[name] = dcl
  }

  return cur
}

const checkModern = function(self) {
  const routes = self.hasOwnProperty('routes') && self.routes
  if (!routes) {
    return
  }

  self._extendable_routes_index = extend(
    self._extendable_routes_index,
    routes
  )
}


export default function checkRoutes(self) {

  const currentIndex = self._extendable_routes_index

  checkModern(self)

  if (currentIndex === self._extendable_routes_index) {
    return
  }

  buildRoutes(self, self._extendable_routes_index, currentIndex)


  return true
}
