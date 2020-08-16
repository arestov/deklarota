
var collectRegFires = require('./dcl/collectRegFires')

export default function onPropsExtend(self, props) {
  collectRegFires(self, props)
};
