var webpack = require("webpack");

module.exports = {
	entry: './src/ops.js',
	output: {
		filename: './lib/loot-ops.min.js',
		library: 'ops',
		libraryTarget: 'var'
	},
	externals: {
		"lodash": "_"
	},
	plugins: [
		new webpack.optimize.DedupePlugin(),
		new webpack.optimize.OccurenceOrderPlugin(),
		new webpack.optimize.UglifyJsPlugin()
	]
};