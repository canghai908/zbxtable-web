import React, {useState, useEffect} from 'react';
import {message} from 'antd';

import {utils} from '@common';
const {storage} = utils;

import {emit} from '@app/utils';

import {UserOutlined, PoweroffOutlined} from '@ant-design/icons';

// import {title,themeList} from '@app/configs';

import {logoutFn} from '@app/api/api';

import HoriMenu from './horiMenu';

import './index.less';

const navDrop = (nameList) => [
  {
    name: nameList['profile'],
    icon: <UserOutlined />,
    path: '',
  },
  {
    name: nameList['logout'],
    icon: <PoweroffOutlined />,
    path: '/user/login',
  },
];

const langList = (nameList) => [
  {
    key: 'zh',
    name: nameList['zh'],
  },
  {
    key: 'en',
    name: nameList['en'],
  },
];

const Header = (props) => {
  const {collapseMenu, menu, user, theme, store} = props;
  const userInfo = user?.data ?? {};

  const langCfg = store?.getState('langCfg') ?? {};
  const {title, nav, language} = langCfg;

  const [showNav, setShowNav] = useState(false);
  const [showTheme, setShowTheme] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [selected, setSelected] = useState(theme);

  useEffect(() => {
    const navListeners = () => {
      setShowNav(false);
      const w = window.innerWidth;
      if (w < 1024) {
        collapseMenu(false);
        setShowMenu(false);
      }
    };
    const themeListeners = () => {
      setShowTheme(false);
    };
    window.addEventListener('click', navListeners, false);
    window.addEventListener('click', themeListeners, false);
    return () => {
      window.removeEventListener('click', navListeners, false);
      window.removeEventListener('click', themeListeners, false);
    };
  }, []);
  const toggleMenu = (e) => {
    e.stopPropagation();
    setShowMenu(!showMenu);
    collapseMenu();
  };
  const toggleNav = (e) => {
    e.stopPropagation();
    setShowNav(!showNav);
  };
  const handleNav = (item) => {
    console.log(item);
  };
  const switchTheme = (e) => {
    e.stopPropagation();
    setShowTheme(!showTheme);
  };
  const selectedTheme = (item) => {
    setSelected(item.key);
    // updateRouter({theme:item.key});
    props.switchTheme(item.key);
  };

  const handleNavClick = async (item) => {
    console.log(item);
    if (item.path === '/user/login') {
      const {message: msg} = await logoutFn();
      message.success(msg);
      storage.rm('token');
      props.router.push(item.path);
    }
  };

  const changeLang = (item) => {
    storage.set('language', item.key);
    emit.emit('change-language', item.key);
  };

  return (
    <div className="header">
      <div className="header-wrap">
        <div className="banner">
          {/* <div className="logo"><img src={logo} alt="logo" /></div> */}
          <div className="title">{title}</div>
        </div>
        <div className="nav">
          <ul className="nav-left">
            <li className="collapseMenu" onClick={(e) => toggleMenu(e)}>
              <a>
                {/* <i className="icon-navicon" /> */}
                <span className="anico">
                  <span className={`hline${showMenu ? ' right' : ''}`} />
                </span>
              </a>
            </li>
            {/* <li>
            <a onClick={e=>switchTheme(e)}>主题</a>
            <ul className={`huxy-arrow-lt${showTheme?' show':''}`}>
              {
                themeList.map(v=><li key={v.key}>
                  <a className={selected===v.key?'active':''} onClick={()=>selectedTheme(v)}>
                    <span>{v.name}</span>
                  </a>
                </li>)
              }
            </ul>
          </li> */}
            <li>
              <a onClick={(e) => switchTheme(e)}>{nav[language]}</a>
              <ul className={`huxy-arrow-lt${showTheme ? ' show' : ''}`}>
                {langList(nav).map((v) => (
                  <li key={v.key}>
                    <a className={language === v.key ? 'active' : ''} onClick={() => changeLang(v)}>
                      <span>{v.name}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </li>
            {/* menu.map(v=><li key={v.path}><Link to={v.path} className={v.active?'active':''}>
              {v.icon}
              <span className="menu-title">{v.name}</span>
            </Link></li>) */}
          </ul>
          {/* <HoriMenu menu={menu} /> */}
          <ul className="nav-right">
            <li>
              <a onClick={(e) => toggleNav(e)}>
                <div className="avatar">
                  <img className="usr" src={userInfo?.avatar} alt="user" />
                  <span>{userInfo?.username ?? 'admin'}</span>
                  <i className={`huxy-angle-${showNav ? 'top' : 'bt'}`} />
                </div>
              </a>
              <ul className={`huxy-arrow-rt${showNav ? ' show' : ''}`}>
                {navDrop(nav).map((v) => (
                  <li key={v.name}>
                    <a onClick={() => handleNavClick(v)} className={v.active ? 'active' : ''}>
                      {v.icon}
                      <span className="drop-label">{v.name}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Header;
