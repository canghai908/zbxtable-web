import {
  HOST_LIST,
  HOST_EXPORT,
  HOST_MOCK,
  HOST_MOCKD,
  INDEX_RESTOP,
  INDEX_TRIGGER,
  INDEX__OVERVIEW,
  INDEX__EGRESS,
  TRIGGER_LIST,
  INDEX_INFO,
  ALARM,
  ALARM_ANALYSIS,
  ALARM_EXPORT,
  TOPOLOGY_LIST,
  ITEM_LIST,
  INVENTORY_LIST,
  SYSTEM_LIST,
  HOST_GROUP,
  TEMPLATE_lIST,
  ITEM_TRAFFIC,
  TOPO_TRAFFIC,
  TASK_LOG,
  EVENT_LOG,
  MANAGER,
  RULE,
  USER,
  GROUP,
} from "@/services/api";
import { request, METHOD } from "@/utils/request";
import { INDEX_VERSION, REPORT } from "./api";
export async function hostList(params) {
  return request(HOST_LIST, METHOD.GET, { ...params });
}
export async function hostExport(params, config) {
  return request(HOST_EXPORT, METHOD.POST, params, config);
}
export async function hostDetail(id) {
  return request(HOST_LIST + "/" + id, METHOD.GET);
}
export async function hostMock(id) {
  return request(HOST_MOCK + "/" + id, METHOD.GET);
}
export async function hostMockd(params) {
  return request(HOST_MOCKD, METHOD.POST, params);
}
export async function indexRestop(params) {
  return request(INDEX_RESTOP, METHOD.GET, { ...params });
}
export async function indexTrigger() {
  return request(INDEX_TRIGGER, METHOD.GET);
}
export async function indexEgress() {
  return request(INDEX__EGRESS, METHOD.GET);
}
export async function triggerList(params) {
  return request(TRIGGER_LIST, METHOD.GET, { ...params });
}
export async function indexInfo() {
  return request(INDEX_INFO, METHOD.GET);
}
export async function alarm(params) {
  return request(ALARM, METHOD.GET, { ...params });
}
export async function alarmAnalysis(params) {
  return request(ALARM_ANALYSIS, METHOD.POST, params);
}
export async function alarmExport(params, config) {
  return request(ALARM_EXPORT, METHOD.POST, params, config);
}
export async function alarmTenantGet() {
  return request(ALARM + "/tenant", METHOD.GET);
}
export async function topologyList(params) {
  return request(TOPOLOGY_LIST, METHOD.GET, { ...params });
}
export async function topologyDetail(id) {
  return request(TOPOLOGY_LIST + "/" + id, METHOD.GET);
}
export async function createTopology(params) {
  return request(TOPOLOGY_LIST, METHOD.POST, params);
}
export async function updateTopology(params) {
  return request(TOPOLOGY_LIST, METHOD.PUT, params);
}
export async function deleteTopology(id) {
  return request(TOPOLOGY_LIST + "/" + id, METHOD.DELETE);
}
export async function deployTopology(params) {
  return request(TOPOLOGY_LIST + "/deploy", METHOD.POST, params);
}
export async function itemList(params) {
  return request(ITEM_LIST, METHOD.GET, params);
}
export async function inventoryTree() {
  return request(INVENTORY_LIST, METHOD.GET);
}
export async function hostUpdate(params) {
  return request(HOST_LIST, METHOD.POST, params);
}
export async function hostSearch(params) {
  return request(HOST_LIST + "/search", METHOD.GET, params);
}
export async function netInterfaceList(id) {
  return request(HOST_LIST + "/interface/" + id, METHOD.GE);
}
export async function winMonList(id) {
  return request(HOST_LIST + "/winmon/" + id, METHOD.GE);
}
export async function linMonList(id) {
  return request(HOST_LIST + "/linmon/" + id, METHOD.GE);
}
export async function indexOverview() {
  return request(INDEX__OVERVIEW, METHOD.GET);
}
export async function systemList() {
  return request(SYSTEM_LIST, METHOD.GET);
}
export async function systemInfo(id) {
  return request(SYSTEM_LIST + "/" + id, METHOD.GET);
}
export async function systemUpdate(id, params) {
  return request(SYSTEM_LIST + "/" + id, METHOD.PUT, params);
}
export async function systemInit(id, params) {
  return request(SYSTEM_LIST + "/init/" + id, METHOD.POST, params);
}
export async function egressGet() {
  return request(SYSTEM_LIST + "/egress/", METHOD.GET);
}
export async function egressUpdate(params) {
  return request(SYSTEM_LIST + "/egress/", METHOD.PUT, params);
}
export async function hostgroupList() {
  return request(HOST_GROUP + "/all", METHOD.GET);
}
export async function templateList() {
  return request(TEMPLATE_lIST + "/list", METHOD.GET);
}
export async function templateGetItemList(id) {
  return request(TEMPLATE_lIST + "/item/" + id, METHOD.GET);
}
export async function zbxVersion() {
  return request(INDEX_VERSION, METHOD.GET);
}
export async function reportAdd(params) {
  return request(REPORT, METHOD.POST, params);
}
export async function reportList(params) {
  return request(REPORT, METHOD.GET, params);
}
export async function reportGet(id) {
  return request(REPORT + "/" + id, METHOD.GET);
}
export async function reportPut(id, params) {
  return request(REPORT + "/" + id, METHOD.PUT, params);
}
export async function reportDelete(id) {
  return request(REPORT + "/" + id, METHOD.DELETE);
}
export async function reportCheckNow(params) {
  return request(REPORT + "/checknow", METHOD.POST, params);
}
export async function reportStatusUpdate(params) {
  return request(REPORT + "/status", METHOD.POST, params);
}
export async function itemListTraffic(params) {
  return request(ITEM_TRAFFIC, METHOD.GET, params);
}
export async function itemTopoTraffic(params) {
  return request(TOPO_TRAFFIC, METHOD.GET, params);
}
export async function taskLogList(params) {
  return request(TASK_LOG, METHOD.GET, { ...params });
}
export async function taskLogDelete(id) {
  return request(TASK_LOG + "/" + id, METHOD.DELETE);
}
export async function managerChpwd(params) {
  return request(MANAGER + "/chpwd", METHOD.POST, params);
}
export async function ruleList(params) {
  return request(RULE, METHOD.GET, { ...params });
}
export async function ruleAdd(params) {
  return request(RULE, METHOD.POST, params);
}
export async function rulePut(id, params) {
  return request(RULE + "/" + id, METHOD.PUT, params);
}
export async function ruleStatusPut(id, params) {
  return request(RULE + "/status/" + id, METHOD.PUT, params);
}
export async function ruleDelete(id) {
  return request(RULE + "/" + id, METHOD.DELETE);
}
export async function ruleGet(id) {
  return request(RULE + "/" + id, METHOD.GET);
}
export async function userList(params) {
  return request(USER, METHOD.GET, { ...params });
}
export async function userCreate(params) {
  return request(USER, METHOD.POST, params);
}
export async function userDelete(id) {
  return request(USER + "/" + id, METHOD.DELETE);
}
export async function userPut(id, params) {
  return request(USER + "/" + id, METHOD.PUT, params);
}
export async function userStatusPut(id, params) {
  return request(USER + "/status/" + id, METHOD.PUT, params);
}
export async function groupList(params) {
  return request(GROUP, METHOD.GET, { ...params });
}
export async function groupCreate(params) {
  return request(GROUP, METHOD.POST, params);
}
export async function groupPut(id, params) {
  return request(GROUP + "/" + id, METHOD.PUT, params);
}
export async function groupMemberPut(id, params) {
  return request(GROUP + "/member/" + id, METHOD.PUT, params);
}
export async function groupDelete(id) {
  return request(GROUP + "/" + id, METHOD.DELETE);
}
export async function eventLogGet(id) {
  return request(EVENT_LOG + "/" + id, METHOD.GET);
}
export default {
  hostList,
  hostDetail,
  hostMock,
  hostMockd,
  hostSearch,
  indexRestop,
  indexInfo,
  indexEgress,
  alarm,
  alarmAnalysis,
  alarmTenantGet,
  topologyList,
  topologyDetail,
  createTopology,
  updateTopology,
  deleteTopology,
  itemList,
  triggerList,
  deployTopology,
  inventoryTree,
  hostUpdate,
  netInterfaceList,
  winMonList,
  linMonList,
  indexOverview,
  systemList,
  systemInfo,
  systemUpdate,
  systemInit,
  egressGet,
  egressUpdate,
  hostgroupList,
  templateList,
  templateGetItemList,
  zbxVersion,
  reportAdd,
  reportList,
  reportGet,
  reportPut,
  reportCheckNow,
  reportDelete,
  itemListTraffic,
  itemTopoTraffic,
  reportStatusUpdate,
  taskLogList,
  taskLogDelete,
  eventLogGet,
  ruleList,
  ruleAdd,
  rulePut,
  ruleStatusPut,
  userList,
  ruleGet,
  userCreate,
  userDelete,
  userPut,
  userStatusPut,
  groupList,
  groupCreate,
  groupPut,
  groupMemberPut,
  groupDelete,
};
