import numDiff from './numDiff'

const addChainToIndex = (storage, chain) => {
  for (var jj = 0; jj < chain.list.length; jj++) {
    var step = chain.list[jj]
    // make index for each step
    storage[step.rel] = storage[step.rel] || []
    storage[step.rel].push(step)
  }
}

const sortChainLinks = (storage, rel_name) => {
  storage[rel_name] = storage[rel_name].sort(numDiff)
}

export { sortChainLinks }
export default addChainToIndex
