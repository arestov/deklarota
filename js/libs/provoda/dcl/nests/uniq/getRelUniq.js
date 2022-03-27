import getRelShape from '../getRelShape'

const getRelUniq = (self, rel_name) => {
  return getRelShape(self, rel_name)?.uniq
}

export default getRelUniq
