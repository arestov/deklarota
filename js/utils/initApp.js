define(require => {
  const pv = require('pv')

  const glo = typeof global !== 'undefined' ? global : window

  const makeFlow = function (arg1, arg2) {
    const flow = new pv.CallbacksFlow(glo)
    return flow
  }

  const initApp = (App, env, interfaces, { logger } = {}) => {
    const views_proxies = new pv.views_proxies.Proxies()
    const sync_sender = new pv.SyncSender()
    const flow = interfaces.flow || makeFlow()
    return new Promise(resolve => {
      flow.input(() => {
        const app_model = new App({
          interfaces,
          _highway: {
            models_counters: 1,
            sync_sender,
            views_proxies,
            models: {},
            calls_flow: flow,
            proxies: views_proxies,
            env,
            logger,
          },
        })

        resolve({
          flow,
          app_model,
          sync_sender,
          // root_bwlev,
          views_proxies,
        })
      })
    })

    // if (app_model.start_page) {
    //   initBrowsing(app_model)
    // }
  }

  initApp.makeFlow = makeFlow
  return initApp
})
