let path = require("path");
const webpack = require("webpack");
const ThemeColorReplacer = require("webpack-theme-color-replacer");
const { getThemeColors, modifyVars } = require("./src/utils/themeUtil");
const { resolveCss } = require("./src/utils/theme-color-replacer-extend");
const CompressionWebpackPlugin = require("compression-webpack-plugin");

const productionGzipExtensions = ["js", "css"];
const isProd = process.env.NODE_ENV === "production";

const assetsCDN = {
  css: [],
};

const version = new Date();
module.exports = {
  chainWebpack(config) {
    config.plugin("define").tap((args) => {
      args[0]["process.env"].version = JSON.stringify(version);
      return args;
    });
  },
};
module.exports = {
  devServer: {
    proxy: {
      "/v1": {
        //此处要与 /services/api.js 中的 API_PROXY_PREFIX 值保持一致
        target: process.env.VUE_APP_API_BASE_URL,
        changeOrigin: true,
      },
      "/ws": {
        target: process.env.VUE_APP_WS_BASE_URL,
        changeOrigin: true, //是否允许跨域
        ws: true, //开启ws, 如果是http代理此处可以不用设置
      },
    },
  },
  pluginOptions: {
    "style-resources-loader": {
      preProcessor: "less",
      patterns: [path.resolve(__dirname, "./src/theme/theme.less")],
    },
  },
  configureWebpack: (config) => {
    config.entry.app = ["babel-polyfill", "whatwg-fetch", "./src/main.js"];
    config.performance = {
      hints: false,
    };
    config.plugins.push(
      new ThemeColorReplacer({
        fileName: "css/theme-colors-[contenthash:8].css",
        matchColors: getThemeColors(),
        injectCss: true,
        resolveCss,
      })
    );
    // Ignore all locale files of moment.js
    config.plugins.push(new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/));
    // 生产环境下将资源压缩成gzip格式
    if (isProd) {
      // add `CompressionWebpack` plugin to webpack plugins
      config.plugins.push(
        new CompressionWebpackPlugin({
          algorithm: "gzip",
          test: new RegExp("\\.(" + productionGzipExtensions.join("|") + ")$"),
          threshold: 10240,
          minRatio: 0.8,
        })
      );
    }
    // if prod, add externals
    if (isProd) {
      config.externals = assetsCDN.externals;
    }
  },
  chainWebpack: (config) => {
    // 生产环境下关闭css压缩的 colormin 项，因为此项优化与主题色替换功能冲突
    if (isProd) {
      config.plugin("optimize-css").tap((args) => {
        args[0].cssnanoOptions.preset[1].colormin = false;
        return args;
      });
    }
    // 生产环境下使用CDN
    if (isProd) {
      config.plugin("html").tap((args) => {
        args[0].cdn = assetsCDN;
        return args;
      });
    }
  },
  css: {
    loaderOptions: {
      less: {
        lessOptions: {
          modifyVars: modifyVars(),
          javascriptEnabled: true,
        },
      },
    },
  },
  publicPath: "./",
  outputDir: "web",
  assetsDir: "static",
  lintOnSave: false,
  productionSourceMap: false,
};
