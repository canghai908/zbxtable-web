const getIPs=(interfaces,port)=>{
  // const port=app.get('port');
  // const interfaces=os.networkInterfaces();
  const lo0=interfaces.lo0||[];
  const en0=interfaces.en0||[];
  const localIp=lo0.filter(i=>i.family==='IPv4').map(v=>`http://${v.address}:${port}`);
  const serverIp=en0.filter(i=>i.family==='IPv4').map(v=>`http://${v.address}:${port}`);
  const ips=[...localIp,...serverIp].join('\n');
  return ips;
};

module.exports=getIPs;

