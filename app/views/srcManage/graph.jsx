import React,{useEffect,useCallback,useRef,useState} from 'react';
import { Button, Table, Tooltip, message,Input,Tag,Tree,Spin,DatePicker,Row,Col } from 'antd';
import { EditOutlined,DeleteOutlined,PlusOutlined,SearchOutlined,DownloadOutlined } from '@ant-design/icons';
import {use,utils} from '@common';
const {useAsync,useSearch}=use;
const {updateId,unique,formatTime,dlfile}=utils;
import {listGraph,listGraph1,getList,exportGraph} from '@app/api/api';

import moment from 'moment';

import './index.less';

const {Search}=Input;
const {TreeNode}=Tree;
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
    title: '可见名称',
    dataIndex: 'name',
    width: 50,
    ellipsis: true,
    render:(text,row,index)=><Tooltip title={text}>{text}</Tooltip>,
  },
  {
    title: '接口IP',
    dataIndex: 'interfaces',
    width: 50,
    ellipsis: true,
    render:(text,row,index)=><Tooltip title={text}>{text}</Tooltip>,
  },
  {
    title: '主机组',
    dataIndex: 'groups',
    width: 50,
    ellipsis: true,
    render:(text,row,index)=><Tooltip title={text}>{text}</Tooltip>,
  },
  {
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

const renderTree=(tree,childKey='children')=>tree.map(item=>{
  if(item[childKey]&&item[childKey].length){
    return <TreeNode key={item.fuckId} title={item.name} item={item} selectable={!item.groupid}>
      {renderTree(item[childKey],childKey)}
    </TreeNode>;
  }
  return <TreeNode key={item.fuckId} title={item.name} item={item} selectable={!item.groupid} />;
});

const initDate=new Date();

const Index=props=>{
  const [list,updateList]=useAsync({});
  const [filterTree, setFilterTree]=useSearch(null);
  const [checkedKeys,setCheckedKeys]=useState([]);
  const [selected,setSelected]=useState({});
  const [searchValue,setSearchValue]=useState({
    begin:formatTime(new Date(initDate-1000*60*60*24*7)),
    end:formatTime(initDate),
  });
  const [loading,setLoading]=useState(false);
  const selHost=useRef([]);
  // const page=useRef({current:1,size:10});
  const page=useRef({page:1,limit:10});
  const update=useCallback(params=>updateList({graph:listGraph1(params)}),[]);
  useEffect(()=>{
    // update(page.current);
  },[]);
  useEffect(()=>{
    updateList({treeList:getList()});
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
  const searchTree=value=>{
    const treeData=list?.treeList.data.items;
    setFilterTree(treeData,value,'name','hosts');
  };
  const onTreeCheck=(keys,node)=>{
    const selNodes=node.checkedNodes.map(v=>v.item).filter(v=>v.hostid).map(v=>v.hostid);
    selHost.current=unique(selNodes);
    setCheckedKeys(keys);
  };
  const onSelect=(keys,node)=>{
    const {item}=node.node;
    console.log(66,item);
    setSelected(item);
    /* updateList({
      graph:listGraph1({
        period:[searchValue.begin,searchValue.end],
        hostid:item.hostid,
      }),
    }); */
    update({
      period:[searchValue.begin,searchValue.end],
      hostid:item.hostid,
    });
  };
  const expGraph=async ()=>{
    setLoading(true);
    const {result,fileInfo}=await exportGraph({
      period:[searchValue.begin,searchValue.end],
      hostids:selHost.current,
    });
    if(result){
      const name=fileInfo.split(';')[1]?.split('=')[1]??'data.xlsx';
      dlfile(result,name);
      message.success('导出成功！');
    }
    setLoading(false);
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
  const {graph,treeList}=list;
  const graphList=graph?.data??{};
  const {items,total}=graphList;

  const tree=treeList?.data?.items??[];
  const treeData=filterTree||tree;

  const tree1=updateId(treeData,'hosts');

  console.log(22,tree1);

  return <div className="tree-table-layout">
    <div className="left-tree">
      <Search placeholder="请输入名称" allowClear enterButton onSearch={searchTree} />
      <Spin spinning={treeList?.pending}>
        <Tree
          checkable
          // defaultExpandedKeys={['root-key']}
          onCheck={onTreeCheck}
          onSelect={onSelect}
          checkedKeys={checkedKeys}
          key="id"
          className="left-tree-style"
        >
          {renderTree(tree1,'hosts')}
        </Tree>
      </Spin>
    </div>
    <div className="right-table">
      <div className="search-bar">
        <RangePicker showTime value={[moment(searchValue.begin),moment(searchValue.end)].filter(Boolean)} onChange={(moment,str)=>setSearchValue({begin:str[0],end:str[1]})} style={{marginRight:'15px'}} />
        <Button type="primary" onClick={()=>update({period:[searchValue.begin,searchValue.end],hostid:selected.hostid})} icon={<SearchOutlined />}>查询</Button>
        <Button style={{marginLeft:12}} loading={loading} onClick={()=>expGraph()} icon={<DownloadOutlined />}>导出</Button>
      </div>
      <div className="table-wrap">
        <Row gutter={[12,12]}>
          {
            (items||[]).map(v=><Col key={v.graphid} lg={12} xl={8}>
              <div className="img-container">
                <img src={v.graphid} alt={v.name} />
              </div>
            </Col>)
          }
        </Row>
      </div>
    </div>
  </div>;
};

export default Index;

















