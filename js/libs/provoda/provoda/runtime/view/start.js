

var ViewRuntime = require('./ViewRuntime')

export default function(viewOptions, runOptions) {
  var _highway = new ViewRuntime(runOptions)
  return _highway.start(viewOptions)
};
