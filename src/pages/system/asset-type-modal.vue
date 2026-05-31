<template>
  <a-modal
    :title="title"
    :visible="visible"
    :confirm-loading="loading"
    @ok="$emit('ok')"
    @cancel="$emit('cancel')"
    width="540px"
  >
    <a-form-model
      ref="form"
      :model="form"
      :rules="rules"
      :label-col="{ span: 6 }"
      :wrapper-col="{ span: 16 }"
    >
      <a-form-model-item label="名称" prop="name">
        <a-input v-model="form.name" placeholder="请输入设备类型名称" />
      </a-form-model-item>

      <a-form-model-item label="类型代码" prop="type_code">
        <a-input
          v-model="form.type_code"
          placeholder="如：MY_DEV、IOT_SENSOR"
          :disabled="isEdit"
          @input="form.type_code = form.type_code.toUpperCase()"
        />
        <div v-if="!isEdit" style="font-size: 12px; color: #aaa; margin-top: 2px;">
          创建后不可修改，建议大写字母加下划线
        </div>
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
          <a-select-option value="agent"><a-icon type="desktop" style="margin-right: 6px;" />主机类（Agent）</a-select-option>
          <a-select-option value="snmp"><a-icon type="cluster" style="margin-right: 6px;" />网络/存储类（SNMP）</a-select-option>
          <a-select-option value="ipmi"><a-icon type="control" style="margin-right: 6px;" />物理服务器（IPMI）</a-select-option>
          <a-select-option value="jmx"><a-icon type="code" style="margin-right: 6px;" />中间件/应用（JMX）</a-select-option>
        </a-select>
      </a-form-model-item>

      <a-form-model-item prop="menu_group">
        <template #label>
          <span>所属分组
            <a-tooltip>
              <template #title>
                设备类型将显示在哪个导航菜单分组下，重新登录后生效
              </template>
              <a-icon type="question-circle" style="margin-left: 4px; color: #aaa;" />
            </a-tooltip>
          </span>
        </template>
        <a-select
          v-model="form.menu_group"
          placeholder="选择所属分组（不选则不显示在菜单中）"
          allow-clear
          :loading="groupsLoading"
        >
          <a-select-option
            v-for="g in groups"
            :key="g.group_key"
            :value="g.group_key"
          >
            <a-icon v-if="g.icon" :type="g.icon" style="margin-right: 6px;" />
            {{ g.name }}
            <a-tag v-if="g.is_builtin" color="orange" style="margin-left: 4px; font-size: 11px;">内置</a-tag>
          </a-select-option>
        </a-select>
        <div style="font-size: 12px; color: #aaa; margin-top: 2px;">
          可在"设备配置 → 设备分组"中新建自定义分组
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

      <a-form-model-item label="描述" prop="description">
        <a-input v-model="form.description" placeholder="描述（可选）" />
      </a-form-model-item>
    </a-form-model>
  </a-modal>
</template>

<script>
import { getAssetGroups } from '@/services/admin';

export default {
  name: 'AssetTypeModal',
  props: {
    visible:     { type: Boolean, required: true },
    title:       { type: String,  default: '设备类型' },
    loading:     { type: Boolean, default: false },
    isEdit:      { type: Boolean, default: false },
    form:        { type: Object,  required: true },
    iconOptions: { type: Array,   default: () => [] },
  },
  data() {
    return {
      groups: [],
      groupsLoading: false,
      rules: {
        name:         [{ required: true, message: '请输入名称', trigger: 'blur' }],
        type_code:    [{ required: true, message: '请输入类型代码', trigger: 'blur' }],
        monitor_type: [{ required: true, message: '请选择监控类型', trigger: 'change' }],
      },
    };
  },
  watch: {
    visible(val) {
      if (val) this.loadGroups();
    },
  },
  created() {
    this.loadGroups();
  },
  methods: {
    async loadGroups() {
      this.groupsLoading = true;
      try {
        const res = await getAssetGroups();
        const biz = res && res.data ? res.data : res;
        if (biz && biz.code === 200) this.groups = biz.data || [];
      } catch { /* silent */ }
      finally { this.groupsLoading = false; }
    },
  },
};
</script>
