import React,{useEffect,useCallback,useRef,useState} from 'react';
import { Button, Table, Tooltip, message,Input,Tag, DatePicker,Select } from 'antd';
import { EditOutlined,DeleteOutlined,PlusOutlined, SearchOutlined } from '@ant-design/icons';
import {use,utils} from '@common';
const {useAsync}=use;
const {formatTime,dlfile}=utils;
import {getList,getSubList,listTarget,exportHistory,exportTrend} from '@app/api/api';

import moment from 'moment';

import './index.less';

const {Search}=Input;

const {Option}=Select;

const { RangePicker } = DatePicker;

const columns=(page,handler={})=>[
  {
    title: '序号',
    dataIndex: 'dataIndex',
    width: 20,
    ellipsis: true,
    render: (text,row,index)=>{
      const {page:current,limit:size}=page;
      const i=size*(current-1)+index+1;
      return i;
    },
  },
  {
    title: '主机名',
    dataIndex: 'host',
    width: 70,
    ellipsis: true,
    render:(text,row,index)=><Tooltip title={text}>{text}</Tooltip>,
  },
  {
    title: '告警等级',
    dataIndex: 'level',
    width: 50,
    ellipsis: true,
    render:(text,row,index)=><Tooltip title={text}>{text}</Tooltip>,
  },
  {
    title: '告警消息',
    dataIndex: 'message',
    width: 150,
    ellipsis: true,
    render:(text,row,index)=><Tooltip title={text}>{text}</Tooltip>,
  },
  {
    title: '告警类型',
    dataIndex: 'status',
    width: 50,
    ellipsis: true,
    render:(text,row,index)=><Tooltip title={text}>{text}</Tooltip>,
  },
  {
    title: '发生时间',
    dataIndex: 'occurtime',
    width: 70,
    ellipsis: true,
    render:(text,row,index)=><Tooltip title={text}>{text}</Tooltip>,
  },
  /* {
    title: '模版',
    dataIndex: 'template',
    width: 70,
    ellipsis: true,
    render:(text,row,index)=>{
      const t=row.template?.join(',')??'';
      return <Tooltip title={t}>{t}</Tooltip>;
    },
  },
  {
    title: '状态',
    dataIndex: 'status',
    width: 40,
    ellipsis: true,
    align:'center',
    render:(text,row,index)=>text=='0'?<Tag color="green">启用</Tag>:<Tag color="red">未启用</Tag>,
  },
  {
    title: '监控状态',
    dataIndex: 'status',
    width: 40,
    ellipsis: true,
    align:'center',
    render:(text,row,index)=>text=='0'?<Tag color="green">正常</Tag>:<Tag color="red">不正常</Tag>,
  }, */
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

const Index=props=>{
  const [list,updateList]=useAsync({});
  const initDate=new Date();
  const [searchValue,setSearchValue]=useState({
    begin:formatTime(new Date(initDate-1000*60*60*24*7)),
    end:formatTime(initDate),
  });
  const [selecteds,setSelecteds]=useState({});
  const [detailLoading,setDetailLoading]=useState(false);
  const [trendLoading,setTrendLoading]=useState(false);
  const page=useRef({page:1,limit:10});
  const update=useCallback(params=>updateList({group:getList(params)}),[]);
  const updateSub=useCallback(params=>updateList({subList:getSubList(params)}),[]);
  const updateTarget=useCallback(params=>updateList({target:listTarget(params)}),[]);
  useEffect(()=>{
    update();
  },[]);
  const pageChange=(current,size)=>{
    page.current={page:current,limit:size};
    update({
      ...searchValue,
      ...page.current,
    });
  };
  const handleGroup=value=>{
    console.log(value);
    if(value){
      updateSub({id:value});
      setSelecteds({
        group:value,
      });
    }else{
      setSelecteds({});
    }
  };
  const handleHost=value=>{
    const hostList=subList?.data??{items:[]};
    const {items:host}=hostList;
    const hosts=host[0]?.hosts;
    const selItem=(hosts||[]).find(v=>v.hostid===value);
    if(value){
      updateTarget(selItem);
      setSelecteds({
        group:selecteds.group,
        host:value,
      });
    }else{
      setSelecteds({
        group:selecteds.group,
      });
    }
  };
  const handleTarget=value=>{
    setSelecteds({
      ...selecteds,
      item:value,
    });
  };
  const dlDetail=async ()=>{
    const hostList=subList?.data??{items:[]};
    const {items:host}=hostList;
    const hosts=host[0]?.hosts;
    const targetList=target?.data??{};
    const {items:targets}=targetList;

    const selHosts=(hosts||[]).find(v=>v.hostid===selecteds.host);
    const selItems=(targets||[]).find(v=>v.itemid===selecteds.item);

    const data={host:selHosts,item:selItems,period:[searchValue.begin,searchValue.end]};
    setDetailLoading(true);
    const {result,fileInfo}=await exportHistory(data);
    if(result){
      const name=fileInfo.split(';')[1]?.split('=')[1]??'data.xlsx';
      dlfile(result,name);
      message.success('导出成功！');
    }
    setDetailLoading(false);
  };
  const dlTrend=async ()=>{
    const hostList=subList?.data??{items:[]};
    const {items:host}=hostList;
    const hosts=host[0]?.hosts;
    const targetList=target?.data??{};
    const {items:targets}=targetList;

    const selHosts=(hosts||[]).find(v=>v.hostid===selecteds.host);
    const selItems=(targets||[]).find(v=>v.itemid===selecteds.item);

    const data={host:selHosts,item:selItems,period:[searchValue.begin,searchValue.end]};
    setTrendLoading(true);
    const {result,fileInfo}=await exportTrend(data);
    if(result){
      const name=fileInfo.split(';')[1]?.split('=')[1]??'data.xlsx';
      dlfile(result,name);
      message.success('导出成功！');
    }
    setTrendLoading(false);
  };
  
  const {group,subList,target}=list;
  const groupList=group?.data??{};
  const {items,total}=groupList;

  const hostList=subList?.data??{items:[]};
  const {items:host}=hostList;
  const hosts=host[0]?.hosts;

  const targetList=target?.data??{};
  const {items:targets}=targetList;

  const rt=searchValue.begin&&searchValue.end?[moment(searchValue.begin),moment(searchValue.end)]:undefined;

  return <div className="host-list-page">
    <div className="search-bar">
      <Select value={selecteds?.group} allowClear placeholder="请选择主机组" style={{ width: 150,marginRight: 10 }} onChange={handleGroup}>
        {
          (items||[]).map(v=><Option key={v.groupid} value={v.groupid}>{v.name}</Option>)
        }
      </Select>
      <Select value={selecteds?.host} allowClear placeholder="请选择主机" style={{ width: 120,marginRight: 10 }} onChange={handleHost}>
        {
          (hosts||[]).map(v=><Option key={v.hostid} value={v.hostid}>{v.name}</Option>)
        }
      </Select>
      <Select value={selecteds?.item} allowClear placeholder="请选择指标" style={{ width: 180,marginRight: 10 }} onChange={handleTarget}>
        {
          (targets||[]).map(v=><Option key={v.itemid} value={v.itemid}>{v.name}</Option>)
        }
      </Select>
      <RangePicker showTime placeholder={['请选择开始时间','请选择结束时间']} value={rt} onChange={(moment,str)=>setSearchValue({begin:str[0],end:str[1]})} style={{marginRight:'15px'}} />
      <Button type="primary" loading={detailLoading} onClick={()=>dlDetail()} icon={<SearchOutlined />} style={{ marginRight: 10 }}>导出详情</Button>
      <Button type="primary" loading={trendLoading} onClick={()=>dlTrend()} icon={<SearchOutlined />}>导出趋势</Button>
    </div>
    {/* <div className="table-wrap">
      <Table
        pagination={{
          onShowSizeChange:(current,size)=>pageChange(current,size),
          onChange:(current,size)=>pageChange(current,size),
          showSizeChanger: true,
          showQuickJumper: true,
          total:total||0,
          current:page.current.page,
          pageSize:page.current.limit,
          pageSizeOptions:['10','20','30','40'],
        }}
        size="small"
        bordered
        columns={columns(page.current,{handleEdit,handleDelete})}
        dataSource={items}
        loading={table?.pending}
        rowKey="id"
      />
    </div> */}
  </div>;
};

export default Index;

















