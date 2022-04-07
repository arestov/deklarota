type Map = {
  [key: string]: boolean | undefined
}

const states = {
  'one': true,
  'all': true,
  'every': true,
  'some': true,
  'find': true,
  'filter': true,
} as Map

const nestings = {
  'one': true,
  'all': true,
  'notEmpty': true,
  'length': true,
} as Map

export default function(zip_name: string, type: string): boolean {
  switch (type) {
    case 'state': {
      return states[zip_name] === true
    }
    case 'nesting': {
      return nestings[zip_name] === true
    }
  }
  return false
};
