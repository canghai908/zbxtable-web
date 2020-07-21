import React,{useState,useEffect} from 'react';

import Header from '../header';
// import Topbar from '../topbar';
import Footer from '../footer';
import Main from '../main';

import {utils} from '@common';
const {storage}=utils;

import './index.less';

// const renderCurrentMenu=menu=>menu.find(v=>v.open)?.children??[];

const horizonMenu=menu=>menu.filter(v=>v.name).map(v=>{
  const {children,...firstLevel}=v;
  return firstLevel;
});

const Frame=props=>{

  const {menu}=props;

  const [showMenu,setShowMenu]=useState(false);

  const [theme,setTheme]=useState(prev=>{
    const theme=storage.get('theme')||'dark';
    return theme;
  });

  const switchTheme=theme=>{
    storage.set('theme',theme);
    setTheme(theme);
  };

  const collapseMenu=show=>show===false?setShowMenu(show):setShowMenu(state=>!state);

  const showMenuCls=showMenu?' showMenu':'';

  return <div className={`frame ${theme}`}>
    <header className="frame-header">
      {/* <Topbar menu={horizonMenu(menu[0].children||[])} user={user} /> */}
      <Header {...props} menu={horizonMenu(menu||[])} collapseMenu={collapseMenu} theme={theme} switchTheme={switchTheme} />
    </header>
    <main className="frame-main">
      <Main {...props} showMenu={showMenuCls} menu={menu[0].children||[]} />
    </main>
    <footer className={`frame-footer${showMenuCls}`}>
      <Footer />
    </footer>
  </div>;
};


export default Frame;



































