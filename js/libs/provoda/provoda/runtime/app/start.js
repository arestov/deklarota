

import AppRuntime from './AppRuntime'

export default function(appOptions, runOptions) {
  var _highway = new AppRuntime(runOptions)
  return _highway.start(appOptions)
}
