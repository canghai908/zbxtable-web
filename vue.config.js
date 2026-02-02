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
        target: process.env.VUE_APP_API_BASE_URL || "http://localhost:8085",
        changeOrigin: true,
      },
      "/download": {
        // 报表下载
        target: process.env.VUE_APP_API_BASE_URL || "http://localhost:8085",
        changeOrigin: true,
      },
      "/pb/ws": {
        // 公开 WebSocket 代理（必须在 /public 之前，更具体的路径优先匹配）
        target: process.env.VUE_APP_API_BASE_URL || "http://localhost:8085",
        changeOrigin: true,
        ws: true, // 开启 WebSocket 代理
        logLevel: 'debug', // 添加调试日志
        // WebSocket 特定配置
        onProxyReqWs: (proxyReq, req, socket, options, head) => {
          console.log('[WS Proxy] Proxying WebSocket request to:', options.target);
        },
        onError: (err, req, res) => {
          console.error('[WS Proxy] Error:', err.message);
        },
      },
      "/public": {
        // 公开 API 代理
        target: "http://localhost:8085",
        changeOrigin: true,
      },
      "/install": {
        // 安装相关 API 代理到后端
        target: process.env.VUE_APP_API_BASE_URL || "http://localhost:8085",
        changeOrigin: true,
      },
      "/ws": {
        // 认证 WebSocket 代理
        target: process.env.VUE_APP_API_BASE_URL || "http://localhost:8085",
        changeOrigin: true, //是否允许跨域
        ws: true, //开启ws, 如果是http代理此处可以不用设置
        logLevel: 'debug', // 添加调试日志
        // WebSocket 特定配置
        onProxyReqWs: (proxyReq, req, socket, options, head) => {
          console.log('[WS Proxy] Proxying WebSocket request to:', options.target);
        },
        onError: (err, req, res) => {
          console.error('[WS Proxy] Error:', err.message);
        },
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
