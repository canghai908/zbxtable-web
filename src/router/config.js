import TabsView from "@/layouts/tabs/TabsView";
import BlankView from "@/layouts/BlankView";
// import PageView from '@/layouts/PageView'

// 路由配置
const options = {
  routes: [
    {
      path: "/install",
      name: "安装",
      component: () => import("@/pages/install"),
    },
    {
      path: "/login",
      name: "登录",
      component: () => import("@/pages/login"),
    },
    {
      path: "*",
      name: "404",
      component: () => import("@/pages/exception/404"),
    },
    {
      path: "/403",
      name: "403",
      component: () => import("@/pages/exception/403"),
    },
    {
      path: "/screen/dashboard",
      name: "运维大屏",
      component: () => import("@/pages/screen/index"),
    },
    {
      path: "/",
      name: "首页",
      component: TabsView,
      redirect: "/dashboard/workplace",
      children: [
        {
          path: "dashboard",
          name: "系统概要",
          meta: { icon: "dashboard" },
          component: BlankView,
          children: [
            {
              path: "workplace",
              name: "面板",
              meta: { page: { closable: false } },
              component: () => import("@/pages/dashboard/index"),
            },
            {
              path: "inventory",
              name: "资产管理",
              meta: { page: { closable: false } },
              component: () => import("@/pages/dashboard/inventory"),
            },
            {
              path: "overview",
              name: "状态总览",
              meta: { page: { closable: false } },
              component: () => import("@/pages/dashboard/overview"),
            },
          ],
        },
        {
          path: "host",
          name: "主机应用",
          meta: { icon: "hdd", page: { cacheAble: false } },
          component: BlankView,
          children: [
            {
              path: "linux",
              name: "Linux系统",
              component: () => import("@/pages/host/linuxList"),
            },
            {
              path: "windows",
              name: "Windows系统",
              component: () => import("@/pages/host/winList"),
            },
            {
              path: "windetail",
              name: "Windows详情",
              meta: { highlight: "/host", invisible: true },
              component: () => import("@/pages/host/winDetail"),
            },
            {
              path: "lindetail",
              name: "Linux详情",
              meta: { highlight: "/host", invisible: true },
              component: () => import("@/pages/host/linuxDetail"),
            },
          ],
        },
        {
          path: "net",
          name: "网络管理",
          meta: { icon: "ie", page: { cacheAble: false } },
          component: BlankView,
          children: [
            {
              path: "list",
              name: "网络设备",
              component: () => import("@/pages/host/netList"),
            },
            {
              path: "detail",
              name: "设备详情",
              meta: { highlight: "/net", invisible: true },
              component: () => import("@/pages/host/netDetail"),
            },
          ],
        },
        {
          path: "server",
          name: "硬件管理",
          meta: { icon: "folder", page: { cacheAble: false } },
          component: BlankView,
          children: [
            {
              path: "list",
              name: "物理服务器",
              component: () => import("@/pages/host/serList"),
            },
            {
              path: "detail",
              name: "详细信息",
              meta: { highlight: "/server", invisible: true },
              component: () => import("@/pages/host/serDetail"),
            },
          ],
        },
        {
          path: "alarm",
          name: "告警管理",
          meta: { icon: "history", page: { cacheAble: false } },
          component: BlankView,
          children: [
            {
              path: "analysis",
              name: "告警分析",
              component: () => import("@/pages/alarm/analysis"),
            },
            {
              path: "query",
              name: "告警查询",
              component: () => import("@/pages/alarm/query"),
            },
            {
              path: "rule",
              name: "分发规则",
              component: () => import("@/pages/alarm/rule"),
            },
            {
              path: "mutes",
              name: "屏蔽规则",
              component: () => import("@/pages/alarm/mutes"),
            },
          ],
        },
        {
          path: "topology",
          name: "拓扑管理",
          meta: { icon: "cluster", page: { cacheAble: false } },
          component: BlankView,
          children: [
            {
              path: "list",
              name: "拓扑维护",
              component: () => import("@/pages/topology/index"),
            },
            {
              path: "detail",
              name: "编辑",
              meta: { highlight: "/topology", invisible: true },
              component: () => import("@/pages/topology/detail"),
            },
            {
              path: "show",
              name: "展示",
              meta: { highlight: "/topology", invisible: true },
              component: () => import("@/pages/topology/show"),
            },
          ],
        },
        {
          path: "report",
          name: "报表管理",
          meta: { icon: "cluster", page: { cacheAble: false } },
          component: BlankView,
          children: [
            {
              path: "host",
              name: "主机报表",
              component: () => import("@/pages/report/host"),
            },
          ],
        },
        {
          path: "system",
          name: "系统管理",
          meta: {
            icon: "setting",
            page: { cacheAble: false },
            // invisible: true,
          },
          component: BlankView,
          children: [
            {
              path: "users",
              name: "用户管理",
              meta: { icon: "user", page: { cacheAble: false } },
              component: () => import("@/pages/system/users"),
            },
            {
              path: "bandwidth",
              name: "出口配置",
              component: () => import("@/pages/system/bandwidth"),
            },
            {
              path: "zabbix",
              name: "Zabbix管理",
              component: () => import("@/pages/system/zabbix"),
            },
            {
              path: "config",
              name: "参数配置",
              component: () => import("@/pages/system/config"),
            },
            {
              path: "asset-management",
              name: "资产管理",
              component: () => import("@/pages/system/asset-management"),
            },
            {
              path: "version",
              name: "版本信息",
              component: () => import("@/pages/system/version"),
            },
            {
              path: "asset-type",
              name: "资产类型",
              meta: { invisible: true, highlight: "/system/asset-management" },
              component: () => import("@/pages/system/asset-type"),
            },
            {
              path: "asset-binding",
              name: "资产绑定",
              meta: { invisible: true, highlight: "/system/asset-management" },
              component: () => import("@/pages/system/asset-binding"),
            },
          ],
        },
      ],
    },
  ],
};

export default options;
