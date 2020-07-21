import React from 'react';
import { DesktopOutlined,ContainerOutlined,DatabaseOutlined, HomeOutlined,AreaChartOutlined,LineChartOutlined,CloudServerOutlined,CloudDownloadOutlined,FileExcelOutlined,AlertOutlined,FundProjectionScreenOutlined,BellOutlined,FundOutlined,SettingOutlined,ToolOutlined} from '@ant-design/icons';

import {utils} from '@common';
const {storage}=utils;
import {getInfo,getIndex,getTrigger} from '@app/api/api';

const subMenu=()=>{

};

const routers=[
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
        name:'首页',
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
        name:'资源管理',
        icon:<CloudServerOutlined />,
        children:[
          {
            path:'/host',
            name:'主机',
            icon:<DesktopOutlined />,
            component:()=>import('../views/srcManage'),
          },
          {
            path:'/groups',
            name:'主机组',
            icon:<DatabaseOutlined />,
            component:()=>import('../views/srcManage/groups'),
          },
          {
            path:'/templates',
            name:'模版',
            icon:<ContainerOutlined />,
            component:()=>import('../views/srcManage/templates'),
          },
          {
            path:'/graph',
            name:'图形管理',
            icon:<AreaChartOutlined />,
            component:()=>import('../views/srcManage/graph'),
          },
        ],
      },
      {
        path:'/report',
        redirect:'/report/export',
        name:'指标报表',
        icon:<LineChartOutlined />,
        children:[
          {
            path:'/export',
            name:'指标导出',
            icon:<CloudDownloadOutlined />,
            component:()=>import('../views/report'),
          },
          {
            path:'/inspect',
            name:'巡检报告',
            icon:<FileExcelOutlined />,
            component:()=>import('../views/report/inspect'),
          },
          {
            path:'/batch',
            name:'批量导出',
            hideMenu:true,
            icon:<FundProjectionScreenOutlined />,
            component:()=>import('../views/report/batch'),
          },
        ],
      },
      {
        path:'/alarm',
        redirect:'/alarm/analysis',
        name:'告警报表',
        icon:<AlertOutlined />,
        children:[
          {
            path:'/analysis',
            name:'告警分析',
            icon:<FundOutlined />,
            component:()=>import('../views/alarm'),
          },
          {
            path:'/query',
            name:'告警查询',
            icon:<BellOutlined />,
            component:()=>import('../views/alarm/query'),
          },
        ],
      },
      {
        path:'/system',
        redirect:'/system/license',
        name:'系统管理',
        icon:<SettingOutlined />,
        children:[
          /* {
            path:'/license',
            name:'授权信息',
            icon:<AlertOutlined />,
            component:()=>import('../views/system'),
          }, */
          {
            path:'/chpwd',
            name:'修改密码',
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
        title:'登录',
        component:()=>import('../views/user'),
      },
      /* {
        path:'/signup',
        title:'注册',
        component:()=><h1>注册</h1>,
      }, */
    ],
  },
  {
    path:'/404',
    name:'404',
    component:()=><div>404</div>,
    hideMenu:true,
  },
];

export default routers;





















