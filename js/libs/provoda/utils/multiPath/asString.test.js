import parse from './parse'
import asString from './asString'

describe('asString', () => {
  describe('called on any valid addr', () => {
    describe('with `as_string` set', () => {
      it('should return `as_string` property value', () => {
        expect(asString({ as_string: '< enabled <<< #' })).toEqual('< enabled <<< #')
      })
    })

    describe('with `as_string` unset', () => {
      it('should cache result into `as_string` property', () => {
        const parsed = parse('trivialAttr')
        const serialized = asString(parsed)
        expect(parsed.as_string).toEqual(serialized)
      })
    })
  })

  describe('smoke', () => {
    it.each([
      ['root route attr', [
        '< @one:state_name < nesting < resource < #',
        '< @one:state_name < nesting < resource < #',
      ]],
      ['nesting shortcut', [
        '<< @one:nesting',
        '<< @one:nesting <<',
      ]],
      ['full root query', [
        '< state_name < nesting < resource < #',
        '< state_name < nesting < resource < #',
      ]],
      ['full root query with route', [
        '< state_name << /resource/[:ddaf]/sdf < #',
        '< state_name << /resource/[:ddaf]/sdf < #',
      ]],
      ['root attr query', [
        '< state_name <<< #',
        '< state_name <<< #',
      ]],
      ['root nesting query', [
        '<< nesting_name << #',
        '<< nesting_name << #',
      ]],
      ['grandparent nesting query', [
        '<< nesting_name << ^^',
        '<< nesting_name << ^^',
      ]],
      ['grandparent attr query', [
        '< state_name <<< ^^',
        '< state_name <<< ^^',
      ]],
      ['attr query shortcut', [
        '< state_name',
        '< state_name <<<',
      ]],
      ['trivial attr query', [
        'state_name',
        '< state_name <<<',
      ]],
      ['root route query shortcut', [
        '/resource/[:ddaf]/sdf < #',
        '<<< /resource/[:ddaf]/sdf < #'
      ]],
      ['route shortcut', [
        '/resource/[:ddaf]/sdf <',
        '<<< /resource/[:ddaf]/sdf <',
      ]],
      ['grandparent nesting shortcut', [
        'nesting_name << ^^',
        '<< nesting_name << ^^'
      ]]
    ])('should work for %s', (title, [input, expected]) => {
      expect(asString(parse(input))).toEqual(expected)
    })
  })
})
