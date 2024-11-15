import path from 'path';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import CssMinimizerPlugin from 'css-minimizer-webpack-plugin';

export default function (env, argv) {
    const devMode = argv.mode === 'development';

    return {
        entry: './src/index.js',
        output: {
            filename: '[name].[contenthash].js',
            path: path.resolve('./dist'),
            clean: true
        },
        devtool: devMode ? 'eval-source-map' : false,
        devServer: {
            hot: false
        },
        plugins: [
            new HtmlWebpackPlugin({
                title: 'Weather App',
                template: 'src/template.html',
                favicon: 'src/assets/images/favicon.ico'
            }),
            new MiniCssExtractPlugin({
                filename: 'assets/css/[name].[contenthash].css'
            })
        ],
        module: {
            rules: [
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
                },
                {
                    test: /\.js$/,
                    exclude: /node_modules/,
                    use: {
                        loader: 'babel-loader',
                        options: {
                            targets: '> 0.25%, not dead',
                            presets: [['@babel/preset-env']],
                            cacheDirectory: true
                        }
                    }
                }
            ]
        },
        optimization: {
            minimizer: ['...', new CssMinimizerPlugin()]
        },
        performance: {
            maxAssetSize: 500000
        }
    };
}
