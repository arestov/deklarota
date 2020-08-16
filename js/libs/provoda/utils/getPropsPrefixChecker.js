

export default function(check) {
  return function(props) {
    for (var prop_name in props) {
      if (props.hasOwnProperty(prop_name) && check(prop_name)) {
        return true
      }
    }
  }
};
