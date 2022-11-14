// 视图组件
const view = {
  tabs: () => import("@/layouts/tabs"),
  blank: () => import("@/layouts/BlankView"),
  page: () => import("@/layouts/PageView"),
};

// 路由组件注册
const routerMap = {
  login: {
    authority: "*",
    path: "/login",
    component: () => import("@/pages/login"),
  },
  root: {
    path: "/",
    name: "首页",
    redirect: "/login",
    component: view.tabs,
  },
  //dashboard
  dashboard: {
    name: "Dashboard",
    component: view.blank,
  },
  workplace: {
    component: () => import("@/pages/dashboard/index"),
  },
  inventory: {
    component: () => import("@/pages/dashboard/inventory"),
  },
  overview: {
    component: () => import("@/pages/dashboard/overview"),
  },
  //host
  host: {
    component: view.blank,
  },
  linux: {
    component: () => import("@/pages/host/linuxList"),
  },
  linDetail: {
    component: () => import("@/pages/host/linuxDetail"),
  },
  windows: {
    component: () => import("@/pages/host/winList"),
  },
  winDetail: {
    component: () => import("@/pages/host/winDetail"),
  },
  //net
  net: {
    component: view.blank,
  },
  netList: {
    component: () => import("@/pages/host/netList"),
  },
  netDetail: {
    component: () => import("@/pages/host/netDetail"),
  },
  //server
  server: {
    component: view.blank,
  },
  srvList: {
    component: () => import("@/pages/host/serList"),
  },
  srvDetail: {
    component: () => import("@/pages/host/serDetail"),
  },
  //alarm
  alarm: {
    component: view.blank,
  },
  alarmAnalysis: {
    component: () => import("@/pages/alarm/analysis"),
  },
  alarmList: {
    component: () => import("@/pages/alarm/query"),
  },
  alarmRule: {
    component: () => import("@/pages/alarm/rule"),
  },
  alarmRuleAdd: {
    component: () => import("@/pages/alarm/ruleAdd"),
  },
  alarmRuleEdit: {
    component: () => import("@/pages/alarm/ruleEdit"),
  },
  alarmMutes: {
    component: () => import("@/pages/alarm/mutes"),
  },
  //topology
  topology: {
    component: view.blank,
  },
  topologyList: {
    component: () => import("@/pages/topology/index"),
  },
  topologyDetail: {
    component: () => import("@/pages/topology/detail"),
  },
  topologyShow: {
    component: () => import("@/pages/topology/show"),
  },
  //report
  report: {
    component: view.blank,
  },
  reportTraffic: {
    component: () => import("@/pages/report/index"),
  },
  reportTrafficEdit: {
    component: () => import("@/pages/report/edit"),
  },
  reportTrafficAdd: {
    component: () => import("@/pages/report/add"),
  },
  reportHost: {
    component: () => import("@/pages/report/index"),
  },
  //system
  system: {
    component: view.blank,
  },
  systemUsers: {
    component: () => import("@/pages/system/users"),
  },
  systemGroups: {
    component: () => import("@/pages/system/groups"),
  },
  sysInit: {
    component: () => import("@/pages/system/init"),
  },
  sysInitEdit: {
    component: () => import("@/pages/system/initedit"),
  },
  systemBandwidth: {
    component: () => import("@/pages/system/bandwidth"),
  },
  systemChpwd: {
    component: () => import("@/pages/system/chpwd"),
  },
  analysis: {
    name: "分析页",
    component: () => import("@/pages/dashboard/analysis"),
  },

  form: {
    name: "表单页",
    icon: "form",
    component: view.page,
  },
  basicForm: {
    path: "basic",
    name: "基础表单",
    component: () => import("@/pages/form/basic"),
  },
  stepForm: {
    path: "step",
    name: "分步表单",
    component: () => import("@/pages/form/step"),
  },
  advanceForm: {
    path: "advance",
    name: "高级表单",
    component: () => import("@/pages/form/advance"),
  },
  list: {
    name: "列表页",
    icon: "table",
    component: view.page,
  },
  queryList: {
    path: "query",
    name: "查询表格",
    component: () => import("@/pages/list/QueryList"),
  },
  primaryList: {
    path: "primary",
    name: "标准列表",
    component: () => import("@/pages/list/StandardList"),
  },
  cardList: {
    path: "card",
    name: "卡片列表",
    component: () => import("@/pages/list/CardList"),
  },
  searchList: {
    path: "search",
    name: "搜索列表",
    component: () => import("@/pages/list/search/SearchLayout"),
  },
  article: {
    name: "文章",
    component: () => import("@/pages/list/search/ArticleList"),
  },
  application: {
    name: "应用",
    component: () => import("@/pages/list/search/ApplicationList"),
  },
  project: {
    name: "项目",
    component: () => import("@/pages/list/search/ProjectList"),
  },
  details: {
    name: "详情页",
    icon: "profile",
    component: view.blank,
  },
  basicDetails: {
    path: "basic",
    name: "基础详情页",
    component: () => import("@/pages/detail/BasicDetail"),
  },
  advanceDetails: {
    path: "advance",
    name: "高级详情页",
    component: () => import("@/pages/detail/AdvancedDetail"),
  },
  result: {
    name: "结果页",
    icon: "check-circle-o",
    component: view.page,
  },
  success: {
    name: "成功",
    component: () => import("@/pages/result/Success"),
  },
  error: {
    name: "失败",
    component: () => import("@/pages/result/Error"),
  },
  exception: {
    name: "异常页",
    icon: "warning",
    component: view.blank,
  },
  exp403: {
    authority: "*",
    name: "exp403",
    path: "403",
    component: () => import("@/pages/exception/403"),
  },
  exp404: {
    name: "exp404",
    path: "404",
    component: () => import("@/pages/exception/404"),
  },
  exp500: {
    name: "exp500",
    path: "500",
    component: () => import("@/pages/exception/500"),
  },
  components: {
    name: "小组件",
    icon: "appstore-o",
    component: view.page,
  },
  taskCard: {
    name: "任务卡片",
    component: () => import("@/pages/components/TaskCard"),
  },
  palette: {
    name: "颜色复选框",
    component: () => import("@/pages/components/Palette"),
  },
};
export default routerMap;
