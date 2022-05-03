import type { Addr } from '../utils/multiPath/addr.types'

const checkRel = (rel: string): void => {
  switch (rel) {
    case '$v_parent':
      return
  }
  console.warn('only $v_root, $v_parent can be used', { rel })
  throw new Error('only $v_root, $v_parent can be used')
}

const validateViewAddr = (addr: Addr): void => {
  if (addr.from_base.type == 'root') {
    console.warn('replace', addr, 'by $v_root')
    return
  }

  if (addr.from_base.type == 'parent') {
    console.warn('replace', addr, 'by $v_parent')
    throw new Error('replace ascendor (^) addr by rel $v_parent')
  }

  if (addr.result_type === 'nesting') {
    throw new Error('views can read only attr from view rels')
  }

  if (!addr.nesting.path) {
    return
  }

  if (addr.zip_name != 'one') {
    console.warn('use `one`', addr)
    throw new Error('use `one`')
  }

  addr.nesting.path.forEach(checkRel)
}

export default validateViewAddr
