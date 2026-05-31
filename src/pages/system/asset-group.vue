<template>
  <div>
    <a-card :bordered="false" title="设备分组管理">
      <template #extra>
        <a-button type="primary" icon="plus" @click="handleAdd">新建分组</a-button>
      </template>

      <a-alert
        type="info"
        show-icon
        style="margin-bottom: 16px;"
        message="设备分组是导航菜单的一级分类。内置分组（主机管理/网络管理/硬件管理）不可删除，只能修改名称和图标。自定义类型会根据所属分组显示在对应的菜单下。"
      />

      <a-table
        :data-source="dataSource"
        :loading="loading"
        :pagination="false"
        row-key="id"
        :columns="columns"
      >
        <span slot="icon" slot-scope="text">
          <a-icon v-if="text" :type="text" style="font-size: 18px;" />
          <span v-else style="color: #ccc;">-</span>
        </span>
        <span slot="group_key" slot-scope="text">
          <a-tag color="blue">{{ text }}</a-tag>
        </span>
        <span slot="is_builtin" slot-scope="text">
          <a-tag v-if="text" color="orange">内置</a-tag>
          <a-tag v-else color="green">自定义</a-tag>
        </span>
        <span slot="action" slot-scope="text, record">
          <a @click="handleEdit(record)" style="margin-right: 8px;">编辑</a>
          <a-popconfirm
            v-if="!record.is_builtin"
            title="确认删除该分组？下挂的设备类型需先解除绑定。"
            ok-text="确认"
            cancel-text="取消"
            @confirm="handleDelete(record)"
          >
            <a style="color: #ff4d4f;">删除</a>
          </a-popconfirm>
          <span v-else style="color: #ccc; cursor: not-allowed;">删除</span>
        </span>
      </a-table>
    </a-card>

    <!-- 新建 / 编辑弹窗 -->
    <a-modal
      :title="isEdit ? '编辑分组' : '新建分组'"
      :visible="modalVisible"
      :confirm-loading="modalLoading"
      @ok="handleSubmit"
      @cancel="modalVisible = false"
      width="480px"
    >
      <a-form-model
        ref="form"
        :model="form"
        :rules="rules"
        :label-col="{ span: 6 }"
        :wrapper-col="{ span: 16 }"
      >
        <a-form-model-item label="分组名称" prop="name">
          <a-input v-model="form.name" placeholder="如：IoT设备、安全设备" />
        </a-form-model-item>

        <a-form-model-item label="分组标识" prop="group_key">
          <a-input
            v-model="form.group_key"
            placeholder="如：iot、security（唯一，创建后不可修改）"
            :disabled="isEdit"
            @input="form.group_key = form.group_key.toLowerCase().replace(/[^a-z0-9_]/g, '')"
          />
          <div v-if="!isEdit" style="font-size: 12px; color: #aaa; margin-top: 2px;">
            只允许小写字母、数字和下划线，创建后不可修改
          </div>
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
              <a-icon :type="form.icon" :style="{ fontSize: '22px', color: $themeColor }" />
            </a-col>
          </a-row>
        </a-form-model-item>

        <a-form-model-item label="排序" prop="sort_order">
          <a-input-number v-model="form.sort_order" :min="0" style="width: 100%;" />
        </a-form-model-item>
      </a-form-model>
    </a-modal>
  </div>
</template>

<script>
import { getAssetGroups, createAssetGroup, updateAssetGroup, deleteAssetGroup } from '@/services/admin';

const ICON_OPTIONS = [
  { value: 'appstore',        label: '应用/自定义' },
  { value: 'desktop',         label: '主机/虚拟机' },
  { value: 'hdd',             label: '存储/磁盘' },
  { value: 'cloud',           label: '云' },
  { value: 'database',        label: '数据库/服务器' },
  { value: 'cluster',         label: '集群/网络' },
  { value: 'wifi',            label: '无线/IoT' },
  { value: 'safety',          label: '安全设备' },
  { value: 'fire',            label: '防火墙' },
  { value: 'thunderbolt',     label: '电源设备' },
  { value: 'deployment-unit', label: '容器/部署' },
  { value: 'control',         label: '控制器' },
  { value: 'tool',            label: '工具/维护' },
  { value: 'global',          label: '互联网' },
  { value: 'camera',          label: '摄像头/视频' },
  { value: 'phone',           label: '电话/IP话机' },
  { value: 'printer',         label: '打印机' },
  { value: 'fund',            label: '监控/指标' },
  { value: 'environment',     label: '环境监控' },
  { value: 'api',             label: 'API/接口' },
];

