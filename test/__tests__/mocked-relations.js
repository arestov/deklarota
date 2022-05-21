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
      attrFromRoot: ['comp', ['< @one:rootAttr < $root']],
      attrFromParent: ['comp', ['< @one:parentAttr < $parent']],
    },
  }, null, {
    relation_mocks: {
      '< @all:relAttr < nested <<': ['valueOfRelAttr'],
      '< @all:rootAttr < $root': ['valueOfRootAttr'],
      '< @all:parentAttr < $parent': ['valueOfParentAttr'],
    },
  })

  expect(pvState(testApp.app_model, 'attrFromRel')).toBe('valueOfRelAttr')
  expect(pvState(testApp.app_model, 'attrFromRoot')).toBe('valueOfRootAttr')
  expect(pvState(testApp.app_model, 'attrFromParent')).toBe('valueOfParentAttr')

  await testApp.steps([
    () => {
      testApp.app_model.__updateRelationMocks({
        '< @all:relAttr < nested <<': ['valueOfRelAttr2'],
        '< @all:rootAttr < $root': ['valueOfRootAttr2'],
        '< @all:parentAttr < $parent': ['valueOfParentAttr2'],

      })
    },
    () => {
      expect(pvState(testApp.app_model, 'attrFromRel')).toBe('valueOfRelAttr2')
      expect(pvState(testApp.app_model, 'attrFromRoot')).toBe('valueOfRootAttr2')
      expect(pvState(testApp.app_model, 'attrFromParent')).toBe('valueOfParentAttr2')
    },
  ])
})
