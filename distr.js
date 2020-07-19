const { rollup } = require('rollup');
const amd = require('rollup-plugin-amd');
const lookup = require('module-lookup-amd');
const replace = require('rollup-plugin-replace')

const build = ({
  all = false,
  path = 'dist/esm'
}) => rollup({
    preserveModules: true,
    external: ['jquery', 'cash-dom'],
    input: [
      'js/libs/provoda/provoda.js',
      'js/libs/provoda/provoda/getAttr.js',
      'js/libs/provoda/provoda/updateAttr.js',
      'js/libs/provoda/provoda/updateManyAttrs.js',
      'js/libs/provoda/provoda/getRel.js',
      'js/libs/provoda/provoda/updateRel.js',
      'js/libs/provoda/structure/getUsageTree',
      'js/libs/provoda/structure/flatStruc',
      'js/libs/provoda/provoda/routePathByModels.js',
      'js/libs/provoda/provoda/LoadableList.js',
      'js/libs/provoda/provoda/CoreView',
      'js/libs/provoda/provoda/View',
      'js/libs/provoda/provoda/runtime/app/prepare',
      'js/libs/provoda/provoda/runtime/app/start',
      'js/libs/provoda/provoda/runtime/view/prepare',
      'js/libs/provoda/provoda/runtime/view/start',
      'js/libs/provoda/provoda/SyncReceiver',
      'js/libs/provoda/provoda/CallbacksFlow',
      'js/libs/provoda/provoda/getModelById',
      'js/libs/provoda/provoda/appRoot.js',
      'js/libs/provoda/provoda/dcl/addr.js',
      'js/libs/provoda/provoda/dcl/merge.js',
      'js/libs/provoda/provoda/dcl/attrs/input.js',
      'js/libs/FuncsQueue',
      'js/models/spyglasses/FakeSpyglassCore',

      'js/utils/init.js',
      'js/utils/initApp.js',

      'js/initBrowsing',
      'js/modules/route',
      'js/views/map_slice/MapSliceSpyglassCore',
      'js/views/map_slice/BrowseLevViewCore',
      'js/views/map_slice/getAncestorByRooViCon',
      'js/views/map_slice/getMapSliceView',

      'js/views/AppBaseView.js',
      'js/views/utils/loadImage.js',
    ].map(path => (__dirname + '/' + path)),

    plugins: [
      amd({
        rewire: function (moduleId, parentPath) { // Optional, Default: false
          const result = lookup({
            directory: __dirname,
            partial: moduleId,
            filename: parentPath,
            config: {
              paths: {
                // jquery: 'js/common-libs/jquery-2.1.4',
                angbo: 'js/libs/provoda/StatementsAngularParser.min',
                _updateAttr: 'js/libs/provoda/_internal/_updateAttr.js',
              },
              map: {
                '*': {
                  su: 'js/seesu',

                  pv: 'js/libs/provoda/provoda',
                  __lib: 'js/libs/provoda',
                  View: 'js/libs/provoda/View',
                  js: 'js',
                  spv: 'js/libs/spv',
                  app_serv: "js/app_serv",
                  localizer: 'js/libs/localizer',
                  view_serv: "js/views/modules/view_serv",
                  cache_ajax: 'js/libs/cache_ajax',
                  env: "js/env",

                  hex_md5: 'js/common-libs/md5',
                  'Promise': 'js/common-libs/Promise-3.1.0.mod'
                }
              },
            } // Or an object
          })
          return result;
        }
      }),
      replace({
        "process.versions": '({})',
        NODE_ENV: `'${process.env.NODE_ENV}'`,
      }),
    ]
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
