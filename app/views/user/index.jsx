import React,{useEffect} from 'react';
import { Form, Input, Button, Checkbox, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import {loginFn} from '@app/api/api';
import {utils} from '@common';

const {storage,session}=utils;

import styles from './index.less';

import './index.less';

import {title} from '@app/configs';

const {Search}=Input;

const Index=props=>{
  useEffect(()=>{
    if(storage.get('token')){
      props.router.push('/');
    }
  },[]);
  const onFinish = async values => {
    const {code,data,message:msg}=await loginFn(values);
    if(code===200){
      message.success(msg);
      storage.set('token',data.token);
      props.router.push('/');
    }
  };
  
  return <div className={styles.page}>
    <div className={styles['login-panel']}>
      <div className={styles.title}>
        <h2>{title}</h2>
      </div>
      <div className={styles.content}>
        <div>
          <Form
            name="login"
            className="login-form"
            initialValues={{
              remember: true,
            }}
            onFinish={onFinish}
          >
            <Form.Item
              name="username"
              rules={[
                {
                  required: true,
                  message: '请输入用户名!',
                },
              ]}
            >
              <Input prefix={<UserOutlined className="site-form-item-icon" style={{marginRight:'7px',color:'#999'}} />} placeholder="用户名" />
            </Form.Item>
            <Form.Item
              name="password"
              rules={[
                {
                  required: true,
                  message: '请输入密码!',
                },
              ]}
            >
              <Input
                prefix={<LockOutlined className="site-form-item-icon" style={{marginRight:'7px',color:'#999'}} />}
                type="password"
                placeholder="密码"
              />
            </Form.Item>
            <Form.Item>
              <Button block type="primary" htmlType="submit" className="login-form-button">登录</Button>
            </Form.Item>
          </Form>
        </div>
      </div>
    </div>
  </div>;
};

export default Index;

















