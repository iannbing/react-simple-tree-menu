const path = require('path');
const CleanWebpackPlugin = require('clean-webpack-plugin');

module.exports = {
  mode: 'none',
  entry: './src/index.tsx',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'main.js',
    library: 'react-simple-tree-menu',
    libraryTarget: 'umd',
    publicPath: '/dist/',
    umdNamedDefine: false,
  },
  module: {
    rules: [
      {
        test: /\.(t|j)sx?$/,
        loader: 'awesome-typescript-loader',
        exclude: path.resolve(__dirname, 'node_modules/'),
        options: {
          silent: true,
          configFileName: './tsconfig.json',
          useBabel: true,
          babelCore: '@babel/core',
        },
      },
      { enforce: 'pre', test: /\.js$/, loader: 'source-map-loader' },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.svg$/,
        loader: 'svg-inline-loader',
      },
      {
        test: /\.(jpe?g|png|gif|ico)$/i,
        loader: 'file?name=[name].[ext]',
      },
    ],
  },
  resolve: {
    modules: ['node_modules'],
    extensions: ['*', '.ts', '.tsx', '.js', '.jsx'],
    alias: {
      react: path.resolve(__dirname, './node_modules/react'),
      'react-dom': path.resolve(__dirname, './node_modules/react-dom'),
      assets: path.resolve(__dirname, 'assets'),
    },
  },
  plugins: [new CleanWebpackPlugin(['dist'])],
  externals: ['react', 'react-dom'],
};
