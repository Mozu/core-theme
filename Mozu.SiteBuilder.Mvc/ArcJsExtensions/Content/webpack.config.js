const path = require('path');
//const nodeExternals = require('webpack-node-externals');

module.exports = {
    mode: 'development',
    entry: './pipeline',
    output: {
        libraryTarget: 'commonjs2',
        path: path.resolve(__dirname, 'dist'),
        filename: 'webpack.bundle.js'
    },

    target: 'async-node',
    optimization: {
        minimize: false
    }
};

