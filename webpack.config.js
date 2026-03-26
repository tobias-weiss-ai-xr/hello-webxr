const path = require('path');

module.exports = {
  mode: 'development',
  entry: './src/index.js',
  output: {
    filename: 'bundle.js',
    path: __dirname
  },
  devServer: {
    host: '0.0.0.0',
    port: 3000,
    compress: true,
    hot: true,
    static: {
      directory: __dirname
    },
    historyApiFallback: true
  },
  devtool: 'cheap-module-source-map',
  module: {
    rules: [
      {
        test: /\.(js|mjs)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader'
        }
      }
    ]
  },
  watchOptions: {
    ignored: ['**/node_modules/**']
  },
  resolve: {
    extensions: ['.js', '.mjs']
  }
};
