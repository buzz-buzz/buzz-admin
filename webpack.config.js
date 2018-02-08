var path = require('path');

module.exports = {
    entry: './public/js/main.js',
    output: {
        path: path.resolve(__dirname, 'public/js'),
        filename: 'bundle.js'
    },
    devtool: 'eval-source-map',
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
    }
};
