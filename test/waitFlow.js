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
  app._calls_flow.pushToFlow(cb, null, null, null, null, null, {
    complex_order: [Infinity],
    inited_order: [Infinity],
  })
}

module.exports = waitFlow
