import React,{useEffect,useCallback,useRef} from 'react';
import {getLicense} from '@app/api/api';
import {use} from '@common';
const {useAsync}=use;

import './index.less';

const lists={
  machineid:'本机机器码',
  appname:'授权应用',
  phone:'授权用户',
  endtime:'授权到期时间',
};

const Index=props=>{
  const [list,updateList]=useAsync({});
  const update=useCallback(params=>updateList({license:getLicense(params)}),[]);
  useEffect(()=>{
    update();
  },[]);
  const {items={}}=list.license?.data??{};
  return <div className="sys-license">
    <div className="board-card" style={{width:'50%'}}>
      <div className="card-title">
        <div className="title-left"><h4 style={{margin:0}}>授权信息</h4></div>
        <div className="title-right"><a onClick={()=>update()}>刷新</a></div>
      </div>
      <div className="card-body">
        <div className="board-list">
          {
            Object.keys(lists).map(v=><div className="board-item">
              <div className="item-left">{lists[v]}</div>
              <div className="item-right">{items[v]}</div>
            </div>)
          }
        </div>
      </div>
    </div>
  </div>;
};

export default Index;

















