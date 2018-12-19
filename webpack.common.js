const path = require('path');
const CleanWebpackPlugin = require('clean-webpack-plugin');

const dest = path.resolve(__dirname, 'dist');

module.exports = {
  mode: 'none',
  entry: './src/index.tsx',
  output: {
    path: dest,
    filename: 'main.js',
    publicPath: '/'
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
          babelCore: '@babel/core'
        }
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      },
      {
        test: /\.svg$/,
        loader: 'svg-inline-loader'
      },
      {
        test: /\.(jpe?g|png|gif|ico)$/i,
        loader: 'file?name=[name].[ext]'
      }
    ]
  },
  resolve: {
    modules: ['node_modules'],
    extensions: ['*', '.ts', '.tsx', '.js', '.jsx']
  },
  plugins: [new CleanWebpackPlugin(['dist'])],
  externals: {
    react: 'React',
    'react-dom': 'ReactDOM'
  }
};
