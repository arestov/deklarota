const getNavParentForModelAtPerspectivator = (perspectivactor, model) => {

  const specific_nav_parent = model.getNesting(`nav_parent_at_perspectivator_${perspectivactor.model_name}`)
  if (Array.isArray(specific_nav_parent)) {
    throw new Error('cant be many/array')
  }

  if (specific_nav_parent != null) {
    return specific_nav_parent
  }

  return model.map_parent // fallback to legacy parent
}



export default getNavParentForModelAtPerspectivator
