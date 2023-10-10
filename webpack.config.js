const common = {
  entry: './src/index.ts',
  mode: 'production',
  output: {
    filename: 'yarn-bound.min.js',
    library: {
      name: 'YarnBound',
      type: 'umd'
    },
    globalObject: 'this'
  },
  module: {
    rules: [{
      test: /\.ts$/,
      exclude: /node_modules\/(?!@mnbroatch).+/,
      use: {
        loader: 'ts-loader',
        options: {
          transpileOnly: true
        }
      }
    }]
  },
  resolve: {
    extensions: ['.ts', '.js']
  }
}

module.exports = [
  common,
  {
    ...common,
    output: {
      ...common.output,
      filename: 'yarn-bound.js'
    },
    optimization: {
      ...common.optimization,
      minimize: false
    }
  },
  {
    ...common,
    target: ['web', 'es5'],
    output: {
      ...common.output,
      filename: 'yarn-bound.ie.js'
    },
    module: {
      rules: [{
        test: /\.ts$/,
        exclude: /node_modules\/(?!@mnbroatch).+/,
        use: {
          loader: 'ts-loader',
          options: {
            transpileOnly: true
          }
        }
      }]
    },
    resolve: {
      extensions: ['.ts', '.js']
    }
  }
]
