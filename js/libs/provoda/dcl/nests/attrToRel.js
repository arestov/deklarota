import _updateRel from '../../_internal/_updateRel'

export default function attrToRel(self, attr_name, value) {
  if (self.__attr_to_rel_name == null) {
    return
  }

  const rel_name = self.__attr_to_rel_name.get(attr_name)
  if (rel_name == null) {
    return
  }

  _updateRel(self, rel_name, value)
}
