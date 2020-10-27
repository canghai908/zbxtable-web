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

const cardList=nameList=>[
  {
    key:'hosts',
    label:nameList['host'],
    icon:<CloudServerOutlined style={{color:'#73d13d'}} />,
    color:'#73d13d',
  },
  {
    key:'items',
    label:nameList['item'],
    icon:<BarChartOutlined style={{color:'#40a9ff'}} />,
    color:'#40a9ff',
  },
  {
    key:'triggers',
    label:nameList['trigger'],
    icon:<BugOutlined style={{color:'#ffc53d'}} />,
    color:'#ffc53d',
  },
  {
    key:'problems',
    label:nameList['problem'],
    icon:<AlertOutlined style={{color:'#fa541c'}} />,
    color:'#fa541c',
  },
];

const level=nameList=>[
  {
    value:'0',
    label:nameList['all'],
  },
  {
    value:'1',
    label:nameList['info'],
  },
  {
    value:'2',
    label:nameList['warning'],
  },
  {
    value:'3',
    label:nameList['normal'],
  },
  {
    value:'4',
    label:nameList['danger'],
  },
  {
    value:'5',
    label:nameList['zainan'],
  },
];

const columns=(page,nameList,levelList)=>[
  {
    title: nameList['id'],
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
    title: nameList['time'],
    dataIndex: 'lastchange',
    width: 40,
    ellipsis: true,
    render:(text,row,index)=>{
      const t=formatTime(new Date(text*1000-0));
      return <Tooltip title={t}>{t}</Tooltip>;
    },
  },
  {
    title: nameList['name'],
    dataIndex: 'name',
    width: 40,
    ellipsis: true,
    render:(text,row,index)=><Tooltip title={text}>{text}</Tooltip>,
  },
  {
    title: nameList['info'],
    dataIndex: 'lasteventname',
    width: 70,
    ellipsis: true,
    render:(text,row,index)=><Tooltip title={text}>{text}</Tooltip>,
  },
  {
    title: nameList['severity'],
    dataIndex: 'severity',
    width: 20,
    ellipsis: true,
    render:(text,row,index)=>{
      const t=level(levelList).find(v=>v.value==text)?.label??'';
      return <Tooltip title={t}>{t}</Tooltip>;
    },
  },
  {
    title: nameList['acknowledged'],
    dataIndex: 'acknowledged',
    width: 20,
    ellipsis: true,
    render:(text,row,index)=>{
      const t=text=='0'?nameList['notKnow']:nameList['know'];
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

const refreshTimes=nameList=>[
  {
    label:nameList['off'],
    value:0,
  },
  {
    label:nameList['2m'],
    value:120000,
  },
  {
    label:nameList['5m'],
    value:300000,
  },
  {
    label:nameList['10m'],
    value:600000,
  },
  {
    label:nameList['30m'],
    value:1800000,
  },
  {
    label:nameList['2h'],
    value:7200000,
  },
  {
    label:nameList['1d'],
    value:86400000,
  },
];

const menu=(handler,time)=>(
  <Menu>
    {
      refreshTimes(time).map(v=><Menu.Item key={v.value}><a onClick={()=>handler(v)}>{v.label}</a></Menu.Item>)
    }
  </Menu>
);

const Index=props=>{
  // console.log(props);
  const [active,setActive]=useState('0');

  const [refreshText,setRefreshText]=useState('off');

  const langCfg=props.store?.getState('langCfg')??{};
  const {dashboard}=langCfg;

  const {card,level:levelList,table,time}=dashboard||{};

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
        cardList(card).map(v=><Col md={6} sm={12}>
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
        <TabHeader tabs={level(levelList).map(v=>({key:v.value,value:v.label,renderTabs}))} switchTab={switchTab} />
        <div className="refresh-bar">
          <Dropdown overlay={menu(refresh,time)} trigger={['click']} placement="bottomCenter">
            <a className="ant-dropdown-link" onClick={e => e.preventDefault()} style={{color:'#40a9ff'}}>{refreshText} <RedoOutlined /></a>
          </Dropdown>
        </div>
      </div>
      <div className="tab-body">
        <Table
          size="small"
          bordered
          columns={columns(page.current,table,levelList)}
          dataSource={dataSource}
          loading={trigger?.pending}
          rowKey="id"
        />
      </div>
    </div>
  </div>;
};

export default Index;

















