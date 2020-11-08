

export default function(self) {
  if (!self.hasOwnProperty('__attrs_base_input')) {return}

  var byName = self.__attrs_base_input

  var result = {}
  for (var attr_name in byName) {
    var cur = byName[attr_name]
    result[attr_name] = cur[0]
  }

  self.__default_attrs = result
};
