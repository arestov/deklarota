const path = require('path')

module.exports = {
  presets: ["@babel/preset-env"],
  plugins: [
    ["module-resolver", {
      root: __dirname,
      alias: {
        spv: path.join(__dirname, 'js/libs/spv.js'),
        pv: path.join(__dirname, 'js/libs/provoda/provoda'),
      }
    }],
    process.env.MEMORY_SLICER && 'babel-plugin-memory-consumers-slicer'
  ].filter(Boolean),
  env: {
    development: {
      sourceMaps: "inline"
    }
  }
}
