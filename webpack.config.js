const path = require('path')
const webpack = require('webpack')

let config = {}

if (process.env.NODE_ENV === 'production') {
  config = {
    devtool: 'source-map',
    entry: [
      './example/src'
    ],
    output: {
      path: path.join(__dirname, 'dist', 'static'),
      filename: 'bundle.js',
      publicPath: '/static/'
    },
    plugins: [
      new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify('production')
      }),
      new webpack.UglifyJsPlugin({
        sourceMap: true,
        minimize: true,
        compress: { warnings: false },
        comments: false
      })
    ]
  }
}

module.exports = Object.assign({}, {
  devtool: 'eval',
  entry: [
    'webpack-hot-middleware/client',
    './example/src'
  ],
  output: {
    path: path.join(__dirname, 'dist', 'static'),
    filename: 'bundle.js',
    publicPath: '/static/'
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoEmitOnErrorsPlugin()
  ],
  resolve: {
    alias: {
      'react-atv-img': path.join(__dirname, 'src/components/AtvImg.js')
    },
    extensions: ['.js']
  },
  module: {
    rules: [{
      test: /\.js$/,
      use: ['babel-loader'],
      exclude: /node_modules/
    }]
  }
}, config)
