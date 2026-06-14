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

// 解析前端版本号：与后端一致，发布时只需打 git tag 即可生效。
// 优先级：环境变量 VERSION > 当前提交精确匹配的 tag > 最近 tag+短hash > package.json
function resolveAppVersion() {
  if (process.env.VERSION) {
    return process.env.VERSION;
  }
  const { execSync } = require("child_process");
  const run = (cmd) =>
    execSync(cmd, { stdio: ["ignore", "pipe", "ignore"] }).toString().trim();
  try {
    // 精确匹配当前提交的 tag（如 v3.0.5），与后端 `git describe --tags --exact-match` 对齐
    return run("git describe --tags --exact-match");
  } catch (e) {
    try {
      // 非 tag 提交：回退到最近 tag + 提交数 + 短 hash（如 v3.0.4-3-gabc1234）
      return run("git describe --tags --always");
    } catch (e2) {
      // 无 git 环境时兜底 package.json
      return require("./package.json").version;
    }
  }
}

// Vue CLI 会自动把以 VUE_APP_ 开头的环境变量注入到前端代码（process.env.VUE_APP_VERSION）
process.env.VUE_APP_VERSION = resolveAppVersion();

module.exports = {
  devServer: {
    proxy: {
      // 统一代理配置：/v1, /download, /public, /install
      "^/(v1|download|public|upload|install)": {
        target: process.env.VUE_APP_API_BASE_URL || "http://localhost:8088",
        changeOrigin: true,
      },
      // WebSocket 代理
      "/ws": {
        target: process.env.VUE_APP_API_BASE_URL || "http://localhost:8088",
        changeOrigin: true,
        ws: true,
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
      config.resolve = config.resolve || {};
      config.resolve.alias = {
        ...(config.resolve.alias || {}),
        "@antv/g2$": path.resolve(__dirname, "node_modules/@antv/g2/esm/index.js"),
        "@ant-design/icons/lib/dist$": path.resolve(__dirname, "src/icons/antd.js"),
      };
      config.optimization = {
        ...(config.optimization || {}),
        splitChunks: {
          chunks: "all",
          minSize: 20000,
          maxSize: 380 * 1024,
          maxAsyncRequests: 50,
          maxInitialRequests: 50,
          automaticNameDelimiter: "-",
          cacheGroups: {
            core: {
              name: "vendor-core",
              test: /[\\/]node_modules[\\/](vue|vue-router|vuex|vue-i18n|core-js|babel-polyfill|whatwg-fetch|regenerator-runtime|axios|moment)[\\/]/,
              priority: 60,
            },
            antd: {
              name: "vendor-antd",
              test: /[\\/]node_modules[\\/](@ant-design|ant-design-vue|async-validator|dom-scroll-into-view|resize-observer-polyfill|tinycolor2)[\\/]/,
              priority: 50,
            },
            charts: {
              name: "vendor-charts",
              test: /[\\/]node_modules[\\/](@antv[\\/]g2|@antv[\\/]g2-brush|@antv[\\/]g2-plugin-slider|viser|viser-vue|d3-format)[\\/]/,
              priority: 45,
            },
            echarts: {
              name: "vendor-echarts",
              test: /[\\/]node_modules[\\/](echarts|zrender|echarts-liquidfill)[\\/]/,
              priority: 40,
            },
            topology: {
              name: "vendor-topology",
              test: /[\\/]node_modules[\\/](@antv[\\/]x6|@antv[\\/]x6-vue-shape|jquery|jquery-mousewheel|mousetrap|insert-css)[\\/]/,
              priority: 35,
            },
            markdown: {
              name: "vendor-markdown",
              test: /[\\/]node_modules[\\/](highlight\.js|marked|dompurify)[\\/]/,
              priority: 30,
            },
            misc: {
              name: "vendor-misc",
              test: /[\\/]node_modules[\\/]/,
              priority: 10,
            },
          },
        },
      };
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
