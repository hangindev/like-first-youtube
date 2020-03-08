const path = require("path");

module.exports = {
  mode: 'production',
  context: path.resolve(__dirname, 'src'),
  entry: {
    content: './content.js',
    options: './options.js'
  }
}