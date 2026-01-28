<template>
  <page-layout :noTitle="true">
    <a-card title="Zabbix 租户绑定" :bordered="false">
      <div style="margin-bottom: 12px; display: flex; gap: 8px; align-items: center;">
        <a-button type="primary" @click="openCreate">新增绑定</a-button>
        <a-button @click="load">刷新</a-button>
      </div>

      <a-table :loading="loading" :columns="columns" :data-source="list" :rowKey="r => r.id">
        <template slot="enabled" slot-scope="text, record">
          <a-tag v-if="record.enabled" color="blue">启用</a-tag>
          <a-tag v-else color="red">禁用</a-tag>
        </template>
        <template slot="zabbix" slot-scope="text, record">
          <span>{{ zabbixName(record.zabbix_instance_id) }}</span>
        </template>
        <template slot="operation" slot-scope="text, record">
          <a-button type="link" size="small" @click="openEdit(record)">编辑</a-button>
          <a-divider type="vertical" />
          <a-popconfirm title="确定要删除这个绑定吗？" okText="确定" cancelText="取消" @confirm="remove(record)">
            <a-button type="link" size="small" style="color:#f5222d;">删除</a-button>
          </a-popconfirm>
        </template>
      </a-table>
    </a-card>

    <a-modal :title="editingId ? '编辑绑定' : '新增绑定'" :visible="visible" @ok="save" @cancel="visible=false" :confirmLoading="saving">
      <a-form-model :model="form" :label-col="{span: 7}" :wrapper-col="{span: 15}">
        <a-form-model-item label="租户" required>
          <a-input v-model="form.tenant_id" placeholder="ZBX-TenantID" :disabled="!!editingId" />
        </a-form-model-item>
        <a-form-model-item label="Zabbix 连接" required>
          <a-select v-model="form.zabbix_instance_id" style="width: 100%" placeholder="选择 Zabbix 连接">
            <a-select-option v-for="z in zabbixList" :key="z.id" :value="z.id">{{ z.name }}</a-select-option>
          </a-select>
        </a-form-model-item>
        <a-form-model-item label="Token">
          <a-input-password v-model="form.token" placeholder="该租户对应的 Token" />
          <div style="margin-top: 6px; color:#999; font-size:12px;">
            若填写 token，将用于 /v1/receive 按租户校验 Token；未配置则回退全局 token（兼容旧逻辑）。
          </div>
        </a-form-model-item>
        <a-form-model-item label="启用">
          <a-switch v-model="form.enabled" />
        </a-form-model-item>
      </a-form-model>
    </a-modal>
  </page-layout>
</template>

<script>
import PageLayout from '@/layouts/PageLayout'
import { listZabbixInstances } from '@/services/zabbix'
import { listZabbixTenantBindings, upsertZabbixTenantBinding, deleteZabbixTenantBinding } from '@/services/zabbixTenant'

export default {
  name: 'SystemZabbixTenant',
  components: { PageLayout },
  data () {
    return {
      loading: false,
      saving: false,
      visible: false,
      editingId: null,
      list: [],
      zabbixList: [],
      form: { tenant_id: '', zabbix_instance_id: undefined, token: '', enabled: true },
      columns: [
        { title: 'ID', dataIndex: 'id', key: 'id', width: 80 },
        { title: '租户', dataIndex: 'tenant_id', key: 'tenant_id' },
        { title: 'Zabbix 连接', key: 'zabbix', scopedSlots: { customRender: 'zabbix' } },
        { title: '启用', key: 'enabled', scopedSlots: { customRender: 'enabled' }, width: 90 },
        { title: '操作', key: 'operation', scopedSlots: { customRender: 'operation' }, width: 160 }
      ]
    }
  },
  mounted () {
    this.load()
  },
  methods: {
    zabbixName (id) {
      const z = (this.zabbixList || []).find(x => x.id === id)
      return z ? z.name : (id ? `#${id}` : '-')
    },
    async load () {
      this.loading = true
      try {
        const [zres, res] = await Promise.all([listZabbixInstances(), listZabbixTenantBindings()])
        const zbiz = (zres && zres.data) ? zres.data : zres
        if (zbiz && zbiz.code === 200) this.zabbixList = zbiz.data || []

        const biz = (res && res.data) ? res.data : res
        if (biz && biz.code === 200) this.list = biz.data || []
      } finally {
        this.loading = false
      }
    },
    openCreate () {
      this.editingId = null
      this.form = { tenant_id: '', zabbix_instance_id: undefined, token: '', enabled: true }
      this.visible = true
    },
    openEdit (record) {
      this.editingId = record.id
      this.form = {
        tenant_id: record.tenant_id || '',
        zabbix_instance_id: record.zabbix_instance_id,
        token: record.token || '',
        enabled: !!record.enabled
      }
      this.visible = true
    },
    async save () {
      if (!this.form.tenant_id || !this.form.zabbix_instance_id) {
        this.$message.warning('请填写租户并选择 Zabbix 连接')
        return
      }
      this.saving = true
      try {
        const res = await upsertZabbixTenantBinding(this.form)
        const biz = (res && res.data) ? res.data : res
        if (biz && biz.code === 200) {
          this.$message.success('保存成功')
          this.visible = false
          await this.load()
        } else {
          this.$message.error((biz && biz.message) || '保存失败')
        }
      } finally {
        this.saving = false
      }
    },
    async remove (record) {
      const res = await deleteZabbixTenantBinding(record.id)
      const biz = (res && res.data) ? res.data : res
      if (biz && biz.code === 200) {
        this.$message.success('已删除')
        await this.load()
      } else {
        this.$message.error((biz && biz.message) || '删除失败')
      }
    }
  }
}
</script>


