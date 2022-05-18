import prepareAppRuntime from 'pv/runtime/app/prepare.js'
import initBrowsing from '../js/initBrowsing.js'
import { reinit } from '../js/libs/provoda/provoda/runtime/app/reinit.js'

const initSession = async (inited, session_root) => {

  return new Promise(resolve => {
    inited.flow.input(() => {
      if (!session_root) {
        return resolve(inited)
      }

      if (!inited.app_model.getNesting('common_session_root')) {
        const session = initBrowsing(inited.app_model, {})
        inited.app_model.updateNesting('common_session_root', session)
      }

      const rootBwlev = inited.app_model.getNesting('common_session_root')

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

const wrapTestApp = async (errors_catcher, runtime, inited_base, session_root) => {
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

const testingInit = async (
  AppRoot, interfaces = {}, { proxies = false, sync_sender = false, __proxies_leaks_check = false, session_root = false, dkt_storage } = {},
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
    dkt_storage,
  })

  const inited_base = await runtime.start({ App: AppRoot, interfaces })

  return wrapTestApp(errors_catcher, runtime, inited_base, session_root)
}

export const testingReinit = async (
  AppRoot,
  data,
  interfaces = {}, { proxies = false, sync_sender = false, __proxies_leaks_check = false, session_root = false, dkt_storage } = {},
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
    dkt_storage,
  })

  const inited_base = await reinit(AppRoot, runtime, data, interfaces)
  return wrapTestApp(errors_catcher, runtime, inited_base, session_root)
}

export default testingInit
