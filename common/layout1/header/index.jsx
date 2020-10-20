import React,{useState,useEffect} from 'react';
import {message} from 'antd';

import {utils} from '@common';
const {storage}=utils;

import { UserOutlined, PoweroffOutlined } from '@ant-design/icons';

import {Link} from '@common';

import {title,themeList} from '@app/configs';

import {logoutFn} from '@app/api/api';

import './index.less';

const navDrop=[
  {
    name:'个人中心',
    icon:<UserOutlined />,
    path:'',
  },
  {
    name:'退出',
    icon:<PoweroffOutlined />,
    path:'/user/login',
  },
];

const Header=props=>{
  const {collapseMenu,menu,user,theme}=props;
  const userInfo=user?.data??{};
  const [showNav,setShowNav]=useState(false);
  const [showTheme,setShowTheme]=useState(false);
  const [showMenu,setShowMenu]=useState(false);
  const [selected,setSelected]=useState(theme);
  useEffect(()=>{
    const navListeners=()=>{
      setShowNav(false);
      const w=window.innerWidth;
      if(w<1024){
        collapseMenu(false);
        setShowMenu(false);
      }
    };
    const themeListeners=()=>{
      setShowTheme(false);
    };
    window.addEventListener('click',navListeners,false);
    window.addEventListener('click',themeListeners,false);
    return ()=>{
      window.removeEventListener('click',navListeners,false);
      window.removeEventListener('click',themeListeners,false);
    };
  },[]);
  const toggleMenu=e=>{
    e.stopPropagation();
    setShowMenu(!showMenu);
    collapseMenu();
  };
  const toggleNav=e=>{
    e.stopPropagation();
    setShowNav(!showNav);
  };
  const handleNav=item=>{
    console.log(item);
  };
  const switchTheme=e=>{
    e.stopPropagation();
    setShowTheme(!showTheme);
  };
  const selectedTheme=item=>{
    setSelected(item.key);
    // updateRouter({theme:item.key});
    props.switchTheme(item.key);
  };

  const handleNavClick=async item=>{
    console.log(item);
    if(item.path==='/user/login'){
      const {message:msg}=await logoutFn();
      message.success(msg);
      storage.rm('token');
      props.router.push(item.path);
    }
  };

  return <div className="header">
    <div className="header-wrap">
      <div className="banner">
        {/* <div className="logo"><img src={logo} alt="logo" /></div> */}
        <div className="title">{title}</div>
      </div>
      <div className="nav">
        <ul className="nav-left">
          <li className="collapseMenu" onClick={e=>toggleMenu(e)}>
            <a>
              {/* <i className="icon-navicon" /> */}
              <span className="anico">
                <span className={`hline${showMenu?' right':''}`} />
              </span>
            </a>
          </li>
          <li>
            <a onClick={e=>switchTheme(e)}>主题</a>
            <ul className={`lt ${showTheme?'show':''}`}>
              {
                themeList.map(v=><li key={v.key}>
                  <a className={selected===v.key?'active':''} onClick={()=>selectedTheme(v)}>
                    <span>{v.name}</span>
                  </a>
                </li>)
              }
            </ul>
          </li>
          {
            menu.map(v=><li key={v.path}><Link to={v.path} className={v.active?'active':''}>
              {v.icon}
              <span className="menu-title">{v.name}</span>
            </Link></li>)
          }
        </ul>
        <ul className="nav-right">
          <li>
            <a onClick={e=>toggleNav(e)}>
              <div className="avatar">
                <img className="usr" src={userInfo?.avatar} alt="user" />
                <span>{userInfo?.username}</span>
                <i className={`huxy-angle ${showNav?'top':'bottom'}`}/>
              </div>
            </a>
            <ul className={`rt ${showNav?'show':''}`}>
              {
                navDrop.map(v=><li key={v.name}>
                  <a onClick={()=>handleNavClick(v)}>
                    {v.icon}
                    <span className="menu-title">{v.name}</span>
                  </a>
                </li>)
              }
            </ul>
          </li>
        </ul>
      </div>
    </div>
  </div>;
};

export default Header;



































