import prepareAppRuntime from 'pv/runtime/app/prepare.js'
import initBrowsing from '../js/initBrowsing.js'

const initCore = async (AppRoot, runtime, interfaces) => {
  const inited = await runtime.start({ App: AppRoot, interfaces })

  return new Promise(resolve => {
    inited.flow.input(() => {
      const rootBwlev = initBrowsing(inited.app_model, {
      })

      resolve({
        ...inited,
        rootBwlev,
      })
    })
  })
}

let last_error_prom = null
let reject_error_prom = null

const prepareLastErrorProm = () => {
  last_error_prom = new Promise((resolve, reject) => {
    reject_error_prom = reject
  })
}

const testingInit = async (
  AppRoot, interfaces = {}, { proxies = false, sync_sender = false, __proxies_leaks_check = false } = {},
) => {
  prepareLastErrorProm()
  const runtime = prepareAppRuntime({
    sync_sender,
    proxies,
    __proxies_leaks_check,
    warnUnexpectedAttrs: true,
    onError: err => {
      reject_error_prom(err)
      prepareLastErrorProm()
    },
  })

  const inited = await initCore(AppRoot, runtime, interfaces)

  const computed = () => Promise.race([
    runtime.last_error,
    last_error_prom,
    new Promise(resolve => inited.app_model.input(resolve)),
  ])

  return {
    ...inited,
    computed,
  }
}

export default testingInit
