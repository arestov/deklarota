define(require => {
  const startApp = require('../libs/provoda/provoda/runtime/app/start')

  const initApp = (App, env, interfaces, { logger, ...busOptions } = {}) => startApp({ App, interfaces }, { logger, env, ...busOptions })

  return initApp
})
