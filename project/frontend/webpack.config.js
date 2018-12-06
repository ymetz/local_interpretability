const webpack = require('webpack');
const config = {
  "mode": "development",
  "entry":  __dirname + '/src/index.jsx',
  "output": {
      "path": __dirname + '/public/dist',
      "filename": 'bundle.js',
  },
  "optimization": {
    "splitChunks": {
      "cacheGroups": {
        "styles": {
          "name": 'styles',
          "test": /\.css$/,
          "chunks": 'all',
          "enforce": true
        }
      }
    }
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
            test: /\.css$/,
            use: ['style-loader', 'css-loader'],
          }
      ]
  },
  resolve: {
    extensions: ['.wasm', '.mjs', '.js', '.json','.jsx']
  }
};

module.exports = config;