import React from 'react';
import {useRouter,components as comp} from '@common';
import routers from './router';

import {routerCfg} from './configs';

const {Spinner}=comp;

const App=()=>{
  const {components}=useRouter({routers,...routerCfg});
  return components??<Spinner global />;
};

export default App;


