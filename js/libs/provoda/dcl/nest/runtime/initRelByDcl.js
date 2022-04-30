import getSPByPathTemplate from '../../../routes/legacy/getSPByPathTemplate'

const getSubPByDeclr = function(md, cur) {
  if (cur.type == 'route') {
    return getSPByPathTemplate(md.app, md, cur.value)
  } else {
    const constr = md._all_chi[cur.key]
    return md.initSi(constr)
  }
}


const getSubPByDeclrStrict = (md, cur) => {
  const result = getSubPByDeclr(md, cur)
  if (result == null) {
    console.log(cur, md.__code_path)
    throw new Error('should not be empty')
  }

  return result
}

const initRelByDcl = function(md, el) {
  const array = el.subpages_names_list
  let result
  if (Array.isArray(array)) {
    result = new Array(array)
    for (let i = 0; i < array.length; i++) {
      result[i] = getSubPByDeclrStrict(md, array[i])
    }
  } else {
    result = getSubPByDeclrStrict(md, array)
  }
  return result
}

export default initRelByDcl
