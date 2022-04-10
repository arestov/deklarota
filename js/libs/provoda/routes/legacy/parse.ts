
import memorize from '../../../spv/memorize'

// from template to full string - implemented
// from string to match - NOT IMPLEMENTED

// tracks/[:trackName]/more/something/else
// how to match subpaths? submodels can route same path
// subpaths levels handling should be limited to 2 levels for now
// so model can handle only /tracks or /tracks/[:trackName] but not tracks/[:trackName]/more
// example "#tracks/[:artist:next_value],[:track]" // artist:next_value - way to map data
// {next_value: 'Mike'} will be used as "artist" for template

const string_state_regexp = /\[\:.+?\]/gi

type LegacyRouteParamsMap = [string, string, string | undefined][]

const makeStatesMap = function(states_raw: string[]):LegacyRouteParamsMap {
  const result: LegacyRouteParamsMap = new Array(states_raw.length)

  for (let i = 0; i < states_raw.length; i++) {
    const parts = (states_raw[i] as string).split(':')
    const dest = parts[0]
    if (dest == null) {
      throw new Error()
    }
    const source = parts[1] || dest
    const value = parts[2]
    result[i] = [dest, source, value]
  }

  return result
}

type ParsedLegacyRoute = {
  clean_string_parts: string[]
  states: string[] | null
  states_map: LegacyRouteParamsMap | null
}

const parse = function(full_usable_string: string): ParsedLegacyRoute {
  // tracks/[:artist],[:track]
  const clean_string_parts = full_usable_string.split(string_state_regexp)
  const states = full_usable_string.match(string_state_regexp)

  if (states) {
    for (let i = 0; i < states.length; i++) {
      const cur = states[i] as string
      states[i] = cur.slice(2, cur.length - 1)
    }
  }

  const statesconv = states as string[] | null

  const states_map = states && makeStatesMap(states)

  return {
    clean_string_parts: clean_string_parts,
    states: statesconv,
    states_map: states_map,
  }
}

const parsePath = memorize(parse)

export default parsePath
