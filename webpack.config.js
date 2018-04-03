var path = require('path');
var webpack = require('webpack');

const config = {
    entry: './public/js/main.js',
    output: {
        path: path.resolve(__dirname, 'public/js'),
        filename: 'bundle.js'
    },
    // devtool: 'eval-source-map',
    resolve: {
        extensions: ['.js', '.jsx']
    },
    module: {
        loaders: [{
            test: /\.jsx?$/,
            loader: 'babel-loader',
            query: {
                presets: ["@babel/preset-env", "@babel/preset-react"]
            }
        }]
    },
    plugins: [
        new webpack.NoEmitOnErrorsPlugin(),
        new webpack.DefinePlugin({'process.env.NODE_ENV': '"production"'}),
        new webpack.optimize.OccurrenceOrderPlugin(),
        new webpack.HotModuleReplacementPlugin(),
    ]
};

if (process.env.NODE_ENV === 'production') {
  config.plugins.push(new webpack.optimize.UglifyJsPlugin({
      compress: {
          screw_ie8: true,
          warnings: false
      },
      mangle: {
          screw_ie8: true
      },
      output: {
          comments: false,
          screw_ie8: true
      }
  }))
}

module.exports = config
