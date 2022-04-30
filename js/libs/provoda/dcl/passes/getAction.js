const getAction = (ptr, action_name) => {
  if (!ptr.$actions$combo) {return null}

  return ptr.$actions$combo[action_name] || null
}

export default getAction
