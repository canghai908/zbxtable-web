<template>
  <div v-if="embedded">
    <div>
      <a-card :bordered="false" title="资产类型列表">
        <template #extra>
          <a-button type="primary" icon="plus" @click="handleAdd">新建类型</a-button>
        </template>

        <a-table
          :columns="columns"
          :data-source="dataSource"
          :loading="loading"
          :pagination="false"
          rowKey="id"
        >
          <span slot="type_code" slot-scope="text">
            <a-tag color="blue">{{ text }}</a-tag>
          </span>
          <span slot="monitor_type" slot-scope="text">
            <a-tag :color="getMonitorTypeColor(text)">{{ getMonitorTypeLabel(text) }}</a-tag>
          </span>
          <span slot="icon" slot-scope="text">
            <a-icon v-if="text" :type="text" style="font-size: 18px;" />
            <span v-else style="color: #ccc;">-</span>
          </span>
          <span slot="action" slot-scope="text, record">
            <a @click="handleEdit(record)" style="margin-right: 8px;">编辑</a>
            <a-popconfirm
              title="确认删除该资产类型？"
              ok-text="确认"
              cancel-text="取消"
              @confirm="handleDelete(record)"
            >
              <a style="color: #ff4d4f;">删除</a>
            </a-popconfirm>
          </span>
        </a-table>
      </a-card>

      <a-modal
        :title="modalTitle"
        :visible="modalVisible"
        :confirm-loading="modalLoading"
        @ok="handleSubmit"
        @cancel="handleCancel"
        width="520px"
      >
        <a-form-model
          ref="form"
          :model="form"
          :rules="rules"
          :label-col="{ span: 6 }"
          :wrapper-col="{ span: 16 }"
        >
          <a-form-model-item label="名称" prop="name">
            <a-input v-model="form.name" placeholder="请输入资产类型名称" />
          </a-form-model-item>

          <a-form-model-item label="类型代码" prop="type_code">
            <a-input
              v-model="form.type_code"
              placeholder="如: VM_LIN、HW_NET、HW_IPMI"
              :disabled="isEdit"
              @input="form.type_code = form.type_code.toUpperCase()"
            />
          </a-form-model-item>

          <a-form-model-item prop="monitor_type">
            <template #label>
              <span>监控类型
                <a-tooltip>
                  <template #title>
                    <div>Agent：Zabbix Agent，主机类设备</div>
                    <div>SNMP：SNMP轮询，网络设备/存储</div>
                    <div>IPMI：带外管理，物理服务器</div>
                    <div>JMX：Java监控，中间件/应用</div>
                  </template>
                  <a-icon type="question-circle" style="margin-left: 4px; color: #aaa;" />
                </a-tooltip>
              </span>
            </template>
            <a-select v-model="form.monitor_type" placeholder="请选择监控类型">
              <a-select-option value="agent">
                <a-icon type="desktop" style="margin-right: 6px;" />主机类（Agent）
              </a-select-option>
              <a-select-option value="snmp">
                <a-icon type="cluster" style="margin-right: 6px;" />网络/存储类（SNMP）
              </a-select-option>
              <a-select-option value="ipmi">
                <a-icon type="control" style="margin-right: 6px;" />物理服务器（IPMI）
              </a-select-option>
              <a-select-option value="jmx">
                <a-icon type="code" style="margin-right: 6px;" />中间件/应用（JMX）
              </a-select-option>
            </a-select>
          </a-form-model-item>

          <a-form-model-item label="图标" prop="icon">
            <a-row type="flex" align="middle" :gutter="8">
              <a-col flex="1">
                <a-select
                  v-model="form.icon"
                  placeholder="请选择图标"
                  show-search
                  option-filter-prop="label"
                  allow-clear
                  style="width: 100%;"
                >
                  <a-select-option
                    v-for="ic in iconOptions"
                    :key="ic.value"
                    :value="ic.value"
                    :label="ic.label"
                  >
                    <a-icon :type="ic.value" style="margin-right: 8px;" />{{ ic.label }}
                  </a-select-option>
                </a-select>
              </a-col>
              <a-col v-if="form.icon" style="width: 36px; text-align: center;">
                <a-icon :type="form.icon" style="font-size: 22px; color: #1890ff;" />
              </a-col>
            </a-row>
          </a-form-model-item>

          <a-form-model-item label="排序" prop="sort_order">
            <a-input-number v-model="form.sort_order" :min="0" style="width: 100%;" />
          </a-form-model-item>

          <a-form-model-item label="描述" prop="description">
            <a-input v-model="form.description" placeholder="描述（可选）" />
          </a-form-model-item>
        </a-form-model>
      </a-modal>
    </div>
  </div>
  <page-layout v-else :noTitle="true">
    <div>
      <a-card :bordered="false" title="资产类型列表">
        <template #extra>
          <a-button type="primary" icon="plus" @click="handleAdd">新建类型</a-button>
        </template>

        <a-table
          :columns="columns"
          :data-source="dataSource"
          :loading="loading"
          :pagination="false"
          rowKey="id"
        >
          <span slot="type_code" slot-scope="text">
            <a-tag color="blue">{{ text }}</a-tag>
          </span>
          <span slot="monitor_type" slot-scope="text">
            <a-tag :color="getMonitorTypeColor(text)">{{ getMonitorTypeLabel(text) }}</a-tag>
          </span>
          <span slot="icon" slot-scope="text">
            <a-icon v-if="text" :type="text" style="font-size: 18px;" />
            <span v-else style="color: #ccc;">-</span>
          </span>
          <span slot="action" slot-scope="text, record">
            <a @click="handleEdit(record)" style="margin-right: 8px;">编辑</a>
            <a-popconfirm
              title="确认删除该资产类型？"
              ok-text="确认"
              cancel-text="取消"
              @confirm="handleDelete(record)"
            >
              <a style="color: #ff4d4f;">删除</a>
            </a-popconfirm>
          </span>
        </a-table>
      </a-card>

      <a-modal
        :title="modalTitle"
        :visible="modalVisible"
        :confirm-loading="modalLoading"
        @ok="handleSubmit"
        @cancel="handleCancel"
        width="520px"
      >
        <a-form-model
          ref="form"
          :model="form"
          :rules="rules"
          :label-col="{ span: 6 }"
          :wrapper-col="{ span: 16 }"
        >
          <a-form-model-item label="名称" prop="name">
            <a-input v-model="form.name" placeholder="请输入资产类型名称" />
          </a-form-model-item>

          <a-form-model-item label="类型代码" prop="type_code">
            <a-input
              v-model="form.type_code"
              placeholder="如: VM_LIN、HW_NET、HW_IPMI"
              :disabled="isEdit"
              @input="form.type_code = form.type_code.toUpperCase()"
            />
          </a-form-model-item>

          <a-form-model-item prop="monitor_type">
            <template #label>
              <span>监控类型
                <a-tooltip>
                  <template #title>
                    <div>Agent：Zabbix Agent，主机类设备</div>
                    <div>SNMP：SNMP轮询，网络设备/存储</div>
                    <div>IPMI：带外管理，物理服务器</div>
                    <div>JMX：Java监控，中间件/应用</div>
                  </template>
                  <a-icon type="question-circle" style="margin-left: 4px; color: #aaa;" />
                </a-tooltip>
              </span>
            </template>
            <a-select v-model="form.monitor_type" placeholder="请选择监控类型">
              <a-select-option value="agent">
                <a-icon type="desktop" style="margin-right: 6px;" />主机类（Agent）
              </a-select-option>
              <a-select-option value="snmp">
                <a-icon type="cluster" style="margin-right: 6px;" />网络/存储类（SNMP）
              </a-select-option>
              <a-select-option value="ipmi">
                <a-icon type="control" style="margin-right: 6px;" />物理服务器（IPMI）
              </a-select-option>
              <a-select-option value="jmx">
                <a-icon type="code" style="margin-right: 6px;" />中间件/应用（JMX）
              </a-select-option>
            </a-select>
          </a-form-model-item>

          <a-form-model-item label="图标" prop="icon">
            <a-row type="flex" align="middle" :gutter="8">
              <a-col flex="1">
                <a-select
                  v-model="form.icon"
                  placeholder="请选择图标"
                  show-search
                  option-filter-prop="label"
                  allow-clear
                  style="width: 100%;"
                >
                  <a-select-option
                    v-for="ic in iconOptions"
                    :key="ic.value"
                    :value="ic.value"
                    :label="ic.label"
                  >
                    <a-icon :type="ic.value" style="margin-right: 8px;" />{{ ic.label }}
                  </a-select-option>
                </a-select>
              </a-col>
              <a-col v-if="form.icon" style="width: 36px; text-align: center;">
                <a-icon :type="form.icon" style="font-size: 22px; color: #1890ff;" />
              </a-col>
            </a-row>
          </a-form-model-item>

          <a-form-model-item label="排序" prop="sort_order">
            <a-input-number v-model="form.sort_order" :min="0" style="width: 100%;" />
          </a-form-model-item>

          <a-form-model-item label="描述" prop="description">
            <a-input v-model="form.description" placeholder="描述（可选）" />
          </a-form-model-item>
        </a-form-model>
      </a-modal>
    </div>
  </page-layout>
