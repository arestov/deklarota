import showMOnMap from './showMOnMap'
import getModelById from '../utils/getModelById'
import getSPByPathTemplate from '../routes/legacy/getSPByPathTemplate'
import requireRouter from './requireRouter'
import { FlowStepShowInPerspectivator } from '../Model/flowStepHandlers.types'

const getRouter = (from, prefixed_name) => requireRouter(from, prefixed_name.replace('router-', ''))

export const showInPerspectivator = (perspectivator, resource) => {
  const bwlev = showMOnMap(perspectivator, resource)
  bwlev.showOnMap()
}

const show = (perspectivator, resource) => {
  if (resource.getAttr('$meta$inited')) {
    showInPerspectivator(perspectivator, resource)
    return
  }

  resource.nextTick(FlowStepShowInPerspectivator, [perspectivator, resource], true)
}

const handlers = {
  navigateToResource(context_md_id) {
    /*
      set current/view model as current model of context router
    */
    const context_md = getModelById(this, context_md_id)
    const resource = context_md
    const context_router = this
    const router = context_router
    showInPerspectivator(router, resource)
  },
  navigateByLocator(context_md_id, locator) {
    /*
      set subpage/uri model of current/view model as current model of context router
    */
    const context_md = getModelById(this, context_md_id)
    const resource = getSPByPathTemplate(this.app, context_md, locator, null, null, {autocreate: true})
    const context_router = this
    const router = context_router
    show(router, resource)
  },
  navigateRouterToResource(context_md_id, router_name) {
    /*
      set current/view model as current model of uri router inside context router
    */
    if (!router_name.startsWith('router-')) {
      throw new Error('router name should starts with `router-`')
    }
    const context_md = getModelById(this, context_md_id)
    const resource = context_md
    const context_router = this
    const router = getRouter(context_router, router_name)
    showInPerspectivator(router, resource)
  },
  navigateRouterByLocator(context_md_id, router_name, locator) {
    /*
      set subpage/uri model of current/view model as current model of uri router inside context router
    */
    if (!router_name.startsWith('router-')) {
      throw new Error('router name should starts with `router-`')
    }
    const context_md = getModelById(this, context_md_id)
    const resource = getSPByPathTemplate(this.app, context_md, locator, null, null, {autocreate: true})
    const context_router = this
    const router = getRouter(context_router, router_name)

    show(router, resource)
  },
  expectRouterRevealRel(current_md_id, router_name, rel_path) {
    if (!router_name.startsWith('router-')) {
      throw new Error('router name should starts with `router-`')
    }
    const context_router = this

    const router = getRouter(context_router, router_name)
    router.dispatch('expectRelBeRevealedByRelPath', {rel_path, current_md_id})
  }
}

export default handlers
