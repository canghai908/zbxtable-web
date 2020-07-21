import {utils} from '@common';
const {storage}=utils;

import {logoutFn} from '@app/api/api';

const logout=()=>{
  logoutFn();
  storage.rm('token');
  location.href='/user/login';
};

export default logout;