</template>

<script>
import PageLayout from "@/layouts/PageLayout";
import { getAssetTypes, createAssetType, updateAssetType, deleteAssetType } from "@/services/admin";

const MONITOR_TYPE_MAP = {
  agent: { label: '主机类（Agent）',      color: 'green'  },
  snmp:  { label: '网络/存储类（SNMP）',   color: 'orange' },
  ipmi:  { label: '物理服务器（IPMI）',    color: 'purple' },
  jmx:   { label: '中间件/应用（JMX）',   color: 'blue'   },
};

const ICON_OPTIONS = [
  { value: 'desktop',         label: '主机/虚拟机' },
  { value: 'windows',         label: 'Windows' },
  { value: 'apple',           label: 'macOS' },
  { value: 'android',         label: 'Android' },
  { value: 'laptop',          label: '笔记本' },
  { value: 'cluster',         label: '集群/网络' },
  { value: 'global',          label: '互联网' },
  { value: 'wifi',            label: '无线网络' },
  { value: 'share-alt',       label: '交换机' },
  { value: 'branches',        label: '路由/分支' },
  { value: 'database',        label: '数据库/服务器' },
  { value: 'hdd',             label: '存储/磁盘' },
  { value: 'cloud',           label: '云' },
  { value: 'cloud-server',    label: '云服务器' },
  { value: 'deployment-unit', label: '容器/部署' },
  { value: 'api',             label: 'API/接口' },
  { value: 'code-sandbox',    label: '沙箱/虚拟化' },
  { value: 'control',         label: '控制器/IPMI' },
  { value: 'thunderbolt',     label: '电源设备' },
  { value: 'tool',            label: '工具/维护' },
  { value: 'safety',          label: '安全设备' },
  { value: 'fire',            label: '防火墙' },
  { value: 'printer',         label: '打印机' },
  { value: 'camera',          label: '摄像头' },
  { value: 'phone',           label: '电话/IP话机' },
  { value: 'tablet',          label: '终端/平板' },
  { value: 'code',            label: 'JMX/中间件' },
  { value: 'fund',            label: '监控/指标' },
];

