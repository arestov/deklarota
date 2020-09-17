import pvUpdate from 'pv/updateAttr'
import pvState from 'pv/getAttr'

import init from 'test/init'

test('state updated', async () => {
  const { app_model, steps } = await init({})
  expect(undefined).toBe(app_model.state('first_name'))

  return steps([
    () => pvUpdate(app_model, 'first_name', 'John'),
    app_model => {
      expect('John').toBe(pvState(app_model, 'first_name'))
    },
  ]);
})

test('simple compx calculated', async () => {
  const { app_model, steps } = await init({
    attrs: {
      full_name: [
        'comp',
        ['first_name', 'last_name'],
        (first_name, last_name) => {
          if (!first_name || !last_name) {
            return null
          }
          return `${first_name} ${last_name}`
        },
      ],
    },
  })

  expect(undefined).toBe(pvState(app_model, 'full_name'))

  await steps([
    () => {
      pvUpdate(app_model, 'first_name', 'John')
      pvUpdate(app_model, 'last_name', 'Smith')
    },
    app_model => {
      expect('John Smith').toBe(pvState(app_model, 'full_name'))
    },
  ])
})

test('prechecked compx calculated', async () => {
  const { app_model, steps } = await init({
    attrs: {
      full_name: [
        'comp',
        ['&first_name', 'last_name'],
        (first_name, last_name) => {
          if (!first_name) { // function should never be runned with first_name == null
            throw new Error('should never happen')
          }
          return `${first_name} ${last_name}`
        },
      ],
    },
  })

  expect(undefined).toBe(pvState(app_model, 'full_name'))

  await steps([
    () => {
      pvUpdate(app_model, 'last_name', 'Smith')
    },
    app_model => {
      expect(pvState(app_model, 'full_name') == null).toBe(true)
    },
  ])

  await steps([
    () => {
      pvUpdate(app_model, 'first_name', 'John')
      pvUpdate(app_model, 'last_name', 'Smith')
    },
    app_model => {
      expect('John Smith').toBe(pvState(app_model, 'full_name'))
    },
  ])
})
