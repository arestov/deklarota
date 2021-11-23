
import isBwConnectedView from './isBwConnectedView'

export default function getAncestorByRooViCon(self, details, strict) {
  //находит родительскую вьюху соеденённую с корневой вьюхой
  //by root view connection

  const view_space = details ? 'detailed' : 'main'
  let cur_ancestor = self
  const root_view = self.root_view
  if (strict) {
    cur_ancestor = cur_ancestor.parent_view
  }
  while (cur_ancestor) {
    if (cur_ancestor == root_view) {
      break
    }

    if (isBwConnectedView(cur_ancestor, view_space)) {
      return cur_ancestor
    }

    cur_ancestor = cur_ancestor.parent_view
  }
}
