import getSPByPathTemplate from '../routes/legacy/getSPByPathTemplate'

const requireRouter = (self, router_name) => {
  return getSPByPathTemplate(self.app, self, `router-${router_name}`)
}

export default requireRouter
