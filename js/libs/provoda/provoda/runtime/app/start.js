

import AppRuntime from './AppRuntime'

export default function(appOptions, runOptions) {
  const _highway = new AppRuntime(runOptions)
  return _highway.start(appOptions)
}
