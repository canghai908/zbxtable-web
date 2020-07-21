const express = require('express');
const path=require('path');
const colors=require('colors');
const cors=require('cors');
const logger=require('morgan');
const bodyParser=require('body-parser');
const compression=require('compression');

const app = express();

const configs=require('../configs');
const appName=require('../configs/appName')||'app';
const {HOST,PRO_PORT,PROXY_URI,BUILD_DIR}=configs(appName);

const {createProxyMiddleware}=require('http-proxy-middleware');

const proxyCfg=require('./pro2Cfg');

const {prefix,opts}=proxyCfg(PROXY_URI);
app.use(prefix,createProxyMiddleware(opts));

app.set('host',HOST);
app.set('port',PRO_PORT);

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

const build=path.resolve(appName,BUILD_DIR);
app.use(express.static(build));

app.get('*',function(request,response){
  response.sendFile(path.resolve(build,'index.html'));
});

const server=app.listen(app.get('port'),(err)=>{
  if (err) {
    console.log(err);
    return false;
  }
  console.log('\n服务已启动! '.black+'✓'.green);
  console.log(`\n监听端口: ${app.get('port')} ,正在构建,请稍后...`.cyan);
  console.log('-----------------------------------'.grey);
  console.log(` 本地地址: http://${app.get('host')}:${app.get('port')}`.magenta);
  console.log('-----------------------------------'.grey);
  console.log('\n按下 CTRL-C 停止服务\n'.blue);
});


