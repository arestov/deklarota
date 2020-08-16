
import angbo from './StatementsAngularParser.min'

// angbo should be passed to App View Root as interface.
// but we using singleton instance and mutating it
// TODO: don't require angbo, but pass to App View Root

export default function(fn) {
  angbo.getFilterFn = fn
}
