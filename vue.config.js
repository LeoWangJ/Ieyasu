const { defineConfig } = require('@vue/cli-service')
const webpack = require('webpack')
const { VantResolver } = require('unplugin-vue-components/resolvers')
const ComponentsPlugin = require('unplugin-vue-components/webpack')

module.exports = defineConfig({
  transpileDependencies: true,
  publicPath: '.',
  pluginOptions: {
    windicss: {
      // see https://github.com/windicss/vite-plugin-windicss/blob/main/packages/plugin-utils/src/options.ts
    }
  },
  configureWebpack: {
    plugins: [
      new webpack.ProvidePlugin({
        Buffer: ['buffer', 'Buffer'],
        process: 'process/browser'
      }),
      ComponentsPlugin({
        resolvers: [VantResolver()]
      })
    ],
    resolve: {
      fallback: {
        assert: false,
        buffer: require.resolve('buffer'),
        stream: require.resolve('stream-browserify'),
        crypto: require.resolve('crypto-browserify'),
        http: require.resolve('stream-http'),
        https: require.resolve('https-browserify'),
        url: require.resolve('url/'),
        os: require.resolve('os-browserify/browser')
      }
    }
  }
})
