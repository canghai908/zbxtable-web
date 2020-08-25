const webpack = require('webpack');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const ModuleFederationPlugin = require('webpack/lib/container/ModuleFederationPlugin');

const configs=require('../configs');
const appName=require('../configs/appName');
const {PUBLIC_DIR,BUILD_DIR,DEV_ROOT_DIR}=configs(appName);

// const appName=configs.APP_NAME;
const publics=path.resolve(__dirname,PUBLIC_DIR);
const app=path.resolve(__dirname,`../${appName}`);

const entry={
  app:[path.resolve(app,'index.js')],
  react:['react','react-dom'],
};
const templ=path.resolve(publics,'index.html');
const icon=path.resolve(publics,'favicon.ico');

const htmlPlugin=()=>new HtmlWebpackPlugin({
  title:appName,
  template:templ,
  favicon:icon,
  inject:true,
  minify:{
    html5:true,
    collapseWhitespace:true,
    // conservativeCollapse:true,
    removeScriptTypeAttributes:true,
    removeStyleLinkTypeAttributes:true,
    removeComments:true,
    removeTagWhitespace:true,
    removeEmptyAttributes:true,
    removeRedundantAttributes:true,
    useShortDoctype:true,
    keepClosingSlash:true,
    minifyJS:true,
    minifyCSS:true,
    minifyURLs:true,
  },
});

const plugins=[
  htmlPlugin(),
  new webpack.LoaderOptionsPlugin({
    minimize: false,
  }),
  /* new webpack.optimize.LimitChunkCountPlugin({
    maxChunks: 5,
  }), */
  new webpack.optimize.MinChunkSizePlugin({
    minChunkSize: 30000,
  }),
  new webpack.optimize.ModuleConcatenationPlugin(),
  // new BundleAnalyzerPlugin(),
  /* new ModuleFederationPlugin({
    name:'demo1',
    library:{ type:'var',name:'app_a'},
    filename:'remoteEntry.js',
    remotes:{
      app_one:'app_one',
      app_three:'app_three',
    },
    exposes:{
      Demo:'../demo',
    },
    shared:['react','react-dom'],
  }), */
];

const rules=[
  {
    test:/\.(js|jsx|mjs)$/,
    loader:'babel-loader',
    exclude:[/node_modules/,path.resolve(__dirname,'node')],
  },{
    test:/\.tsx?$/,
    use:[
      {loader:'babel-loader'},
      {loader:'ts-loader'},
    ],
    exclude:[/node_modules/],
  },{
    test: /\.html$/,
    use: {
      loader: 'html-loader',
      options: {
        minimize:true,
      },
    },
    include:[app],
  },{
    test:/\.(jpe?g|png|gif|psd|bmp|ico|webp|svg)/i,
    loader:'url-loader',
    options:{
      limit:20480,
      name:'img/img_[hash:8].[ext]',
      // publicPath:'../',
    },
    exclude:[/node_modules/],
  },{
    test:/\.(ttf|eot|svg|woff|woff2|otf)/,
    loader:'url-loader',
    options:{
      limit:20480,
      name:'fonts/[hash:8].[ext]',
      publicPath:'../',
    },
    exclude:[/images/],
  },{
    test:/\.(pdf)/,
    loader:'url-loader',
    options:{
      limit:20480,
      name:'pdf/[hash].[ext]',
    },
  },{
    test:/\.(swf|xap|mp4|webm)/,
    loader:'url-loader',
    options:{
      limit:20480,
      name:'video/[hash].[ext]',
    },
  },
];

module.exports={
  context:app,
  /* cache: {
    type: 'filesystem',
    buildDependencies: {
      config: [ __filename ],
    },
  }, */
  experiments: {
    asset: true,
  },
  entry:entry,
  output:{
    path:path.resolve(app,BUILD_DIR),
    publicPath:DEV_ROOT_DIR,
    filename:'js/[name]_[hash:8].js',
    chunkFilename:'js/[name]_[chunkhash:8].chunk.js',
    // assetModuleFilename: 'assets/[hash][ext]',
    // library:`${appName}App`,
    // libraryTarget:'umd',
  },
  optimization:{
    minimize:true,
    concatenateModules:true,

    usedExports: true,
    sideEffects: true,

    splitChunks:{
      chunks:'all',//'async','initial'
      // minSize:0,
      minSize:{
        javascript:8000,
        style:8000,
      },
      /* maxSize:{
        javascript:1000000,
        style:1000000,
      }, */
      minChunks:2,
      maxInitialRequests:10,
      maxAsyncRequests:10,
      // automaticNameDelimiter: '~',
      cacheGroups:{
        commons:{
          // chunks:'initial',
          // minSize:30000,
          idHint:'commons',
          test:app,
          priority: 5,
          reuseExistingChunk:true,
        },
        defaultVendors:{
          // chunks:'initial',
          idHint:'vendors',
          test:/[\\/]node_modules[\\/]/,
          enforce:true,
          priority:10,
        },
        react:{
          idHint:'react',
          test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
          enforce:true,
          priority:15,
        },
        echarts: {
          idHint:'echarts',
          chunks:'all',
          priority:20,
          test: function(module){
            const context = module.context;
            return context && (context.indexOf('echarts') >= 0 || context.indexOf('zrender') >= 0);
          },
        },
      },
    },
    // runtimeChunk:true,
    moduleIds:'deterministic',
    chunkIds:'named',
  },
  externals:{
    // react:'react',
  },
  resolve:{
    modules:[
      app,
      'node_modules',
    ],
    alias:{
      '@app':app,
      '@common':path.resolve(__dirname, '../common'),
      '@layout':path.resolve(__dirname, '../common/layout'),
      '@utils':path.resolve(app, 'utils'),
    },
    extensions:['.js','.mjs','.cjs','.jsx','.ts','.tsx','.json','.css','.less','.vue','.vuex'],
  },
  module:{
    rules:rules,
  },
  plugins:plugins,
};


