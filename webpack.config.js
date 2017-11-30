const path = require('path');
module.exports = {
  entry: './index.js',
  output: {
    filename: 'bundle.js'
    // publicPath: "/aniknafs.github.io/"
  },
  module: {
    loaders: [
      { 
        test: /\.js$/, 
        loader: 'babel-loader', 
        options: {
          presets: ['@babel/preset-env']
        },
        exclude: /node_modules/ 
      },
      { 
        test: /\.jsx$/, 
        loader: 'babel-loader', 
        exclude: /node_modules/ 
      }
    ]
  }
}