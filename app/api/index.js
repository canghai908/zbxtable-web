import React from 'react';
import { UserOutlined, PoweroffOutlined } from '@ant-design/icons';
import fetcher from './fetcher';

import {utils} from '@common';
const {sleep,wrapPromise}=utils;

import avatar from '@app/assets/images/user.gif';

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

const user={
  id:'0',
  name:'bigdata',
  age:18,
  role:5,
  email:'bigdata@gmail.com',
  addr:'wuhan',
  avatar:avatar,
  nav:navDrop,
};

export const fetchUserInfo=async (params)=>{
  await sleep();
  return {
    code:200,
    msg:'success',
    data:user,
  };
};

const sysUrl='/api/system';

export const login=data=>wrapPromise(fetcher.post(`${sysUrl}/oauth/token`,{data}));

export const getUserInfo=()=>wrapPromise(fetcher.get(`${sysUrl}/oauth/token`));

export const getUserDetail=id=>wrapPromise(fetcher.get(`${sysUrl}/system/user/${id}/info`));





