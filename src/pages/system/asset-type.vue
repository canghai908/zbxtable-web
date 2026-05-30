<template>
  <div v-if="embedded">
    <a-card :bordered="false" title="资产类型列表">
      <template #extra>
        <a-button type="primary" icon="plus" @click="handleAdd">新建类型</a-button>
      </template>
      <asset-type-inner
        :data-source="dataSource"
        :loading="loading"
        :columns="columns"
        @edit="handleEdit"
        @delete="handleDelete"
        @config-fields="handleConfigFields"
      />
    </a-card>
    <asset-type-modal
      :visible="modalVisible"
      :title="modalTitle"
      :loading="modalLoading"
      :is-edit="isEdit"
      :form="form"
      :icon-options="iconOptions"
      @ok="handleSubmit"
      @cancel="handleCancel"
    />
    <asset-type-fields
      :visible="fieldDrawerVisible"
      :asset-type="currentAssetType"
      @close="fieldDrawerVisible = false"
      @saved="loadData"
    />
  </div>
  <page-layout v-else :noTitle="true">
    <a-card :bordered="false" title="资产类型列表">
      <template #extra>
        <a-button type="primary" icon="plus" @click="handleAdd">新建类型</a-button>
      </template>
      <asset-type-inner
        :data-source="dataSource"
        :loading="loading"
        :columns="columns"
        @edit="handleEdit"
        @delete="handleDelete"
        @config-fields="handleConfigFields"
      />
    </a-card>
    <asset-type-modal
      :visible="modalVisible"
      :title="modalTitle"
      :loading="modalLoading"
      :is-edit="isEdit"
      :form="form"
      :icon-options="iconOptions"
      @ok="handleSubmit"
      @cancel="handleCancel"
    />
    <asset-type-fields
      :visible="fieldDrawerVisible"
      :asset-type="currentAssetType"
      @close="fieldDrawerVisible = false"
      @saved="loadData"
    />
  </page-layout>
</template>

<script>
import PageLayout from "@/layouts/PageLayout";
import { getAssetTypes, createAssetType, updateAssetType, deleteAssetType } from "@/services/admin";
import AssetTypeTableInner from './asset-type-table.vue';
import AssetTypeModal from './asset-type-modal.vue';
import AssetTypeFields from './asset-type-fields.vue';

export const ICON_OPTIONS = [
  { value: 'desktop',         label: '主机/虚拟机' },
  { value: 'windows',         label: 'Windows' },
  { value: 'apple',           label: 'macOS' },
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
  components: {
    PageLayout,
    'asset-type-inner': AssetTypeTableInner,
    AssetTypeModal,
    AssetTypeFields,
  },
  props: {
    embedded: { type: Boolean, default: false },
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
      form: this.emptyForm(),
      fieldDrawerVisible: false,
      currentAssetType: null,
      columns: [
        { title: '图标',    dataIndex: 'icon',         key: 'icon',         width: 60,  scopedSlots: { customRender: 'icon' } },
        { title: '名称',    dataIndex: 'name',         key: 'name' },
        { title: '类型代码', dataIndex: 'type_code',    key: 'type_code',    scopedSlots: { customRender: 'type_code' } },
        { title: '监控类型', dataIndex: 'monitor_type', key: 'monitor_type', scopedSlots: { customRender: 'monitor_type' } },
        { title: '菜单位置', dataIndex: 'menu_group',   key: 'menu_group',   scopedSlots: { customRender: 'menu_group' } },
        { title: '排序',    dataIndex: 'sort_order',   key: 'sort_order',   width: 70 },
        { title: '描述',    dataIndex: 'description',  key: 'description',  ellipsis: true },
        { title: '操作',    key: 'action',                                   width: 220, scopedSlots: { customRender: 'action' } },
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
    emptyForm() {
      return { name: '', type_code: '', monitor_type: 'agent', icon: undefined, sort_order: 0, description: '', menu_group: 'custom' };
    },
    async loadData() {
      this.loading = true;
      try {
        const res = await getAssetTypes();
        const biz = res && res.data ? res.data : res;
        if (biz && biz.code === 200) this.dataSource = biz.data || [];
      } catch (e) {
        this.$message.error('加载资产类型失败');
      } finally {
        this.loading = false;
      }
    },
    handleAdd() {
      this.isEdit = false;
      this.editId = null;
      this.form = this.emptyForm();
      this.modalVisible = true;
    },
    handleEdit(record) {
      this.isEdit = true;
      this.editId = record.id;
      this.form = {
        name: record.name || '', type_code: record.type_code || '',
        monitor_type: record.monitor_type || 'agent', icon: record.icon || undefined,
        sort_order: record.sort_order || 0, description: record.description || '',
        menu_group: record.menu_group || '',
      };
      this.modalVisible = true;
    },
    handleCancel() {
      this.modalVisible = false;
    },
    async handleSubmit() {
      this.modalLoading = true;
      try {
        const payload = { ...this.form, icon: this.form.icon || '' };
        const res = await (this.isEdit ? updateAssetType(this.editId, payload) : createAssetType(payload));
        const biz = res && res.data ? res.data : res;
        if (biz && biz.code === 200) {
          this.$message.success(this.isEdit ? '更新成功' : '创建成功');
          this.modalVisible = false;
          this.loadData();
        } else {
          this.$message.error((biz && biz.message) || '操作失败');
        }
      } catch (e) {
        this.$message.error('操作失败');
      } finally {
        this.modalLoading = false;
      }
    },
    async handleDelete(record) {
      this.loading = true;
      try {
        const res = await deleteAssetType(record.id);
        const biz = res && res.data ? res.data : res;
        if (biz && biz.code === 200) { this.$message.success('删除成功'); this.loadData(); }
        else this.$message.error((biz && biz.message) || '删除失败');
      } catch (e) {
        this.$message.error('删除失败');
      } finally {
        this.loading = false;
      }
    },
    handleConfigFields(record) {
      this.currentAssetType = record;
      this.fieldDrawerVisible = true;
    },
  },
};
</script>
