import getRouteStepParent from './getRouteStepParent'

export default function properParent(map, md) {
  var cur = md
  while (cur && cur._x_skip_navigation) {
    cur = getRouteStepParent(map, cur)
  }

  return cur

};
