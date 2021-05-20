import isGlueRel from '../mentions/isGlueRel'

const isPublicRel = (self, rel_name) => !isGlueRel(self, rel_name)

export default isPublicRel
