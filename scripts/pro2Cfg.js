const proxyCfg=url=>({
  prefix:'/v1',
  opts:{
    target: url,
    changeOrigin: true,
    // pathRewrite: {'^/v1':'/v1'},
  },
});

module.exports=proxyCfg;







