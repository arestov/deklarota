import prepareAppRuntime from 'pv/runtime/app/prepare.js'
import initBrowsing from '../js/initBrowsing.js'

const initCore = async (AppRoot, runtime, interfaces) => {
  const inited = await runtime.start({ App: AppRoot, interfaces })

  return new Promise(resolve => {
    inited.flow.input(() => {
      const rootBwlev = initBrowsing(inited.app_model, {
        isCommonRoot: true,
      })

      resolve({
        ...inited,
        rootBwlev,
      })
    })
  })
}

const testingInit = async (
  AppRoot, interfaces = {}, { proxies = false, sync_sender = false } = {}
) => {
  const runtime = prepareAppRuntime({
    sync_sender,
    proxies,
    warnUnexpectedAttrs: false,
  })

  const inited = await initCore(AppRoot, runtime, interfaces)

  const computed = () => Promise.race([
    runtime.last_error,
    new Promise(resolve => inited.app_model.input(resolve)),
  ])

  return {
    ...inited,
    computed,
  }
}

export default testingInit
