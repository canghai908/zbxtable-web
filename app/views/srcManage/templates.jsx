import React,{useEffect,useCallback,useRef,useState} from 'react';
import { Button, Table, Tooltip, message,Input,Tag } from 'antd';
import { EditOutlined,DeleteOutlined,PlusOutlined } from '@ant-design/icons';
import {use} from '@common';
const {useAsync}=use;
import {getTemplate} from '@app/api/api';

import './index.less';

const {Search}=Input;

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
    title: '可见名称',
    dataIndex: 'name',
    width: 70,
    ellipsis: true,
    render:(text,row,index)=><Tooltip title={text}>{text}</Tooltip>,
  },
  {
    title: '应用集',
    dataIndex: 'applications',
    width: 50,
    ellipsis: true,
    render:(text,row,index)=><Tooltip title={text}>{text}</Tooltip>,
  },
  {
    title: '指标总',
    dataIndex: 'items',
    width: 50,
    ellipsis: true,
    render:(text,row,index)=><Tooltip title={text}>{text}</Tooltip>,
  },
  {
    title: '触发器',
    dataIndex: 'triggers',
    width: 50,
    ellipsis: true,
    render:(text,row,index)=><Tooltip title={text}>{text}</Tooltip>,
  },
  {
    title: '图形',
    dataIndex: 'graphs',
    width: 50,
    ellipsis: true,
    render:(text,row,index)=><Tooltip title={text}>{text}</Tooltip>,
  },
  {
    title: '自动发现规则',
    dataIndex: 'discoveries',
    width: 50,
    ellipsis: true,
    render:(text,row,index)=><Tooltip title={text}>{text}</Tooltip>,
  },
  {
    title: '关联主机数',
    dataIndex: 'groups',
    width: 50,
    ellipsis: true,
    render:(text,row,index)=>{
      const t=row.hosts?.length??0;
      return <Tooltip title={t}>{t}</Tooltip>;
    },
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
  const [searchValue,setSearchValue]=useState({});
  // const page=useRef({current:1,size:10});
  const page=useRef({page:1,limit:10});
  const update=useCallback(params=>updateList({table:getTemplate(params)}),[]);
  useEffect(()=>{
    update(page.current);
  },[]);
  const pageChange=(current,size)=>{
    page.current={page:current,limit:size};
    update({
      ...searchValue,
      ...page.current,
    });
  };
  const searchList=value=>{
    const values={hosts:value};
    setSearchValue(values);
    update({...page.current,...values});
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
  return <div className="host-list-page">
    <div className="search-bar">
      <Search placeholder="请输入主机名" onSearch={searchList} enterButton style={{width:'200px',marginRight:'15px'}} />
      {/* <Button type="primary" icon={<PlusOutlined />}>添加主机</Button> */}
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

















