import React from 'react';

const {useState,useEffect,useRef}=React;

import {Link,utils,use} from '@common';

const {getSelected,uuidv4}=utils;

const {useWinResize}=use;

import './index.less';

const ulStyles={
  overflow:'hidden',
  maxHeight:'var(--ul-max-height)',
  transition:'max-height .3s',
};

const RenderChild=({item,children})=>{
  const {open,uuid}=item;
  const ul=useRef();
  const isInit=useRef(true);
  useEffect(()=>{
    const el=ul.current;
    if(isInit.current){
      const el=ul.current;
      const height=open?`${el.scrollHeight}px`:'0px';
      // el.style.transition='none';
      el.style.setProperty('--ul-max-height',height);
      isInit.current=false;
    }else{
      const initH=open?'0px':`${el.scrollHeight}px`;
      el.style.setProperty('--ul-max-height',initH);
      setTimeout(()=>{
        const height=open?`${el.scrollHeight}px`:'0px';
        // el.style.transition='';
        el.style.setProperty('--ul-max-height',height);
      },5);
    }
  },[open]);
  useEffect(()=>{
    if(uuid){
      const el=ul.current;
      el.style.setProperty('--ul-max-height','none');
    }
  },[uuid]);
  return <ul ref={ul} style={ulStyles}>{children}</ul>;
};

const render=(data,toggle)=>{
  return data.map(v=>{
    const hasChildren=v.children&&v.children.length;
    const active=v.active?'active':'';
    if(hasChildren){
      return <li key={v.name} onClick={e=>toggle(e,v)} has-children="true" className={v.open?'open':''}>
        <Link to={v.path} className={active} preventDefault>
          {typeof v.icon==='string'?<i className={v.icon} />:(v.icon||null)}
          <span className="txt has-right-icon">{v.name}</span>
          <i className="coll-ico" />
        </Link>
        <RenderChild item={v}>{render(v.children,toggle)}</RenderChild>
      </li>;
    }
    return <li key={v.name}>
      <Link to={v.path} stopPropagation className={active}>
        {typeof v.icon==='string'?<i className={v.icon} />:(v.icon||null)}
        <span className="txt">{v.name}</span>
      </Link>
    </li>;
  });
};

const renderCollapsed=data=>{
  return data.map(v=>{
    const hasChildren=v.children&&v.children.length;
    const active=v.active?'active':'';
    if(hasChildren){
      return <li key={v.name} has-children="true">
        <Link to={v.path} className={active} preventDefault>
          {typeof v.icon==='string'?<i className={v.icon} />:(v.icon||null)}
          <span className="txt has-right-icon">{v.name}</span>
          <i className="coll-ico" />
        </Link>
        <ul>{renderCollapsed(v.children)}</ul>
      </li>;
    }
    return <li key={v.name}>
      <Link to={v.path} stopPropagation className={active}>
        {typeof v.icon==='string'?<i className={v.icon} />:(v.icon||null)}
        <span className="txt">{v.name}</span>
      </Link>
    </li>;
  });
};

const Menu=props=>{
  const {menu,collapsed}=props;
  const {width}=useWinResize();
  const [data,setData]=useState(menu);
  useEffect(()=>{
    setData(menu);
  },[menu]);
  const toggle=(e,v)=>{
    e.stopPropagation();
    v.open=!v.open;
    const selecteds=getSelected(data,v.path,'path');
    const psel=selecteds.slice(0,-1);
    psel.map(item=>item.uuid=uuidv4());
    setData([...data]);
  };

  return <div className="menu">
    <ul className="tree-root">
      {(collapsed&&width>1024)?renderCollapsed(data):render(data,toggle)}
    </ul>
  </div>;
};

export default Menu;





















