import TabsView from "@/layouts/tabs/TabsView";
import BlankView from "@/layouts/BlankView";
// import PageView from '@/layouts/PageView'

// 路由配置
const options = {
  routes: [
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
      path: "/",
      name: "首页",
      component: TabsView,
      redirect: "/login",
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
              path: "rule-edit",
              name: "分发规则",
              component: () => import("@/pages/alarm/ruleEdit"),
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
              path: "traffic",
              name: "流量报表",
              component: () => import("@/pages/report/index"),
            },
            {
              path: "host",
              name: "主机报表",
              meta: { highlight: "/report", invisible: true },
              component: () => import("@/pages/report/index"),
            },
            {
              path: "edit",
              name: "报表编辑",
              meta: { highlight: "/report", invisible: true },
              component: () => import("@/pages/report/edit"),
            },
            {
              path: "add",
              name: "添加",
              meta: {
                highlight: "/report",
                invisible: true,
                authority: {
                  role: "admin1",
                },
              },
              component: () => import("@/pages/report/add"),
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
              path: "groups",
              name: "组织管理",
              component: () => import("@/pages/system/init"),
            },
            {
              path: "init",
              name: "指标映射",
              component: () => import("@/pages/system/init"),
            },
            {
              path: "edit",
              name: "映射编辑",
              meta: { highlight: "/system", invisible: true },
              component: () => import("@/pages/system/initedit"),
            },
            {
              path: "bandwidth",
              name: "出口配置",
              component: () => import("@/pages/system/bandwidth"),
            },
            {
              path: "chpwd",
              name: "密码修改",
              component: () => import("@/pages/system/chpwd"),
            },
          ],
        },
      ],
    },
  ],
};

export default options;
