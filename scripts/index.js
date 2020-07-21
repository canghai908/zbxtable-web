const os=require('os');
const express=require('express');
const webpack=require('webpack');
const colors=require('colors');

const cors=require('cors');
const logger=require('morgan');
const bodyParser=require('body-parser');
const compression=require('compression');

const webpackDevMiddleware=require('webpack-dev-middleware');
const webpackHotMiddleware=require('webpack-hot-middleware');

const webpackConfig=require('./webpack.development');
const configs=require('../configs');
const appName=require('../configs/appName')||'app';
const {HOST,PORT,PROXY_URI}=configs(appName);

const getIPs=require('./getIPs');

// const request=require('request');

const {createProxyMiddleware}=require('http-proxy-middleware');

const app = express();

const compiler = webpack(webpackConfig);

const proxyCfg=require('./pro2Cfg');

const {prefix,opts}=proxyCfg(PROXY_URI);
app.use(prefix,createProxyMiddleware(opts));

const devMiddleware=webpackDevMiddleware(compiler,{
  contentBase:webpackConfig.output.path,
  publicPath:webpackConfig.output.publicPath,
  hot:true,
  inline:true,
  // http2: true,
  // https: true,
  // open: true,
  // open: 'Google Chrome',
  // socket: 'socket',
  historyApiFallback:true,
  compress:true, 
  noInfo:true,
  stats:{
    colors:true,
  },
});

app.use(webpackHotMiddleware(compiler));
app.use(devMiddleware);

app.set('host', HOST);
app.set('port', PORT);

app.use(cors());
app.use(logger('dev'));
app.use(bodyParser.json({limit:'20mb'}));
app.use(bodyParser.urlencoded({limit:'20mb',extended:true}));

app.use(compression());

if(app.get('env')==='production'){
  app.use(function(req,res,next) {
    const protocol=req.get('x-forwarded-proto');
    protocol==='https'?next():res.redirect('https://'+req.hostname+req.url);
  });
}

// browserRouter
app.get('*',(req,res)=>{
  const htmlBuffer=devMiddleware.fileSystem.readFileSync(`${webpackConfig.output.path}/index.html`);
  res.send(htmlBuffer.toString());
});

const server=app.listen(app.get('port'),(err)=>{
  if (err) {
    console.log(err);
    return false;
  }
  console.log('\n'+appName.magenta+': 服务已启动! '.black+'✓'.green);
  console.log(`\n监听端口: ${app.get('port')} ,正在构建,请稍后...`.cyan);
  console.log('-----------------------------------'.grey);
  // console.log(` 本地地址: http://${app.get('host')}:${app.get('port')}`.magenta);
  console.log(`运行地址: \n`.magenta);
  console.log(`${getIPs(os.networkInterfaces(),app.get('port'))} \n`.magenta);
  console.log(`如需打包部署到生产环境，请运行 `.black+`npm run build`.cyan);
  console.log('-----------------------------------'.grey);
  console.log('\n按下 CTRL-C 停止服务\n'.blue);
});

app.get('test',(req,res)=>{
  return res.send({id:'test'});
});

app.get('/users/test1',(req,res)=>{
  console.log(req.originalUrl);
  res.send({users:'huy'});
});









