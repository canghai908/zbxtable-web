import React,{useEffect,useCallback,useRef,useState} from 'react';
import { Button, Table, Tooltip, message,Row,Col,Tabs,Badge,Menu,Dropdown } from 'antd';
import { CloudServerOutlined,BarChartOutlined,BugOutlined,AlertOutlined,RedoOutlined } from '@ant-design/icons';
import {use,utils,components} from '@common';
const {useAsync}=use;
const {formatTime,formatNum}=utils;
const {TabHeader}=components;

import {getIndex,getTrigger} from '@app/api/api';

import './index.less';

const fm=num=>typeof num==='number'?num.toLocaleString('en-US'):'';

const cardList=[
  {
    key:'hosts',
    label:'主机',
    icon:<CloudServerOutlined style={{color:'#73d13d'}} />,
    color:'#73d13d',
  },
  {
    key:'items',
    label:'指标',
    icon:<BarChartOutlined style={{color:'#40a9ff'}} />,
    color:'#40a9ff',
  },
  {
    key:'problems',
    label:'触发器',
    icon:<BugOutlined style={{color:'#ffc53d'}} />,
    color:'#ffc53d',
  },
  {
    key:'triggers',
    label:'问题',
    icon:<AlertOutlined style={{color:'#fa541c'}} />,
    color:'#fa541c',
  },
];

const level=[
  {
    value:'0',
    label:'全部',
  },
  {
    value:'1',
    label:'信息',
  },
  {
    value:'2',
    label:'警告',
  },
  {
    value:'3',
    label:'一般',
  },
  {
    value:'4',
    label:'严重',
  },
  {
    value:'5',
    label:'灾难',
  },
];

const columns=(page,handleItemEdit,handleItemDel)=>[
  {
    title: '序号',
    dataIndex: 'dataIndex',
    width: 10,
    ellipsis: true,
    render: (text,row,index)=>{
      const {current,size}=page;
      const i=size*(current-1)+index+1;
      return i;
    },
  },
  {
    title: '发生时间',
    dataIndex: 'lastchange',
    width: 40,
    ellipsis: true,
    render:(text,row,index)=>{
      const t=formatTime(new Date(text*1000-0));
      return <Tooltip title={t}>{t}</Tooltip>;
    },
  },
  {
    title: '告警主机',
    dataIndex: 'name',
    width: 40,
    ellipsis: true,
    render:(text,row,index)=><Tooltip title={text}>{text}</Tooltip>,
  },
  {
    title: '告警信息',
    dataIndex: 'lasteventname',
    width: 70,
    ellipsis: true,
    render:(text,row,index)=><Tooltip title={text}>{text}</Tooltip>,
  },
  {
    title: '告警等级',
    dataIndex: 'severity',
    width: 20,
    ellipsis: true,
    render:(text,row,index)=>{
      const t=level.find(v=>v.value==text)?.label??'';
      return <Tooltip title={t}>{t}</Tooltip>;
    },
  },
  {
    title: '是否知晓',
    dataIndex: 'acknowledged',
    width: 20,
    ellipsis: true,
    render:(text,row,index)=>{
      const t=text=='0'?'未知':'已知';
      return <Tooltip title={t}>{t}</Tooltip>;
    },
  },
  /* {
    title: '操作',
    dataIndex: 'action',
    width: 40,
    align:'center',
    render: (text,row,index) => {
      return (
        <div className="table-actions">
          <a onClick={() => handleItemEdit(row)} className="edit">
            <Tooltip title="编辑"><EditOutlined /></Tooltip>
          </a>
          <a onClick={() => handleItemDel(row)} className="delete">
            <Tooltip title="删除"><DeleteOutlined /></Tooltip>
          </a>
        </div>
      );
    },
  }, */
];

const refreshTimes=[
  {
    label:'off',
    value:0,
  },
  {
    label:'2分钟',
    value:120000,
  },
  {
    label:'5分钟',
    value:300000,
  },
  {
    label:'10分钟',
    value:600000,
  },
  {
    label:'30分钟',
    value:1800000,
  },
  {
    label:'2小时',
    value:7200000,
  },
  {
    label:'1天',
    value:86400000,
  },
];

const menu=handler=>(
  <Menu>
    {
      refreshTimes.map(v=><Menu.Item key={v.value}><a onClick={()=>handler(v)}>{v.label}</a></Menu.Item>)
    }
  </Menu>
);

const Index=props=>{
  // console.log(props);
  const [active,setActive]=useState('0');

  const [refreshText,setRefreshText]=useState('off');

  const [delay,setDelay]=useState(50000);
  const [list,updateList]=useAsync({});
  const page=useRef({current:1,size:10});
  const updateNumList=useCallback(params=>updateList({index:getIndex(params)}),[]);
  const updateWarningList=useCallback(params=>updateList({trigger:getTrigger(params)}),[]);
  let timer=0;
  useEffect(()=>{
    updateNumList(page.current);
    updateWarningList(page.current);
  },[]);
  useEffect(()=>{
    return ()=>clearInterval(timer);
  },[]);
  const refresh=delay=>{
    clearInterval(timer);
    setRefreshText(delay.label);
    if(delay.value){
      timer=setInterval(()=>{
        updateWarningList();
      },delay.value);
    }
  };
  /* const handleEdit=async item=>{
    const {data,msg}=await editItem(item);
    message.success(msg);
    update(page.current);
  };
  const handleDelete=async item=>{
    const {msg}=await deleteItem({id:item.id});
    message.success(msg);
    update(page.current);
  }; */
  const switchTab=value=>{
    // console.log(value);
    setActive(value);
  };

  const {index,trigger}=list;//props;
  const numList=index?.data?.items??{};
  const warningList=trigger?.data?.items??[];
  const dataSource=active==0?warningList:warningList.filter(v=>v.severity==active);
  const renderTabs=(v,active)=><Badge count={(v.key==0?warningList:warningList.filter(sv=>sv.severity==v.key)).length}>
    <div style={{padding:'6px 15px'}}>{v.value}</div>
  </Badge>;

  return <div className="pro2-dashboard">
    {/* <Button onClick={()=>handleEdit()}>新增</Button> */}
    <Row gutter={12}>
      {
        cardList.map(v=><Col md={6} sm={12}>
          <div className="dashboard-card">
            <div className="dashboard-card-left">
              <a>{v.icon}</a>
            </div>
            <div className="dashboard-card-right">
              <h3>{v.label}</h3>
              <p>{fm(numList[v.key])}</p>
            </div>
          </div>
        </Col>)
      }
    </Row>
    <div className="section-wrap">
      <div className="tab-header-wrap">
        <TabHeader tabs={level.map(v=>({key:v.value,value:v.label,renderTabs}))} switchTab={switchTab} />
        <div className="refresh-bar">
          <Dropdown overlay={menu(refresh)} trigger={['click']} placement="bottomCenter">
            <a className="ant-dropdown-link" onClick={e => e.preventDefault()} style={{color:'#40a9ff'}}>{refreshText} <RedoOutlined /></a>
          </Dropdown>
        </div>
      </div>
      <div className="tab-body">
        <Table
          size="small"
          bordered
          columns={columns(page.current)}
          dataSource={dataSource}
          loading={trigger?.pending}
          rowKey="id"
        />
      </div>
    </div>
  </div>;
};

export default Index;

















