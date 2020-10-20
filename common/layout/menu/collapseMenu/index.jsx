import React,{useState,useEffect,useRef} from 'react';

import {use} from '@common';
const {useEleResize}=use;

import {Link} from '@common';

import './index.less';

const render=data=>{
  return data.map(v=>{
    const hasChildren=v.children&&v.children.length;
    const active=v.active?'active':'';
    if(hasChildren){
      return <li key={v.name} has-children="true">
        <Link to={v.path} className={active} preventDefault>
          {typeof v.icon==='string'?<i className={v.icon} />:(v.icon||null)}
          <span className="has-right-icon">{v.name}</span>
          <i />
        </Link>
        <ul>{render(v.children)}</ul>
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

const CollapseMenu=props=>{
  const {menu}=props;
  const menuRef=useRef();
  const {width}=useEleResize(menuRef.current);
  useEffect(()=>{
    const info=menuRef.current.getBoundingClientRect();
  },[]);

  console.log(width,menuRef);

  return <div className="collapse-menu" ref={menuRef}>
    <ul className="tree-root">
      {render(menu)}
    </ul>
  </div>;
};

export default CollapseMenu;





















