const path = require('path');
const merge = require('webpack-merge');
const common = require('./webpack.common.js');

process.env.NODE_ENV = 'development';

module.exports = merge(common, {
  mode: 'development',
  module: {},
});
