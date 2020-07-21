const app0=require('./app0');
const app=require('./app');
const cfg={
  app0,
  app,
};

const configs=(name='app')=>cfg[name];

module.exports=configs;
