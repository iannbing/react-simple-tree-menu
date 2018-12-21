const webpack = require('webpack');
const path = require('path');
const merge = require('webpack-merge');
const common = require('./webpack.common.js');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

process.env.NODE_ENV = 'production';

module.exports = merge(common, {
  mode: 'production',
  plugins: [new webpack.optimize.ModuleConcatenationPlugin(), new BundleAnalyzerPlugin()],
});
