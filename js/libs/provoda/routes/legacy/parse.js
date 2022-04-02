
import spv from '../../../spv'

// from template to full string - implemented
// from string to match - NOT IMPLEMENTED

// tracks/[:trackName]/more/something/else
// how to match subpaths? submodels can route same path
// subpaths levels handling should be limited to 2 levels for now
// so model can handle only /tracks or /tracks/[:trackName] but not tracks/[:trackName]/more
// example "#tracks/[:artist:next_value],[:track]" // artist:next_value - way to map data
// {next_value: 'Mike'} will be used as "artist" for template

const string_state_regexp = /\[\:.+?\]/gi

const makeStatesMap = function(states_raw) {
  const result = new Array(states_raw.length)

  for (let i = 0; i < states_raw.length; i++) {
    const parts = states_raw[i].split(':')
    const dest = parts[0]
    const source = parts[1] || dest
    const value = parts[2]
    result[i] = [dest, source, value]
  }

  return result
}

const parse = function(full_usable_string) {
  // tracks/[:artist],[:track]
  const clean_string_parts = full_usable_string.split(string_state_regexp)
  const states = full_usable_string.match(string_state_regexp)

  if (states) {
    for (let i = 0; i < states.length; i++) {
      states[i] = states[i].slice(2, states[i].length - 1)
    }
  }

  const states_map = states && makeStatesMap(states)

  return {
    clean_string_parts: clean_string_parts,
    states: states,
    states_map: states_map,
  }
}

const parsePath = spv.memorize(parse)

export default parsePath
