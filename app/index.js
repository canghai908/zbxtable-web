import React from 'react';
import ReactDOM from 'react-dom';

import { ConfigProvider } from 'antd';
import zhCN from 'antd/es/locale/zh_CN';

import App from './app';

const mountNode=document.getElementById('app');


ReactDOM.render(<ConfigProvider locale={zhCN}><App /></ConfigProvider>,mountNode);

