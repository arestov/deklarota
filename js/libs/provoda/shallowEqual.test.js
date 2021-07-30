import {test, expect} from '@jest/globals'
import shallowEqual from './shallowEqual'

test('shallowEqual', () => {
  expect(shallowEqual({}, {})).toBeTruthy()

  expect(shallowEqual({coco: 55}, {})).toBeFalsy()

  expect(shallowEqual({}, {coco: 55})).toBeFalsy()

  expect(shallowEqual({coco: null}, {})).toBeFalsy()

  expect(shallowEqual({}, {coco: null})).toBeFalsy()

  expect(shallowEqual({
     url_part: undefined,
     nav_title: null,
     bmp_show: undefined,
     mp_has_focus: undefined,
     mpl_attached: undefined,
     bmpl_attached: undefined,
     has_data_loader: null,
     main_list_loading: false,
     all_data_loaded: false
  },
  {
    url_part: undefined,
    nav_title: null,
    bmp_show: undefined,
    mp_has_focus: undefined,
    mpl_attached: undefined,
    bmpl_attached: undefined,
    has_data_loader: null,
    main_list_loading: false,
    all_data_loaded: false,
    title: undefined,
    url: undefined,
    wantedUrl: undefined
  })).toBeFalsy()

  expect(shallowEqual({
    url_part: undefined,
    nav_title: null,
    bmp_show: undefined,
    mp_has_focus: undefined,
    mpl_attached: undefined,
    bmpl_attached: undefined,
    has_data_loader: null,
    main_list_loading: false,
    all_data_loaded: false,
    title: undefined,
    url: undefined,
    wantedUrl: undefined
  }, {
    url_part: undefined,
    nav_title: null,
    bmp_show: undefined,
    mp_has_focus: undefined,
    mpl_attached: undefined,
    bmpl_attached: undefined,
    has_data_loader: null,
    main_list_loading: false,
    all_data_loaded: false
  })).toBeFalsy()
})
