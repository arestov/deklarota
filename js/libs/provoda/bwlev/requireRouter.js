import requireLazyRel from '../utils/requireLazyRel'

const requireRouter = (self, router_name) => {
  return requireLazyRel(self, `router-${router_name}`)
}

export default requireRouter