export default {
  name: 'AssetGroup',
  data() {
    return {
      loading: false,
      dataSource: [],
      iconOptions: ICON_OPTIONS,
      modalVisible: false,
      modalLoading: false,
      isEdit: false,
      editId: null,
      form: { name: '', group_key: '', icon: undefined, sort_order: 0 },
      rules: {
        name:      [{ required: true, message: '请输入分组名称', trigger: 'blur' }],
        group_key: [
          { required: true, message: '请输入分组标识', trigger: 'blur' },
          { pattern: /^[a-z0-9_]+$/, message: '只允许小写字母、数字和下划线', trigger: 'blur' },
        ],
      },
      columns: [
        { title: '图标',   key: 'icon',       dataIndex: 'icon',       width: 60, scopedSlots: { customRender: 'icon' } },
        { title: '分组名称', key: 'name',       dataIndex: 'name' },
        { title: '分组标识', key: 'group_key',  dataIndex: 'group_key',  scopedSlots: { customRender: 'group_key' } },
        { title: '类型',   key: 'is_builtin', dataIndex: 'is_builtin', width: 80, scopedSlots: { customRender: 'is_builtin' } },
        { title: '排序',   key: 'sort_order', dataIndex: 'sort_order', width: 70 },
        { title: '操作',   key: 'action',                               width: 140, scopedSlots: { customRender: 'action' } },
      ],
    };
  },
  mounted() {
    this.loadData();
  },
  methods: {
    async loadData() {
      this.loading = true;
      try {
        const res = await getAssetGroups();
        const biz = res && res.data ? res.data : res;
        if (biz && biz.code === 200) this.dataSource = biz.data || [];
      } catch { this.$message.error('加载失败'); }
      finally { this.loading = false; }
    },
    handleAdd() {
      this.isEdit = false;
      this.editId = null;
      this.form = { name: '', group_key: '', icon: undefined, sort_order: 0 };
      this.modalVisible = true;
      this.$nextTick(() => this.$refs.form && this.$refs.form.clearValidate());
    },
    handleEdit(record) {
      this.isEdit = true;
      this.editId = record.id;
      this.form = { name: record.name, group_key: record.group_key, icon: record.icon || undefined, sort_order: record.sort_order || 0 };
      this.modalVisible = true;
      this.$nextTick(() => this.$refs.form && this.$refs.form.clearValidate());
    },
    handleSubmit() {
      this.$refs.form.validate(async (valid) => {
        if (!valid) return;
        this.modalLoading = true;
        try {
          const payload = { ...this.form, icon: this.form.icon || '' };
          const res = await (this.isEdit ? updateAssetGroup(this.editId, payload) : createAssetGroup(payload));
          const biz = res && res.data ? res.data : res;
          if (biz && biz.code === 200) {
            this.$message.success(this.isEdit ? '更新成功' : '创建成功');
            this.modalVisible = false;
            this.loadData();
          } else {
            this.$message.error((biz && biz.message) || '操作失败');
          }
        } catch { this.$message.error('操作失败'); }
        finally { this.modalLoading = false; }
      });
    },
    async handleDelete(record) {
      this.loading = true;
      try {
        const res = await deleteAssetGroup(record.id);
        const biz = res && res.data ? res.data : res;
        if (biz && biz.code === 200) { this.$message.success('删除成功'); this.loadData(); }
        else this.$message.error((biz && biz.message) || '删除失败');
      } catch { this.$message.error('删除失败'); }
      finally { this.loading = false; }
    },
  },
};
</script>
