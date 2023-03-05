
import getNavGroups from './getNavGroups'

const joinSubtree = function(array) {
  let url = ''
  for (let i = array.length - 1; i >= 0; i--) {
    const md = 	array[i]
    const url_part = md.getAttr('url_part')
    // if (!url_part) {
    // 	throw new Error('must be url');
    // }
    url += url_part || ''
  }
  return url
}

export default function(nav) {
  if (!nav || !nav.length) {
    return null
  }

  let url = ''


  const groups = getNavGroups(nav[ nav.length - 1 ])

  /*
    /users/me/lfm:neighbours#3:/users/lfm:kolczyk0
  */

  const last = groups.pop()

  url += joinSubtree(last)


  for (let i = groups.length - 1; i >= 0; i--) {
    const distance = groups[i].length
    url += '#'

    if (distance > 1) {
      url += distance + ':'
    }

    url += joinSubtree(groups[i])
  }

  return url
}
