import React from 'react';
import styles from './index.less';

import {iframeUrl} from './config';

const {useState,useEffect,useRef}=React;


const Index=props=>{
  const {route}=props;
  const iframeRef=useRef();
  useEffect(()=>{
    console.log(iframeRef.current);
  },[]);
  return <div className={styles.main}>
    <div className={styles.container}>
      <iframe ref={iframeRef} id="iframe" title={route.path} name={route.name} src={`${route.domain}${route.ifPath}`} />
    </div>
  </div>;
};

export default Index;
