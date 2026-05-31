<template>
  <a-drawer
    :title="`配置显示字段 — ${assetType ? assetType.name : ''}`"
    :visible="visible"
    :width="600"
    :destroy-on-close="true"
    @close="$emit('close')"
  >
    <div style="margin-bottom: 12px; color: #888; font-size: 12px;">
      勾选需要在列表中显示的字段，修改列头名称，调整排列顺序。操作列固定在最后不可配置。
    </div>

    <a-spin :spinning="loading">
      <a-table
        :data-source="fields"
        :pagination="false"
        row-key="key"
        size="small"
        :columns="tableColumns"
      >
        <span slot="visible" slot-scope="text, record">
          <a-checkbox :checked="record.visible" @change="record.visible = !record.visible" />
        </span>
        <span slot="label" slot-scope="text, record">
          <a-input v-model="record.label" size="small" style="width: 120px;" />
        </span>
        <span slot="render" slot-scope="text, record">
          <a-select
            v-model="record.render"
            size="small"
            style="width: 100px;"
          >
            <a-select-option
              v-for="opt in renderOptions"
              :key="opt.value"
              :value="opt.value"
            >
              <a-tag :color="opt.color" style="margin: 0;">{{ opt.label }}</a-tag>
            </a-select-option>
          </a-select>
        </span>
        <span slot="sort" slot-scope="text, record, index">
          <a-button
            icon="up"
            size="small"
            :disabled="index === 0"
            @click="moveUp(index)"
            style="margin-right: 4px;"
          />
          <a-button
            icon="down"
            size="small"
            :disabled="index === fields.length - 1"
            @click="moveDown(index)"
          />
        </span>
      </a-table>
    </a-spin>

    <div class="drawer-footer">
      <a-button style="margin-right: 8px;" @click="$emit('close')">取消</a-button>
      <a-button type="primary" :loading="saving" @click="handleSave">保存配置</a-button>
    </div>
  </a-drawer>
</template>

<script>
import { getAssetTypeFields, updateAssetTypeFields } from '@/services/admin';

// 所有可配置的列表字段定义
const ALL_FIELDS = [
  { key: 'hostid',             label: '主机ID',    render: 'text',     group: '基础' },
  { key: 'name',               label: '设备名称',  render: 'text',     group: '基础' },
  { key: 'instance_name',      label: '所属实例',  render: 'tag',      group: '基础' },
  { key: 'interfaces',         label: 'IP地址',   render: 'text',     group: '基础' },
  { key: 'os',                 label: '操作系统',  render: 'text',     group: '系统' },
  { key: 'model',              label: '设备型号',  render: 'text',     group: '硬件' },
  { key: 'serial_no',         label: '序列号',    render: 'text',     group: '硬件' },
  { key: 'vendor',             label: '厂商',      render: 'text',     group: '硬件' },
  { key: 'location',           label: '设备位置',  render: 'text',     group: '硬件' },
  { key: 'department',         label: '部门',      render: 'text',     group: '信息' },
  { key: 'resource_id',        label: '资产编号',  render: 'text',     group: '信息' },
  { key: 'date_hw_expiry',     label: '维保到期',  render: 'text',     group: '信息' },
  { key: 'date_hw_install',    label: '安装时间',  render: 'text',     group: '信息' },
  { key: 'mac',                label: 'MAC地址',  render: 'text',     group: '网络' },
  { key: 'uptime',             label: '运行时长',  render: 'text',     group: '性能' },
  { key: 'cpu_utilization',    label: 'CPU使用率', render: 'progress', group: '性能' },
  { key: 'memory_utilization', label: '内存使用率', render: 'progress', group: '性能' },
  { key: 'memory_used',        label: '内存用量',  render: 'text',     group: '性能' },
  { key: 'memory_total',       label: '内存总量',  render: 'text',     group: '性能' },
  { key: 'available',          label: '采集状态',  render: 'status',   group: '状态' },
  { key: 'ping',               label: 'Ping状态',  render: 'ping',     group: '状态' },
];

