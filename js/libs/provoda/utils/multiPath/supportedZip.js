

var states = {
  'one': true,
  'all': true,
  'every': true,
  'some': true,
  'find': true,
  'filter': true,
}

var nestings = {
  'one': true,
  'all': true,
  'notEmpty': true,
  'length': true,
}

export default function(zip_name, type) {
  switch (type) {
    case 'state': {
      return states[zip_name] === true
    }
    case 'nesting': {
      return nestings[zip_name] === true
    }
  }
};
