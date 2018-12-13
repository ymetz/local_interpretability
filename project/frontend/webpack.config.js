const webpack = require('webpack');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

const config = {
    "mode": "development",
    "entry":  __dirname + '/src/index.jsx',
    "output": {
        "path": __dirname + '/public/dist',
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
                    MiniCssExtractPlugin.loader,
                    'css-loader?importLoader=1&modules&localIdentName=[path]___[name]__[local]___[hash:base64:5]'
                ]
            }
        ]
    },
    resolve: {
        extensions: ['.wasm', '.mjs', '.js', '.json','.jsx']
    },
    "plugins": [new MiniCssExtractPlugin({filename: "bundle.css"})]
};

module.exports = config;