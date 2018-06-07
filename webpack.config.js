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
            options: {
                presets: ["@babel/preset-env", "@babel/preset-react"],
                plugins: [
                    'transform-class-properties'
                ]
            }
        }],
        // noParse: /jquery|lodash/,
    },
    plugins: [
        // new webpack.DefinePlugin({
        //     'process.env.NODE_ENV': JSON.stringify('development')
        // }),

        // new webpack.NoEmitOnErrorsPlugin(),
        // new webpack.DefinePlugin({'process.env.NODE_ENV': '"production"'}),
        // new webpack.optimize.OccurrenceOrderPlugin(),
        // new webpack.HotModuleReplacementPlugin(),
    ],
    performance: {
        hints: false,
    },
    externals: {
        React: 'react'
    }
};

if (process.env.NODE_ENV === 'production') {
    config.plugins.push(new webpack.NoEmitOnErrorsPlugin())
    config.plugins.push(new webpack.DefinePlugin({'process.env.NODE_ENV': '"production"'}))
    config.plugins.push(new webpack.optimize.OccurrenceOrderPlugin())
    config.plugins.push(new webpack.HotModuleReplacementPlugin())

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
} else {
    config.plugins.push(new webpack.DefinePlugin({'process.env.NODE_ENV': '"development"'}))
}

module.exports = config
