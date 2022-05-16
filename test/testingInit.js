import prepareAppRuntime from 'pv/runtime/app/prepare.js'
import initBrowsing from '../js/initBrowsing.js'

const initSession = async (inited, session_root) => {

  return new Promise(resolve => {
    inited.flow.input(() => {
      if (!session_root) {
        return resolve(inited)
      }

      const rootBwlev = initBrowsing(inited.app_model, {
      })

      inited.app_model.updateNesting('common_session_root', rootBwlev)

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

  const inited_base = await runtime.start({ App: AppRoot, interfaces })

  const inited = await initSession(inited_base, session_root)

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
