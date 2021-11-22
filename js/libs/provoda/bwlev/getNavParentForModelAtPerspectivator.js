import getRelShape from '../dcl/nests/getRelShape'

const getNavParentForModelAtPerspectivator = (perspectivactor, model) => {
  const rel_name = `nav_parent_at_perspectivator_${perspectivactor.model_name}`
  const rel_shape = getRelShape(model, rel_name)

  if (!rel_shape) {
    model._warnError('fallback to legacy parent', {rel_name})
    return model.map_parent // fallback to legacy parent
  }

  const specific_nav_parent = model.getNesting(rel_name)
  if (Array.isArray(specific_nav_parent)) {
    throw new Error('cant be many/array')
  }

  if (specific_nav_parent === model) {
    // link to self means there is no parent
    return null
  }

  if (specific_nav_parent == null) {
    model._throwError('should not be null', {rel_name})
    return
  }

  return specific_nav_parent
}



export default getNavParentForModelAtPerspectivator
