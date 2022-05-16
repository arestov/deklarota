import prepareAppRuntime from 'pv/runtime/app/prepare.js'
import initBrowsing from '../js/initBrowsing.js'

const initCore = async (AppRoot, runtime, interfaces, session_root) => {
  const inited = await runtime.start({ App: AppRoot, interfaces })

  return new Promise(resolve => {
    inited.flow.input(() => {
      const rootBwlev = session_root ? initBrowsing(inited.app_model, {
      }) : null
      if (session_root) {
        inited.app_model.updateNesting('common_session_root', rootBwlev)
      }

      resolve({
        ...inited,
        rootBwlev,
      })
    })
  })
}


const catchFlowErrors = () => {

  const catcher = {
    last_error_prom: null,
    reject_error_prom: null,
    prepareLastErrorProm: null,
  }


  const prepareLastErrorProm = () => {
    catcher.last_error_prom = new Promise((resolve, reject) => {
      catcher.reject_error_prom = (err) => {
        reject(err)
        prepareLastErrorProm()
      }
    })
  }

  prepareLastErrorProm()

  return catcher
}

const testingInit = async (
  AppRoot, interfaces = {}, { proxies = false, sync_sender = false, __proxies_leaks_check = false, session_root = false } = {},
) => {
  const errors_catcher = catchFlowErrors()

  const runtime = prepareAppRuntime({
    sync_sender,
    proxies,
    __proxies_leaks_check,
    warnUnexpectedAttrs: true,
    onError: err => {
      errors_catcher.reject_error_prom(err)
    },
  })

  const inited = await initCore(AppRoot, runtime, interfaces, session_root)

  const computed = () => Promise.race([
    runtime.last_error,
    errors_catcher.last_error_prom,
    new Promise(resolve => inited.app_model.input(resolve)),
  ])

  return {
    ...inited,
    computed,
  }
}

export default testingInit
