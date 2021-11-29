import showMOnMap from './showMOnMap'
import getModelById from '../utils/getModelById'
import getSPByPathTemplate from '../routes/legacy/getSPByPathTemplate'


const handlers = {
  navigateToResource(context_md_id) {
    /*
      set current/view model as current model of context router
    */
    const context_md = getModelById(this, context_md_id)
    const resource = context_md
    const context_router = this
    const router = context_router
    const bwlev = showMOnMap(router, resource)
    bwlev.showOnMap()
  },
  navigateByLocator(context_md_id, locator) {
    /*
      set subpage/uri model of current/view model as current model of context router
    */
    const context_md = getModelById(this, context_md_id)
    const resource = getSPByPathTemplate(this.app, context_md, locator)
    const context_router = this
    const router = context_router
    const bwlev = showMOnMap(router, resource)
    bwlev.showOnMap()
  },
  navigateRouterToResource(context_md_id, router_name) {
    /*
      set current/view model as current model of uri router inside context router
    */
    const context_md = getModelById(this, context_md_id)
    const resource = context_md
    const context_router = this
    const router = getSPByPathTemplate(this.app, context_router, router_name)
    const bwlev = showMOnMap(router, resource)
    bwlev.showOnMap()
  },
  navigateRouterByLocator(context_md_id, router_name, locator) {
    /*
      set subpage/uri model of current/view model as current model of uri router inside context router
    */
    const context_md = getModelById(this, context_md_id)
    const resource = getSPByPathTemplate(this.app, context_md, locator)
    const context_router = this
    const router = getSPByPathTemplate(this.app, context_router, router_name)
    const bwlev = showMOnMap(router, resource)
    bwlev.showOnMap()
  },
  expectRouterRevealRel(current_md_id, router_name, rel_path) {
    const context_router = this
    const router = getSPByPathTemplate(this.app, context_router, router_name)
    router.dispatch('expectRelBeRevealedByRelPath', {rel_path, current_md_id})
  }
}

export default handlers
