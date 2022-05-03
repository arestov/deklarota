import initView from 'dkt/runtime/view/start.js'
import { installCommonGlobals } from 'jest-util'
import jsdom from 'jsdom'

const { JSDOM } = jsdom

const testingInitView = async (inited, { document_path, getRootView, view_name = 'root' }) => {
  const file_path = document_path
  const new_dom = await JSDOM.fromFile(file_path, {
    features: {
      ProcessExternalResources: false,
    },
  })

  const new_window = new_dom.window

  installCommonGlobals(new_window, {})
  global.document = new_window.document
  global.window = new_window

  const RootView = await getRootView()

  const proxies = inited.views_proxies

  const proxiesSpace = Date.now()
  proxies.addSpaceById(proxiesSpace, inited.rootBwlev)

  const mpx = proxies.getMPX(proxiesSpace, inited.rootBwlev)

  const view = await initView({
    mpx,
    bwlev: inited.rootBwlev,
    RootView,
    name: view_name,

    proxies_space: proxiesSpace,

    interfaces: {
      win: new_window,
      window: new_window,
      document: new_window.document,
    },

  }, {
    proxies,
  })

  const { whenAllReady } = view._highway

  const whenReady = () => new Promise(resolve => whenAllReady(resolve))

  return {
    view,
    window: new_window,
    document: new_window.document,
    whenViewReady: whenReady,
  }
}

export default testingInitView