export default {
  name: 'AssetType',
  components: { PageLayout },
  props: {
    embedded: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      loading: false,
      dataSource: [],
      iconOptions: ICON_OPTIONS,
      modalVisible: false,
      modalLoading: false,
      isEdit: false,
      editId: null,
      form: {
        name: '',
        type_code: '',
        monitor_type: 'agent',
        icon: undefined,
        sort_order: 0,
        description: '',
      },
      rules: {
        name:         [{ required: true, message: '请输入名称', trigger: 'blur' }],
        type_code:    [{ required: true, message: '请输入类型代码', trigger: 'blur' }],
        monitor_type: [{ required: true, message: '请选择监控类型', trigger: 'change' }],
      },
      columns: [
        { title: '图标', dataIndex: 'icon', key: 'icon', width: 60, scopedSlots: { customRender: 'icon' } },
        { title: '名称', dataIndex: 'name', key: 'name' },
        { title: '类型代码', dataIndex: 'type_code', key: 'type_code', scopedSlots: { customRender: 'type_code' } },
        { title: '监控类型', dataIndex: 'monitor_type', key: 'monitor_type', scopedSlots: { customRender: 'monitor_type' } },
        { title: '排序', dataIndex: 'sort_order', key: 'sort_order', width: 70 },
        { title: '描述', dataIndex: 'description', key: 'description', ellipsis: true },
        { title: '操作', key: 'action', width: 120, scopedSlots: { customRender: 'action' } },
      ],
    };
  },
  computed: {
    modalTitle() {
      return this.isEdit ? '编辑资产类型' : '新建资产类型';
    },
  },
  mounted() {
    this.loadData();
  },
  methods: {
    getMonitorTypeLabel(type) {
      return (MONITOR_TYPE_MAP[type] || {}).label || type || '-';
    },
    getMonitorTypeColor(type) {
      return (MONITOR_TYPE_MAP[type] || {}).color || 'default';
    },
    async loadData() {
      this.loading = true;
      try {
        const res = await getAssetTypes();
        const biz = (res && res.data) ? res.data : res;
        if (biz && biz.code === 200) {
          this.dataSource = biz.data || [];
        }
      } catch (e) {
        this.$message.error('加载资产类型失败');
      } finally {
        this.loading = false;
      }
    },
    handleAdd() {
      this.isEdit = false;
      this.editId = null;
      this.form = { name: '', type_code: '', monitor_type: 'agent', icon: undefined, sort_order: 0, description: '' };
      this.modalVisible = true;
      this.$nextTick(() => { this.$refs.form && this.$refs.form.clearValidate(); });
    },
    handleEdit(record) {
      this.isEdit = true;
      this.editId = record.id;
      this.form = {
        name:         record.name || '',
        type_code:    record.type_code || '',
        monitor_type: record.monitor_type || 'agent',
        icon:         record.icon || undefined,
        sort_order:   record.sort_order || 0,
        description:  record.description || '',
      };
      this.modalVisible = true;
      this.$nextTick(() => { this.$refs.form && this.$refs.form.clearValidate(); });
    },
    handleCancel() {
      this.modalVisible = false;
    },
    handleSubmit() {
      this.$refs.form.validate(async (valid) => {
        if (!valid) return;
        this.modalLoading = true;
        try {
          const payload = { ...this.form, icon: this.form.icon || '' };
          if (this.isEdit) {
            const res = await updateAssetType(this.editId, payload);
            const biz = (res && res.data) ? res.data : res;
            if (biz && biz.code === 200) {
              this.$message.success('更新成功');
              this.modalVisible = false;
              this.loadData();
            } else {
              this.$message.error((biz && biz.message) || '更新失败');
            }
          } else {
            const res = await createAssetType(payload);
            const biz = (res && res.data) ? res.data : res;
            if (biz && biz.code === 200) {
              this.$message.success('创建成功');
              this.modalVisible = false;
              this.loadData();
            } else {
              this.$message.error((biz && biz.message) || '创建失败');
            }
          }
        } catch (e) {
          this.$message.error('操作失败');
        } finally {
          this.modalLoading = false;
        }
      });
    },
    async handleDelete(record) {
      this.loading = true;
      try {
        const res = await deleteAssetType(record.id);
        const biz = (res && res.data) ? res.data : res;
        if (biz && biz.code === 200) {
          this.$message.success('删除成功');
          this.loadData();
        } else {
          this.$message.error((biz && biz.message) || '删除失败');
        }
      } catch (e) {
        this.$message.error('删除失败');
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>
