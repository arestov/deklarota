
var getModel = require('../../View/getModel')

export default function(view, mdr) {
  return getModel(view, mdr._provoda_id)
};
