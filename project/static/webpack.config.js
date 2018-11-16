const webpack = require('webpack');
const config = {
  "mode": "development",
  "entry":  __dirname + '/js/index.jsx',
  "output": {
      "path": __dirname + '/dist',
      "filename": 'bundle.js',
  },
  "module": {
      "rules": [
          {
              "test": /\.(js|jsx)$/,
              "exclude": /node_modules/,
              "use": {
                  "loader": "babel-loader",
                  "options": {
                      "presets": [
                        "@babel/preset-react",
                        "@babel/env"
                      ]
                  }
              }
          },
          {
              "test": /\.css$/,
              "use": [
                  "style-loader",
                  "css-loader"
              ]
          }
      ]
  },
  resolve: {
    extensions: ['.wasm', '.mjs', '.js', '.json','.jsx']
  }
};

module.exports = config;