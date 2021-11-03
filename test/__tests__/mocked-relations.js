/* eslint-disable fp/no-mutation, fp/no-let */

import pvState from 'pv/getAttr'

import init from 'test/init'

beforeEach(() => {
  jest.spyOn(console, 'warn').mockImplementation(() => {});
})

it('should have proper value of external attrs', async () => {
  const testApp = await init({
    mock_relations: true,
    attrs: {
      attrFromRel: ['comp', ['< @one:relAttr < nested']],
      attrFromRoot: ['comp', ['< rootAttr <<< #']],
      attrFromParent: ['comp', ['< parentAttr <<< ^']],
    },
  }, null, {
    relation_mocks: {
      '< @one:relAttr < nested <<': 'valueOfRelAttr',
      '< rootAttr <<< #': 'valueOfRootAttr',
      '< parentAttr <<< ^': 'valueOfParentAttr',

    },
  })

  expect(pvState(testApp.app_model, 'attrFromRel')).toBe('valueOfRelAttr')
  expect(pvState(testApp.app_model, 'attrFromRoot')).toBe('valueOfRootAttr')
  expect(pvState(testApp.app_model, 'attrFromParent')).toBe('valueOfParentAttr')

  await testApp.steps([
    () => {
      testApp.app_model.__updateRelationMocks({
        '< @one:relAttr < nested <<': 'valueOfRelAttr2',
        '< rootAttr <<< #': 'valueOfRootAttr2',
        '< parentAttr <<< ^': 'valueOfParentAttr2',

      })
    },
    () => {
      expect(pvState(testApp.app_model, 'attrFromRel')).toBe('valueOfRelAttr2')
      expect(pvState(testApp.app_model, 'attrFromRoot')).toBe('valueOfRootAttr2')
      expect(pvState(testApp.app_model, 'attrFromParent')).toBe('valueOfParentAttr2')
    },
  ])
})
