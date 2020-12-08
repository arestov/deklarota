/**
 * @param {View} view
 * @returns Set<View>
 */
const getRelParents = (view) => {
  const parents = new Set()
  let parent = view.parent_view
  while (parent) {
    if (parents.has(parent)) { // to prevent cyclic nesting
      break
    }
    parents.add(parent)
    parent = parent.parent_view
  }
  return parents
}

/**
 * Get nesting path for current view in grandparent.parent.currentView format
 *
 * @param {View} view
 * @returns {string}
 */
const getRelPath = (view) => {
  const parents = getRelParents(view)
  return [view, ...parents]
    .map(v => v.nesting_name || '<empty>')
    .reverse() // to make top-level view first
    .join('.')
}

export default getRelPath
