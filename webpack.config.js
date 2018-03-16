const webpack = require('webpack');
const path = require('path');

const UglifyJSPlugin = require('uglifyjs-webpack-plugin');

const ExtractTextPlugin = require('extract-text-webpack-plugin');

const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
	entry: './src/extension',

	output: {
		library: "bulmaCalendar",
		filename: 'bulmacalendar.bundle.js',
		path: path.resolve(__dirname, 'dist'),
		libraryTarget: "umd",
	},

	module: {
		rules: [
			{
				test: /\.js$/,
				exclude: /node_modules/,
				loader: 'babel-loader',

				options: {
					presets: ['env']
				}
			},
			{
				test: /\.(scss|css|sass)$/,

				use: ExtractTextPlugin.extract({
					use: [
						{
							loader: 'css-loader',
							options: {
								sourceMap: true
							}
						},
						{
							loader: 'sass-loader',
							options: {
								sourceMap: true
							}
						}
					],
					fallback: 'style-loader'
				})
			}
		]
	},

	plugins: [
		//new UglifyJSPlugin(),
		new ExtractTextPlugin('bulma-calendar.css'),
		new HtmlWebpackPlugin({template: './src/demotemplate.html', inject: 'head'})
	]
};
