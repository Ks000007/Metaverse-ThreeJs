const path = require('path')

module.exports = {
    // entry: './src/client/client.ts',
    entry: {
        scene: './src/client/main.js',
        scene2: './src/client/yoga.js',
        ashtanga: './src/client/ashtanga.js',
        resorative: './src/client/resorative.js',
        kundalini: './src/client/kundalini.js',
        vrScene: './src/client/vryoga.js',

    },
    // entry: './src/client/yoga.js',
    // entry: './src/client/raycast.js',
    module: {
        rules: [{
            test: /\.tsx?$/,
            use: 'ts-loader',
            exclude: /node_modules/,
        }, ],
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
    },
    output: {
        filename: '[name].bundle.js',
        path: path.resolve(__dirname, '../../dist/client'),
    },
}