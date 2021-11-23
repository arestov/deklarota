

import d_parsers from './directives_parsers'
const config = d_parsers.config

const parser = {
  config: config,
  comment_directives_p: d_parsers.comment_directives_p,
  directives_p: d_parsers.directives_p,
  scope_generators_p: d_parsers.scope_generators_p,
  parse: null,
  parseEasy: null
}

export default parser
