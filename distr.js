const { rollup } = require('rollup')
const replace = require('rollup-plugin-replace')
const pathm = require('path')
const esbuild = require('rollup-plugin-esbuild')

const build = ({
  all = false,
  path = 'dist/esm'
}) => rollup({
  preserveModules: true,
  external: ['cash-dom'],
  input: [
    'js/libs/provoda/provoda/model.js',
    'js/libs/provoda/provoda/getAttr.js',
    'js/libs/provoda/provoda/updateAttr.js',
    'js/libs/provoda/provoda/updateManyAttrs.js',
    'js/libs/provoda/provoda/getRel.js',
    'js/libs/provoda/provoda/updateRel.js',
    'js/libs/provoda/structure/getUsageTree',
    'js/libs/provoda/structure/flatStruc',
    'js/libs/provoda/provoda/routePathByModels.js',
    'js/libs/provoda/provoda/LoadableList.js',
    'js/libs/provoda/provoda/view/CoreView',
    'js/libs/provoda/provoda/view/View',
    'js/libs/provoda/provoda/runtime/app/prepare',
    'js/libs/provoda/provoda/runtime/app/start',
    'js/libs/provoda/provoda/runtime/app/reinit',
    'js/libs/provoda/provoda/runtime/view/prepare',
    'js/libs/provoda/provoda/runtime/view/start',
    'js/libs/provoda/provoda/SyncReceiver',
    'js/libs/provoda/provoda/getModelById',
    'js/libs/provoda/provoda/appRoot.js',
    'js/libs/provoda/provoda/dcl/addr.ts',
    'js/libs/provoda/provoda/dcl/merge.js',
    'js/libs/provoda/provoda/dcl/attrs/input.js',
    'js/libs/FuncsQueue',
    'js/models/spyglasses/FakeSpyglassCore',
    'js/models/Router',

    'js/utils/init.js',
    'js/utils/initApp.js',

    'js/initBrowsing',
    'js/modules/route',
    'js/views/map_slice/MapSliceSpyglassCore',
    'js/views/map_slice/BrowseLevViewCore',
    'js/views/map_slice/getAncestorByRooViCon',
    'js/views/map_slice/getMapSliceView',

    'js/views/AppBaseView.js',

    'js/views/modules/WPBox',
    'js/views/utils/arrowsKeysNav',
  ].map(path => (__dirname + '/' + path)),

  plugins: [
    process.env.MEMORY_SLICER && (function() {
      const babel = require('@rollup/plugin-babel').default

      return babel({
        babelHelpers: 'bundled',
        include: ['*/js/libs/**/**', '*/js/views/**/**'],
        'plugins': [pathm.join(__dirname, './node_modules/babel-plugin-memory-consumers-slicer')],
      })
    })(),
    replace({
      'process.versions': '({})',
      NODE_ENV: `'${process.env.NODE_ENV}'`,
    }),
    esbuild({ target: 'es2020' }),
  ].filter(Boolean)
})
  .then(async bundle => {
    await Promise.all([
      bundle.write({
        dir: path,
        format: 'esm',
        name: 'library',
        globals: {
          'cash-dom': '$'
        },
        // sourcemap: true
      }),
      // all && bundle.write({
      //   dir: 'dist/cjs', // use umd?
      //   format: 'cjs',
      //   name: 'library',
      //   output: {
      //     globals: {
      //       jquery: '$'
      //     },
      //   },
      //   // sourcemap: true
      // })
    ])
  })
  .catch(e => {
    console.error(e)
    throw e
  })

module.exports = build
