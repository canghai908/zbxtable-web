import React, {useState, useEffect} from 'react';
import {ConfigProvider} from 'antd';
import zhCN from 'antd/es/locale/zh_CN';
import enUS from 'antd/es/locale/en_US';
import {useRouter, components as comp, utils} from '@common';
import routers from './router';

import {routerCfg} from './configs';

import i18ns from '@app/i18n';
import {emit} from '@app/utils';
const {storage} = utils;

const {Spinner} = comp;

const antLang = {
  zh: zhCN,
  en: enUS,
};

let count = 0;

const Router = (props) => {
  const {language} = props;
  const {title, router: list} = i18ns[language];
  const {components, updateRouter, store} = useRouter({...props, routers: routers(list), title});
  useEffect(() => {
    store.setState({langCfg: {...i18ns[language], language}});
    const {title, router: list} = i18ns[language];
    if (count) {
      updateRouter({...props, routers: routers(list), title});
    }
    count++;
  }, [language]);
  return components ?? <Spinner global />;
};

const App = () => {
  const [lang, setLang] = useState(storage.get('language') || 'zh');
  useEffect(() => {
    emit.on('change-language', (lang) => {
      console.log(lang);
      setLang(lang);
    });
  }, []);
  return (
    <ConfigProvider locale={antLang[lang]}>
      <Router {...routerCfg} language={lang} />
    </ConfigProvider>
  );
};

export default App;
