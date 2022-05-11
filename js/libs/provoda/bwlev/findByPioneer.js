import getRel from '../provoda/getRel'

function findByPioneer(list, pioneer) {
  if (!list) {
    return null
  }

  for (let i = 0; i < list.length; i++) {
    const cur = list[i]
    if (getRel(cur, 'pioneer')._provoda_id == pioneer._provoda_id) {
      return cur
    }

    return null
  }
}

export default findByPioneer
