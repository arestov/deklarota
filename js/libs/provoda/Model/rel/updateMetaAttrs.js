import _updateAttrsByChanges from '../../_internal/_updateAttrsByChanges'

const updateMetaAttrs = function updateMetaAttrs(self, collection_name, array) {

  var count = Array.isArray(array)
    ? array.length
    : (array ? 1 : 0)

  var name_for_length_legacy = collection_name + '$length'
  var name_for_length_modern = '$meta$nests$' + collection_name + '$length'

  var name_for_exists_legacy = collection_name + '$exists'
  var name_for_exists_modern = '$meta$nests$' + collection_name + '$exists'

  self._attrs_collector.defineAttr(name_for_length_legacy, 'int')
  self._attrs_collector.defineAttr(name_for_length_modern, 'int')
  self._attrs_collector.defineAttr(name_for_exists_legacy, 'bool')
  self._attrs_collector.defineAttr(name_for_exists_modern, 'bool')

  _updateAttrsByChanges(self, [
    name_for_length_legacy, count,
    name_for_length_modern, count,
    name_for_exists_legacy, Boolean(count),
    name_for_exists_modern, Boolean(count),
  ])
}

export default updateMetaAttrs
