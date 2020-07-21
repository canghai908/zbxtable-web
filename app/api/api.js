import fetcher,{dlApi} from './fetcher';
import apis from './pro2';

const {
  dashboard:{login,info,index,trigger,logout},
  host:{host,host_groups,template,list,subList,target,graph,graph1,expGraph},
  report:{history,trend,inspect},
  alarm:{alarm,expAlarm,analysis},
  system:{license,chpwd},
}=apis;

export const loginFn=data=>fetcher({...login,data});

export const getInfo=data=>fetcher({...info,data});

export const getIndex=params=>fetcher({...index,params});

export const getTrigger=params=>fetcher({...trigger,params});

export const logoutFn=data=>fetcher({...logout,data});

export const getHost=params=>fetcher({...host,params});

export const getHostGroups=params=>fetcher({...host_groups,params});

export const getTemplate=params=>fetcher({...template,params});

export const getList=params=>fetcher({...list,params});

export const getSubList=params=>{
  const {id,...rest}=params||{};
  return fetcher({...subList(id),params:rest});
};

export const exportGraph=data=>dlApi({...expGraph,data});

export const listTarget=data=>fetcher({...target,data});

export const listGraph=data=>fetcher({...graph,data});

export const listGraph1=data=>fetcher({...graph1(data.hostid),data});

export const exportHistory=data=>dlApi({...history,data});

export const exportTrend=data=>dlApi({...trend,data});

export const exportInspect=data=>dlApi({...inspect,data});

export const getAlarm=params=>fetcher({...alarm,params});

export const exportAlarm=data=>dlApi({...expAlarm,data});

export const listAnalysis=data=>fetcher({...analysis,data});

export const getLicense=params=>fetcher({...license,params});

export const chpwdFn=data=>fetcher({...chpwd,data});







