import {message} from 'antd';
import {utils} from '@common';
const {fetcher,storage}=utils;

import logout from './logout';

const handler=response=>response.json().then(result=>{
  const {data,message:msg,code}=result;
  if(code===50014){
    message.error(msg);
    logout();
    return;
  }
  if(code!=200){
    throw {message:msg};
  }
  return result;
}).catch(error=>{
  message.error(error.message);
  throw error;
});

const dlHandler=response=>{
  if(response.status!==200){
    message.error(response.statusText);
    throw {message:response.statusText};
  }
  const disposition=response.headers.get('Content-Disposition');
  // const filename=decodeURIComponent(disposition.split(';')[1].split('=')[1]);
  const fileInfo=decodeURIComponent(disposition);
  return response.blob().then(result=>{
    /* const {data,message:msg,code}=result;
    if(code===50014){
      message.error(msg);
      logout();
      return;
    }
    if(code!=200){
      throw {message:msg};
    } */
    return {result,fileInfo};
  }).catch(error=>{
    message.error(error);
    throw error;
  });
};

const fetchApi=fetcher(handler);

const dlFile=fetcher(dlHandler);


const getToken=()=>({'X-Token':storage.get('token')});

const target='/v1';

const fetch=({method,url,...opt})=>fetchApi(method)(`${target}${url}`,{...opt,headers:getToken()});

export const dlApi=({method,url,...opt})=>dlFile(method)(`${target}${url}`,{...opt,headers:getToken()});


export default fetch;



