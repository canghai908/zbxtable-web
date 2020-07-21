import React,{useEffect,useCallback,useRef,useState} from 'react';
import { Button, Table, Tooltip, message,Input,Tag, DatePicker } from 'antd';
import { EditOutlined,DeleteOutlined,PlusOutlined, SearchOutlined,DownloadOutlined } from '@ant-design/icons';
import {use,utils} from '@common';
const {useAsync}=use;
const {formatTime,dlfile}=utils;
import {getAlarm,exportAlarm} from '@app/api/api';

import moment from 'moment';

import './index1.less';

const {Search}=Input;

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
  const [alarmLoading,setAlarmLoading]=useState(false);
  const [list,updateList]=useAsync({});
  const initDate=new Date();
  const [searchValue,setSearchValue]=useState({
    begin:formatTime(new Date(initDate-1000*60*60*24*7)),
    end:formatTime(initDate),
  });
  // const page=useRef({current:1,size:10});
  const page=useRef({page:1,limit:10});
  const update=useCallback(params=>updateList({table:getAlarm(params)}),[]);
  useEffect(()=>{
    update({
      ...searchValue,
      ...page.current,
    });
  },[]);
  const pageChange=(current,size)=>{
    page.current={page:current,limit:size};
    update({
      ...searchValue,
      ...page.current,
    });
  };
  const expAlarm=async ()=>{
    setAlarmLoading(true);
    const {result,fileInfo}=await exportAlarm({
      ...searchValue,
      ...page.current,
    });
    if(result){
      console.log(23321,result);
      const name=fileInfo.split(';')[1]?.split('=')[1]??'data.xlsx';
      dlfile(result,name);
      message.success('导出成功！');
    }
    setAlarmLoading(false);
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
  const {table}=list;
  const tableList=table?.data??{};
  const {items,total}=tableList;
  return <div className="alarm-analysis-page">
    <div className="search-bar">
      {/* <Search placeholder="请输入主机名" onSearch={searchList} enterButton style={{width:'200px',marginRight:'15px'}} /> */}
      <RangePicker showTime value={[moment(searchValue.begin),moment(searchValue.end)].filter(Boolean)} onChange={(moment,str)=>setSearchValue({begin:str[0],end:str[1]})} style={{marginRight:'15px'}} />
      <Button type="primary" onClick={()=>update({...page.current,...searchValue})} icon={<SearchOutlined />}>查询</Button>
      <Button style={{marginLeft:12}} loading={alarmLoading} onClick={()=>expAlarm()} icon={<DownloadOutlined />}>导出</Button>
    </div>
    <div className="table-wrap">
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
        columns={columns(page.current/* ,{handleEdit,handleDelete} */)}
        dataSource={items}
        loading={table?.pending}
        rowKey="id"
      />
    </div>
  </div>;
};

export default Index;

















