import React,{useState,useEffect} from 'react';

import {title} from '@app/configs';

import {Link} from '@common';

import logo from '@app/assets/images/logo.png';

import './index.less';

const platform=[
  {
    path:'',
    target:'',
    name:'风险预警',
  },
  {
    path:'http://172.24.10.21:9006/',
    target:'_blank',
    name:'综合分析',
  },
  {
    path:'',
    target:'',
    name:'监管效能评估',
  },
];

const Topbar=props=>{
  /* const userInfo=props.user?.data??{};
  const [showNav,setShowNav]=useState(false);
  useEffect(()=>{
    const navListeners=()=>{
      setShowNav(false);
    };
    window.addEventListener('click',navListeners,false);
    return ()=>{
      window.removeEventListener('click',navListeners,false);
    };
  },[]);
  const toggleNav=e=>{
    e.stopPropagation();
    setShowNav(!showNav);
  };
  const handleNav=item=>{
    console.log(item);
  }; */

  return <div className="frame-top-bar">
    <div className="top-bar-wrap">
      <div className="topbar-banner">
        <div className="topbar-logo"><img src={logo} alt="logo" /></div>
        <div className="topbar-title">{title}</div>
      </div>
      <div className="topbar-nav">
        {/* <div className="topbar-nav-left"></div> */}
        <div className="topbar-nav-right">
          <div className="topbar-right-top">
            <ul>
              <li><Link path={`/user/login`}>登录</Link></li>
              <li><Link path={`/user/login`}>注册</Link></li>
            </ul>
          </div>
          <div className="topbar-right-bottom">
            <ul>
              {
                platform.map(v=><li key={v.name}><a href={v.path} target={v.target}>{v.name}</a></li>)
              }
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>;
};

export default Topbar;



































