const getRelStepModel = (from, step) => {
  switch (step) {
    case '$v_parent':
      return from.parent_view
    case '$v_root':
      return from.root_view
  }
  console.warn('cant use this step', {step})
  throw new Error('cant use this step')
}

const followRelPath = (start, rel_path) => {
  let from = start
  for (let i = 0; i < rel_path.length; i++) {
    const cur = rel_path[i]
    from = getRelStepModel(from, cur)
  }
  return from
}

export default followRelPath
