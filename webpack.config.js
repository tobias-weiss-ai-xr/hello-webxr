module.exports = {
  mode: 'development',
  entry: './src/index.js',
  output: {
    filename: 'bundle.js',
    path: __dirname
  },
  devServer: {
    host: '0.0.0.0',
    port: 8080,
    compress: true,
    hot: true,
    contentBase: __dirname,
    publicPath: '/',
    historyApiFallback: true
  },
  devtool: 'source-map',
  module: {
    rules: [
    {
      test: /\.(js|mjs)$/,
      exclude: /(node_modules)/,
      use: { loader: 'babel-loader' }
    }
  ]
  },
  watchOptions: {
    ignored: [/node_modules/]
  }
};
