import React from 'react';

const {useState,useEffect,useRef}=React;

import {Link} from '@common';

import './index.less';

const RenderChild=({open,children})=>{
  const ul=useRef();
  useEffect(()=>{
    const el=ul.current;
    const height=open?el.scrollHeight:0;
    el.style.setProperty('--ul-max-height',height+'px');
  },[open]);
  return <ul ref={ul} className={open}>{children}</ul>;
};

const render=(menu,toggle)=>{
  return menu.map(v=>{
    const hasChildren=v.children&&v.children.length;
    const active=v.active?'active':'';
    if(hasChildren){
      const open=v.open?'open':'';
      return <li key={v.name} onClick={e=>toggle(e,v)} has-children="true">
        <Link to={v.path} className={active} preventDefault>
          {typeof v.icon==='string'?<i className={v.icon} />:(v.icon||null)}
          <span className="has-right-icon">{v.name}</span>
          <i className={`huxy-angle ${open?'top':'bottom'}`} />
        </Link>
        <RenderChild open={open}>{render(v.children,toggle)}</RenderChild>
      </li>;
    }
    return <li key={v.name}>
      <Link to={v.path} stopPropagation className={active}>
        {typeof v.icon==='string'?<i className={v.icon} />:(v.icon||null)}
        <span>{v.name}</span>
      </Link>
    </li>;
  });
};

const Menu=props=>{
  const [menu,setMenu]=useState(props.menu);
  useEffect(()=>{
    setMenu(props.menu);
  },[props]);
  const toggle=(e,v)=>{
    e.stopPropagation();
    v.open=!v.open;
    setMenu([...menu]);
  };

  /* const setHeight=(e,v)=>{
    const el=e.currentTarget;
    const {height}=el.firstChild.getBoundingClientRect();
    const {scrollHeight}=el;
    v.height=v.open?`${scrollHeight}px`:`${height}px`;
    el.style.setProperty('--max-height',scrollHeight+'px');
  }; */

  return <div className="menu">
    <ul className="tree-root">
      {render(menu,toggle)}
    </ul>
  </div>;
};

export default Menu;





















