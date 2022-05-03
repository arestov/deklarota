const path = require('path')

module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        targets: {
          node: 'current',
        },
      },
    ],
  ],
  plugins: [
    ["module-resolver", {
      root: __dirname,
      alias: {
        spv: path.join(__dirname, 'js/libs/spv.js'),
        pv: path.join(__dirname, 'js/libs/provoda/provoda'),
        dkt: path.join(__dirname, 'js/libs/provoda/provoda'),
        'dkt-all': path.join(__dirname, 'js'),
      }
    }]
  ],
  env: {
    development: {
      sourceMaps: "inline"
    }
  }
}
