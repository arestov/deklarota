function waitFlow(app_model) {
  return new Promise(resolve => {
    app_model.input(() => {
      next(app_model, () => {
        resolve(app_model)
      })
    })
  })
}

function next(app, cb) {
  app._calls_flow.whenReady(cb)
}

module.exports = waitFlow
