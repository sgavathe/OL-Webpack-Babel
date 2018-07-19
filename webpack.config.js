const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
const HtmlPlugin = require('html-webpack-plugin');
const webpack = require('webpack');

module.exports = {
  entry: './main.js',
  output: {
    path: path.resolve(__dirname, 'build'),
    filename: 'app.bundle.js'
  },
  devtool: 'source-map',
  devServer: {
    port: 3000,
    clientLogLevel: 'none',
    stats: 'errors-only'
  },
  // module: {
  //   rules: [
  //     {
  //       test: /\.css$/,
  //       use: ['babel-loader','style-loader', 'css-loader']

  //     }
  //   ]
  // //   loaders: [
  // //     {
  // //         test: /\.css$/,
  // //         loader: 'babel-loader',
  // //         query: {
  // //             presets: ['es2015']
  // //         }
  // //     }
  // // ]

  // },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          {loader: 'style-loader'},
          {loader: 'css-loader'}
        ]
      },
      {
        test: /\.js$/,
        //exclude: /(node_modules.(?!ol\/))/,
        use: {
          loader: 'babel-loader',
          options: {
            babelrc: false,
            presets: ['env'],
            sourceMaps: true
          }
        }
      }
    ]
  },
  plugins: [
    new CopyPlugin([{from: 'data', to: 'data'}]),
    new HtmlPlugin({
      template: 'index.html'
    }),
    new webpack.ProvidePlugin({
      jQuery: 'jquery',
      $: 'jquery',
      jquery: 'jquery'
    }) 
  ]
};
