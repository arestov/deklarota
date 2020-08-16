
var templateOptions = function(params, key) {
  this.key = key
  this.samples = params.map[0]
  this.pv_nest = params.pv_nest
}

export default function getTemplateOptions(params, createKey) {
  if (!params.map[0] || !params.pv_nest) {
    return null
  }

  return new templateOptions(params, createKey())
};
