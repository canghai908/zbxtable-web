import React from 'react';
import { DesktopOutlined,ContainerOutlined,DatabaseOutlined, HomeOutlined,AreaChartOutlined,LineChartOutlined,CloudServerOutlined,CloudDownloadOutlined,FileExcelOutlined,AlertOutlined,FundProjectionScreenOutlined,BellOutlined,FundOutlined,SettingOutlined,ToolOutlined} from '@ant-design/icons';

import {utils} from '@common';
const {storage}=utils;
import {getInfo,getIndex,getTrigger} from '@app/api/api';

const subMenu=()=>{

};

const routers=nameList=>[
  {
    path:'/',
    redirect:'/dashboard',
    component:()=>import('@common/layout'),
    resolve:{
      user:()=>getInfo({token:storage.get('token')}),
    },
    /* resolve:{
      user:params=>getInfo({token:storage.get('token')}).then(res=>{
        const {code,data}=res;
        if(code===200){
          storage.set('userifo',data);
        }
        return res;
      }),
    }, */
    getMenus:true,
    frameTheme:'dark',
    children:[
      {
        path:'/dashboard',
        name:nameList['/dashboard'],
        icon:<HomeOutlined />,
        component:()=>import('../views/dashboard'),
        /* resolve:{
          index:getIndex,
          trigger:getTrigger,
        }, */
      },
      {
        path:'/srcManage',
        redirect:'/srcManage/host',
        name:nameList['/srcManage'],
        icon:<CloudServerOutlined />,
        children:[
          {
            path:'/host',
            name:nameList['/host'],
            icon:<DesktopOutlined />,
            component:()=>import('../views/srcManage'),
          },
          {
            path:'/groups',
            name:nameList['/groups'],
            icon:<DatabaseOutlined />,
            component:()=>import('../views/srcManage/groups'),
          },
          {
            path:'/templates',
            name:nameList['/templates'],
            icon:<ContainerOutlined />,
            component:()=>import('../views/srcManage/templates'),
          },
          {
            path:'/graph',
            name:nameList['/graph'],
            icon:<AreaChartOutlined />,
            component:()=>import('../views/srcManage/graph'),
          },
        ],
      },
      {
        path:'/report',
        redirect:'/report/export',
        name:nameList['/report'],
        icon:<LineChartOutlined />,
        children:[
          {
            path:'/export',
            name:nameList['/export'],
            icon:<CloudDownloadOutlined />,
            component:()=>import('../views/report'),
          },
          {
            path:'/inspect',
            name:nameList['/inspect'],
            icon:<FileExcelOutlined />,
            component:()=>import('../views/report/inspect'),
          },
          {
            path:'/batch',
            name:nameList['/batch'],
            hideMenu:true,
            icon:<FundProjectionScreenOutlined />,
            component:()=>import('../views/report/batch'),
          },
        ],
      },
      {
        path:'/alarm',
        redirect:'/alarm/analysis',
        name:nameList['/alarm'],
        icon:<AlertOutlined />,
        children:[
          {
            path:'/analysis',
            name:nameList['/analysis'],
            icon:<FundOutlined />,
            component:()=>import('../views/alarm'),
          },
          {
            path:'/query',
            name:nameList['/query'],
            icon:<BellOutlined />,
            component:()=>import('../views/alarm/query'),
          },
        ],
      },
      {
        path:'/system',
        redirect:'/system/license',
        name:nameList['/system'],
        icon:<SettingOutlined />,
        children:[
          /* {
            path:'/license',
            name:nameList['/license'],
            icon:<AlertOutlined />,
            component:()=>import('../views/system'),
          }, */
          {
            path:'/chpwd',
            name:nameList['/chpwd'],
            icon:<ToolOutlined />,
            component:()=>import('../views/system/chpwd'),
          },
        ],
      },
    ],
  },
  {
    path:'/user',
    children:[
      {
        path:'/login',
        name:nameList['/login'],
        component:()=>import('../views/user'),
      },
      /* {
        path:'/signup',
        name:nameList['/signup'],
        component:()=><h1>注册</h1>,
      }, */
    ],
  },
  {
    path:'/404',
    name:nameList['/404'],
    component:()=><div>404</div>,
    hideMenu:true,
  },
];

export default routers;





















