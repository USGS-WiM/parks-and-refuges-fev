var webpack = require("webpack");
var path = require('path');

var CleanWebpackPlugin = require('clean-webpack-plugin');
var CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
    entry: {
        main: [
            './app/main.ts' // entry point for your application code
        ],
        vendor: [
             "./app/libs.ts",
            
            // put your third party libs here
            "core-js",
            "reflect-metadata", // order is important here
            "rxjs",
            "zone.js",
            '@angular/core',
            "@angular/compiler",
            "@angular/http",
            "@angular/platform-browser",
            "@angular/platform-browser-dynamic",
            "@angular/router",
            "@angular/router-deprecated",
            "@angular/upgrade",
        ]
    },
    output: {
        filename: './dist/[name].bundle.js',
        publicPath: './'
    },
    resolve: {
        extensions: ['', '.webpack.js', '.web.js', '.ts', '.component.ts', '.service.ts', '.js', '.component.html', '.component.css', '.css']
    },
    module: {
        loaders: [
            {
                test: /\.ts$/,
                loader: 'ts-loader',
                exclude: ''
            },
            // css
            {
                test: /\.css$/,
                loader: "style-loader!css-loader"
            },
            {
                test: /\.html$/,
                loader: 'html'
            },
            { test: /\.(png|gif|jpg)$/, loader: "file?name=images/[name].[ext]" },
            // For font-awesome, created by Turbo87:
            // https://gist.github.com/Turbo87/e8e941e68308d3b40ef6
            { test: /\.woff(\?v=\d+\.\d+\.\d+)?$/, loader: "file?name=fonts/[name].[ext]" },
            { test: /\.woff2(\?v=\d+\.\d+\.\d+)?$/, loader: "file?name=fonts/[name].[ext]" },
            { test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/, loader: "file?name=fonts/[name].[ext]" },
            { test: /\.eot(\?v=\d+\.\d+\.\d+)?$/, loader: "file?name=fonts/[name].[ext]" },
            { test: /\.svg(\?v=\d+\.\d+\.\d+)?$/, loader: "file?name=fonts/[name].[ext]" }
        ],
        noParse: [ path.join(__dirname, 'node_modules', 'angular2', 'bundles') ]
    },
    plugins: [
        new webpack.optimize.CommonsChunkPlugin({
            name: 'vendor',
            minChunks: Infinity
        }),
        new CleanWebpackPlugin(['dist'], {}),
        new CopyWebpackPlugin([
            { from: './index.html', to: './dist/index.html' },
        ])
    ],
    devtool: 'source-map',
    debug: 'true',
    node: {
        fs: "empty"
    }
};