//跨域代理前缀
const API_PROXY_PREFIX = "/api";
const BASE_URL =
  process.env.NODE_ENV === "production"
    ? process.env.VUE_APP_API_BASE_URL
    : API_PROXY_PREFIX;
module.exports = {
  LOGIN: "/v1/login",
  ROUTES: "/v1/index/routers",
  INDEX_INFO: "/v1/index/baseinfo",
  HOST_LIST: "/v1/host",
  HOST_EXPORT: "/v1/export/hosts",
  INVENTORY_EXPORT: "/v1/export/inventory",
  HOST_MOCK: "/v1/host/monitem",
  HOST_MOCKD: "/v1/history",
  INDEX_RESTOP: "/v1/index/restop",
  INDEX__OVERVIEW: "/v1/index/overview",
  INDEX__EGRESS: "/v1/index/egress",
  INDEX_TRIGGER: "/v1/trigger",
  TRIGGER_LIST: "/v1/trigger/list",
  ALARM: "/v1/alarm",
  ALARM_ANALYSIS: "/v1/alarm/analysis",
  ALARM_EXPORT: "/v1/alarm/export",
  TOPOLOGY_LIST: "/v1/topology",
  ITEM_LIST: "/v1/item/list",
  INVENTORY_LIST: "/v1/index/inventory",
  SYSTEM_LIST: "/v1/system",
  HOST_GROUP: "/v1/host_group",
  TEMPLATE_lIST: "/v1/template",
  INDEX_VERSION: "/v1/index/version",
  REPORT: "/v1/report",
  ITEM_TRAFFIC: "/v1/item/traffic",
  TOPO_TRAFFIC: "/v1/item/topotraffic",
  TASK_LOG: "/v1/task_log",
  EVENT_LOG: "/v1/event_log",
  MANAGER: "/v1/manager",
  RULE: "/v1/rule",
  USER: "/v1/user",
  GROUP: "/v1/group",
  API_WS: "/ws",
};
