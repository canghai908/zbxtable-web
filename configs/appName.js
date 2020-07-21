const getName=()=>{
  let appName='app';
  try{
    const original=JSON.parse(process.env.npm_config_argv).original;
    const dirname='--dirname=';
    const argv=original.find(v=>v.includes(dirname));
    if(argv){
      appName=argv.split(dirname)[1];
    }
  }catch(err){
    console.log(err);
    // appName='app';
  }
  return appName;
};

module.exports=getName();
