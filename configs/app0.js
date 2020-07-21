const app={
  HOST:process.env.IP||'localhost',
  PORT:process.env.PORT||9500,
  PRO_PORT:process.env.PRO_PORT||9501,
  BUILD_DIR:'build',
  DIST:'../dist',
  PUBLIC_DIR:'../public',
  DEV_ROOT_DIR:'/',
  PRD_ROOT_DIR:'/',
  DEFAULT_TOKEN:'Basic 123456',
  // PROXY_URI:'http://192.168.100.150:8010',
  // PROXY_URI:'http://localhost:9000',
  PROXY_URI:'http://172.24.9.62:8093',
  // PRO2_PROXY_URI:'https://zbx.cactifans.com',
  SALT:'123',
  TOKEN_SECRET:'123',
  mongoUrl:'mongodb://localhost:27017/dataUI',
  serverUrl:'http://localhost:9500',
  mongoPort:9500,
};

module.exports=app;
