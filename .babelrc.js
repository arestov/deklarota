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
      }
    }]
  ],
  env: {
    development: {
      sourceMaps: "inline"
    }
  }
}
