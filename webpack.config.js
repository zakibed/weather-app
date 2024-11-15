const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');

const devMode = process.env.NODE_ENV !== 'production';

module.exports = {
    entry: './src/index.js',
    output: {
        filename: '[name].[contenthash].js',
        path: path.resolve(__dirname, 'dist'),
        clean: true
    },
    devtool: devMode ? 'eval-source-map' : false,
    devServer: {
        hot: false
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: [
                            ['@babel/preset-env', { targets: 'defaults' }]
                        ]
                    }
                }
            },
            {
                test: /\.css$/i,
                use: [
                    devMode ? 'style-loader' : MiniCssExtractPlugin.loader,
                    'css-loader'
                ]
            },
            {
                test: /\.(woff|woff2|eot|ttf|svg)$/i,
                type: 'asset/resource',
                generator: {
                    filename: 'assets/webfonts/[name].[hash][ext][query]'
                }
            }
        ]
    },
    plugins: [
        new HtmlWebpackPlugin({
            title: 'Weather App',
            template: 'src/template.html',
            favicon: 'src/assets/images/favicon.ico'
        })
    ].concat(
        devMode
            ? []
            : [
                  new MiniCssExtractPlugin({
                      filename: 'assets/css/[name].[contenthash].css'
                  })
              ]
    ),
    optimization: {
        minimizer: ['...', new CssMinimizerPlugin()]
    },
    performance: {
        maxAssetSize: 500000
    }
};