const RENDER_OPTIONS = [
  { value: 'text',     label: 'text',     color: 'default' },
  { value: 'progress', label: 'progress', color: 'blue'    },
  { value: 'status',   label: 'status',   color: 'green'   },
  { value: 'ping',     label: 'ping',     color: 'cyan'    },
  { value: 'tag',      label: 'tag',      color: 'orange'  },
  { value: 'link',     label: 'link',     color: 'purple'  },
];

export default {
  name: 'AssetTypeFieldDrawer',
  props: {
    visible:   { type: Boolean, required: true },
    assetType: { type: Object,  default: null },
  },
  data() {
    return {
      loading: false,
      saving: false,
      fields: [],
      renderOptions: RENDER_OPTIONS,
      tableColumns: [
        { title: '显示', key: 'visible', width: 60,  scopedSlots: { customRender: 'visible' } },
        { title: '字段', dataIndex: 'key', key: 'key', width: 150 },
        { title: '列头名称', key: 'label', scopedSlots: { customRender: 'label' } },
        { title: '渲染', key: 'render', dataIndex: 'render', width: 80, scopedSlots: { customRender: 'render' } },
        { title: '排序', key: 'sort', width: 90, scopedSlots: { customRender: 'sort' } },
      ],
    };
  },
  watch: {
    visible(val) {
      if (val && this.assetType) this.loadFields();
    },
  },
  methods: {
    async loadFields() {
      this.loading = true;
      try {
        const res = await getAssetTypeFields(this.assetType.id);
        const biz = res && res.data ? res.data : res;
        const serverFields = (biz && biz.code === 200 && biz.data) ? biz.data : [];
        const keyToServer = {};
        serverFields.forEach((f) => { keyToServer[f.key] = f; });
        // 合并：服务端配置优先，未配置的字段补充为不可见
        const merged = ALL_FIELDS.map((meta, idx) => {
          if (keyToServer[meta.key]) {
            return { ...meta, ...keyToServer[meta.key] };
          }
          return { ...meta, visible: false, width: 0, sortable: false, order: 100 + idx };
        });
        merged.sort((a, b) => a.order - b.order);
        this.fields = merged;
      } catch {
        this.$message.error('加载字段配置失败');
      } finally {
        this.loading = false;
      }
    },
    moveUp(idx) {
      if (idx === 0) return;
      const arr = [...this.fields];
      [arr[idx - 1], arr[idx]] = [arr[idx], arr[idx - 1]];
      arr.forEach((f, i) => { f.order = i; });
      this.fields = arr;
    },
    moveDown(idx) {
      if (idx >= this.fields.length - 1) return;
      const arr = [...this.fields];
      [arr[idx], arr[idx + 1]] = [arr[idx + 1], arr[idx]];
      arr.forEach((f, i) => { f.order = i; });
      this.fields = arr;
    },
    async handleSave() {
      this.saving = true;
      try {
        const payload = this.fields.map((f, i) => ({
          key:      f.key,
          label:    f.label,
          render:   f.render,
          width:    f.width || 0,
          visible:  !!f.visible,
          sortable: !!f.sortable,
          order:    i,
        }));
        const res = await updateAssetTypeFields(this.assetType.id, payload);
        const biz = res && res.data ? res.data : res;
        if (biz && biz.code === 200) {
          this.$message.success('字段配置已保存');
          this.$emit('saved');
          this.$emit('close');
        } else {
          this.$message.error((biz && biz.message) || '保存失败');
        }
      } catch {
        this.$message.error('保存失败');
      } finally {
        this.saving = false;
      }
    },
  },
};
</script>

<style lang="less" scoped>
.drawer-footer {
  position: absolute;
  right: 0;
  bottom: 0;
  width: 100%;
  border-top: 1px solid #e8e8e8;
  padding: 10px 16px;
  text-align: right;
  background: #fff;
}
</style>
