<template>
  <a-table
    :columns="columns"
    :data-source="dataSource"
    :loading="loading"
    :pagination="pagination"
    :row-key="rowKey"
  >
    <span slot="type_code" slot-scope="text">
      <a-tag color="blue">{{ text }}</a-tag>
    </span>
    <span slot="monitor_type" slot-scope="text">
      <a-tag :color="monitorTypeColor(text)">{{ monitorTypeLabel(text) }}</a-tag>
    </span>
    <span slot="menu_group" slot-scope="text">
      <template v-if="text">
        <a-icon v-if="groupIcon(text)" :type="groupIcon(text)" :style="{ marginRight: '4px', color: $themeColor }" />
        <span>{{ groupName(text) }}</span>
      </template>
      <span v-else style="color: #ccc;">未设置（不显示于菜单）</span>
    </span>
    <span slot="icon" slot-scope="text">
      <a-icon v-if="text" :type="text" style="font-size: 18px;" />
      <span v-else style="color: #ccc;">-</span>
    </span>
    <span slot="action" slot-scope="text, record">
      <a @click="$emit('edit', record)" style="margin-right: 8px;">编辑</a>
      <a @click="$emit('config-fields', record)" :style="{ marginRight: '8px', color: $themeColor }">字段配置</a>
      <a-popconfirm
        title="确认删除该设备类型？"
        ok-text="确认"
        cancel-text="取消"
        @confirm="$emit('delete', record)"
      >
        <a style="color: #ff4d4f;">删除</a>
      </a-popconfirm>
    </span>
  </a-table>
</template>

<script>
import { getAssetGroups } from '@/services/admin';

const MONITOR_TYPE_MAP = {
  agent: { label: '主机类（Agent）',    color: 'green'  },
  snmp:  { label: '网络/存储（SNMP）',  color: 'orange' },
  ipmi:  { label: '物理服务器（IPMI）', color: 'purple' },
  jmx:   { label: '中间件/应用（JMX）', color: 'blue'   },
};

export default {
  name: 'AssetTypeTable',
  props: {
    columns:        { type: Array,   required: true },
    dataSource:     { type: Array,   default: () => [] },
    loading:        { type: Boolean, default: false },
    pagination:     { default: false },
    rowKey:         { type: String,  default: 'id' },
  },
  data() {
    return { groupMap: {} };
  },
  created() {
    this.loadGroups();
  },
  methods: {
    async loadGroups() {
      try {
        const res = await getAssetGroups();
        const biz = res && res.data ? res.data : res;
        const list = (biz && biz.code === 200 && biz.data) ? biz.data : [];
        const map = {};
        list.forEach((g) => { map[g.group_key] = g; });
        this.groupMap = map;
      } catch { /* silent */ }
    },
    monitorTypeLabel: (t) => (MONITOR_TYPE_MAP[t] || {}).label || t || '-',
    monitorTypeColor: (t) => (MONITOR_TYPE_MAP[t] || {}).color || 'default',
    groupName(key)  { return this.groupMap[key] ? this.groupMap[key].name : key; },
    groupIcon(key)  { return this.groupMap[key] ? this.groupMap[key].icon : ''; },
  },
};
</script>
