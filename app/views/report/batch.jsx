import React,{useEffect,useCallback,useRef} from 'react';
import { Button, Table, Tooltip, message } from 'antd';
import { EditOutlined,DeleteOutlined } from '@ant-design/icons';
import {use} from '@common';
const {useAsync}=use;
import {getList} from '@app/api/api';

import './index.less';

const columns=(page,handleItemEdit,handleItemDel)=>[
  {
    title: '序号',
    dataIndex: 'dataIndex',
    width: 20,
    ellipsis: true,
    render: (text,row,index)=>{
      const {current,size}=page;
      const i=size*(current-1)+index+1;
      return i;
    },
  },
  {
    title: '一级指标',
    dataIndex: 'firstLevelIndicator',
    width: 40,
    ellipsis: true,
    render:(text,row,index)=><Tooltip title={text}>{text}</Tooltip>,
  },
  {
    title: '二级指标',
    dataIndex: 'secondLevelIndicator',
    width: 40,
    ellipsis: true,
    render:(text,row,index)=><Tooltip title={text}>{text}</Tooltip>,
  },
  {
    title: '三级指标',
    dataIndex: 'thirdLevelIndicator',
    width: 70,
    ellipsis: true,
    render:(text,row,index)=><Tooltip title={text}>{text}</Tooltip>,
  },
  {
    title: '描述',
    dataIndex: 'description',
    width: 50,
    ellipsis: true,
    render:(text,row,index)=><Tooltip title={text}>{text}</Tooltip>,
  },
  {
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
  },
];

const Index=props=>{
  const [list,updateList]=useAsync({});
  const page=useRef({current:1,size:10});
  const update=useCallback(params=>updateList({table:getList(params)}),[]);
  useEffect(()=>{
    update(page.current);
  },[]);
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
  console.log(table);
  return <div className="">
    {/* <Button onClick={()=>handleEdit()}>新增</Button> */}
    <Table
      size="small"
      bordered
      columns={columns(page.current/* ,handleEdit,handleDelete */)}
      dataSource={table?.data?.records}
      loading={!table}
      rowKey="id"
    />
  </div>;
};

export default Index;

















