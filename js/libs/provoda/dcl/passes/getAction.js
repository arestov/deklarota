const getAction = (ptr, action_name) => {
  if (!ptr._extendable_passes_index) {return null}

  return ptr._extendable_passes_index[action_name] || null
}

export default getAction
