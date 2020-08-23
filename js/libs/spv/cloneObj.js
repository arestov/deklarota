
var simpleClone = function simpleClone(_no, donor) {
  for (var prop in donor) {
    if (!donor.hasOwnProperty(prop)) {
      continue
    }
    _no[prop] = donor[prop]
  }
  return _no
}

var doClone = Object.assign ? function cloneObj(_no, donor) {
  return Object.assign(_no, donor)
} : simpleClone


export default function blockingCloneObj(acceptor, donor, black_list, white_list) {
  //not deep!
  var _no = acceptor || {}
  if (black_list == null && white_list == null) {
    return doCopy(_no, donor)
  }
  var prop

  for (prop in donor) {
    if (!donor.hasOwnProperty(prop)) {
      continue
    }
    if (!white_list || !!~white_list.indexOf(prop)) {
      if (!black_list || !~black_list.indexOf(prop)) {
        _no[prop] = donor[prop]
      }
    }
  }
  return _no
};
