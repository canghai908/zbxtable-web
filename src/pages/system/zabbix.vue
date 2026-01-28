<template>
  <page-layout :noTitle="true">
    <a-card title="Zabbix 管理" :bordered="false">
      <div style="margin-bottom: 12px; display: flex; gap: 8px;">
        <a-button type="primary" @click="openCreate">新增 Zabbix</a-button>
        <a-button @click="load">刷新</a-button>
      </div>

      <a-table :loading="loading" :columns="columns" :data-source="list" :rowKey="r => r.id">
        <template slot="user" slot-scope="text, record">
          <span v-if="!record.user || record.user === ''">-</span>
          <span v-else>{{ record.user }}</span>
        </template>
        <template slot="pass" slot-scope="text, record">
          <span v-if="!record.pass || record.pass === ''">-</span>
          <span v-else>
            <span v-if="!showPasswords[record.id]">******</span>
            <span v-else>{{ record.pass }}</span>
            <a-button 
              type="link" 
              size="small" 
              :icon="showPasswords[record.id] ? 'eye-invisible' : 'eye'"
              @click="togglePassword(record.id)"
              style="padding: 0 4px;"
            />
          </span>
        </template>
        <template slot="token" slot-scope="text, record">
          <span v-if="!record.token || record.token === ''">-</span>
          <span v-else>
            <span v-if="!showTokens[record.id]">******</span>
            <span v-else style="word-break: break-all;">{{ record.token }}</span>
            <a-button 
              type="link" 
              size="small" 
              :icon="showTokens[record.id] ? 'eye-invisible' : 'eye'"
              @click="toggleToken(record.id)"
              style="padding: 0 4px;"
            />
          </span>
        </template>
        <template slot="is_active" slot-scope="text, record">
          <a-tag v-if="record.is_active" color="green">当前</a-tag>
          <a-tag v-else>未选</a-tag>
        </template>
        <template slot="enabled" slot-scope="text, record">
          <a-tag v-if="record.enabled" color="blue">启用</a-tag>
          <a-tag v-else color="red">禁用</a-tag>
        </template>
        <template slot="conn" slot-scope="text, record">
          <a-tag v-if="record.enabled && record.last_test_ok" color="green">已连接</a-tag>
          <a-tag v-else-if="record.enabled && !record.last_test_ok" color="orange">未验证</a-tag>
          <a-tag v-else color="default">不可用</a-tag>
        </template>
        <template slot="version" slot-scope="text, record">
          <span>{{ record.version || '-' }}</span>
        </template>
        <template slot="operation" slot-scope="text, record">
          <a-button type="link" size="small" :disabled="record.is_active" @click="activate(record)">设为当前</a-button>

          <a-button type="link" size="small" @click="test(record)">测试</a-button>
          <a-divider type="vertical" />
          <a-button type="link" size="small" :disabled="record.is_active && record.enabled" @click="toggleEnabled(record)">{{ record.enabled ? '禁用' : '启用' }}</a-button>
          <a-divider type="vertical" />
          <a-button type="link" size="small" @click="openEdit(record)">编辑</a-button>
          <a-divider type="vertical" />
          <a-popconfirm title="确定要删除这个 Zabbix 吗？" okText="确定" cancelText="取消" @confirm="remove(record)">
            <a-button type="link" size="small" style="color:#f5222d;">删除</a-button>
          </a-popconfirm>
        </template>
      </a-table>
    </a-card>

    <a-modal title="新增 Zabbix" :visible="createVisible" @ok="create" @cancel="createVisible=false" :confirmLoading="creating" :okButtonProps="{ disabled: !createTestOk }">
      <a-form-model :model="form" :label-col="{span: 6}" :wrapper-col="{span: 16}">
        <a-form-model-item label="名称" required>
          <a-input v-model="form.name" placeholder="例如：生产Zabbix" />
        </a-form-model-item>
        <a-form-model-item label="Web URL" required>
          <a-input v-model="form.web_url" placeholder="http://zabbix.example.com" />
        </a-form-model-item>
        <a-form-model-item label="用户">
          <a-input v-model="form.user" placeholder="可选（token优先）" />
        </a-form-model-item>
        <a-form-model-item label="密码">
          <a-input-password v-model="form.pass" placeholder="可选（token优先）" />
        </a-form-model-item>
        <a-form-model-item label="Token">
          <a-input v-model="form.token" placeholder="可选" />
        </a-form-model-item>
        <a-form-model-item :wrapper-col="{ span: 16, offset: 6 }">
          <a-button :loading="createTesting" @click="testCreate">测试连接</a-button>
          <span v-if="createTestMsg" :style="{ marginLeft: '12px', color: createTestOk ? '#52c41a' : '#f5222d' }">
            {{ createTestMsg }}
          </span>
          <div style="margin-top: 6px; color: #999; font-size: 12px;">
            需要先“测试连接”成功，才允许添加。
          </div>
        </a-form-model-item>
      </a-form-model>
    </a-modal>

    <a-modal title="编辑 Zabbix" :visible="editVisible" @ok="saveEdit" @cancel="editVisible=false" :confirmLoading="editing" :okButtonProps="{ disabled: !editTestOk }">
      <a-form-model :model="editForm" :label-col="{span: 6}" :wrapper-col="{span: 16}">
        <a-form-model-item label="名称" required>
          <a-input v-model="editForm.name" />
        </a-form-model-item>
        <a-form-model-item label="Web URL" required>
          <a-input v-model="editForm.web_url" />
        </a-form-model-item>
        <a-form-model-item label="用户">
          <a-input v-model="editForm.user" placeholder="可选（token优先）" />
        </a-form-model-item>
        <a-form-model-item label="密码">
          <a-input-password v-model="editForm.pass" placeholder="可选（token优先）" />
        </a-form-model-item>
        <a-form-model-item label="Token">
          <a-input v-model="editForm.token" placeholder="可选" />
        </a-form-model-item>
        <a-form-model-item label="启用">
          <a-switch v-model="editForm.enabled" />
        </a-form-model-item>
        <a-form-model-item :wrapper-col="{ span: 16, offset: 6 }">
          <a-button :loading="editTesting" @click="testEdit">测试连接</a-button>
          <span v-if="editTestMsg" :style="{ marginLeft: '12px', color: editTestOk ? '#52c41a' : '#f5222d' }">
            {{ editTestMsg }}
          </span>
          <div style="margin-top: 6px; color: #999; font-size: 12px;">
            编辑后需要先“测试连接”成功，才允许保存。
          </div>
        </a-form-model-item>
      </a-form-model>
    </a-modal>
  </page-layout>
</template>

<script>
import PageLayout from '@/layouts/PageLayout'
import { listZabbixInstances, createZabbixInstance, activateZabbixInstance, testZabbixConfig, testZabbixInstance, setZabbixInstanceEnabled, updateZabbixInstance, deleteZabbixInstance } from '@/services/zabbix'

export default {
  name: 'SystemZabbix',
  components: { PageLayout },
  data () {
    return {
      loading: false,
      creating: false,
      createVisible: false,
      createTesting: false,
      createTestOk: false,
      createTestMsg: '',
      editVisible: false,
      editing: false,
      editTesting: false,
      editTestOk: false,
      editTestMsg: '',
      editId: null,
      list: [],
      showPasswords: {}, // 记录每个实例的密码是否显示
      showTokens: {}, // 记录每个实例的token是否显示
      form: { name: '', web_url: '', user: '', pass: '', token: '' },
      editForm: { name: '', web_url: '', user: '', pass: '', token: '', enabled: true },
      columns: [
        { title: 'ID', dataIndex: 'id', key: 'id', width: 80 },
        { title: '名称', dataIndex: 'name', key: 'name', width: 150 },
        { title: 'Web URL', dataIndex: 'web_url', key: 'web_url', width: 200 },
        { title: '用户名', dataIndex: 'user', key: 'user', scopedSlots: { customRender: 'user' }, width: 120 },
        { title: '密码', dataIndex: 'pass', key: 'pass', scopedSlots: { customRender: 'pass' }, width: 120 },
        { title: 'Token', dataIndex: 'token', key: 'token', scopedSlots: { customRender: 'token' }, width: 150 },
        { title: '版本', dataIndex: 'version', key: 'version', scopedSlots: { customRender: 'version' }, width: 110 },
        { title: '连接', dataIndex: 'conn', key: 'conn', scopedSlots: { customRender: 'conn' }, width: 110 },
        { title: '启用', dataIndex: 'enabled', key: 'enabled', scopedSlots: { customRender: 'enabled' }, width: 90 },
        { title: '当前', dataIndex: 'is_active', key: 'is_active', scopedSlots: { customRender: 'is_active' }, width: 90 },
        { title: '操作', dataIndex: 'operation', key: 'operation', scopedSlots: { customRender: 'operation' }, width: 240 }
      ]
    }
  },
  mounted () {
    this.load()
  },
  methods: {
    togglePassword (id) {
      this.$set(this.showPasswords, id, !this.showPasswords[id])
    },
    toggleToken (id) {
      this.$set(this.showTokens, id, !this.showTokens[id])
    },
    async load () {
      this.loading = true
      try {
        const res = await listZabbixInstances()
        const biz = (res && res.data) ? res.data : res
        if (biz && biz.code === 200) {
          this.list = biz.data || []
          // 重置显示状态
          this.showPasswords = {}
          this.showTokens = {}
        } else {
          this.$message.error((biz && biz.message) || '加载失败')
        }
      } finally {
        this.loading = false
      }
    },
    openCreate () {
      this.form = { name: '', web_url: '', user: '', pass: '', token: '' }
      this.createTestOk = false
      this.createTestMsg = ''
      this.createVisible = true
    },
    openEdit (record) {
      this.editId = record.id
      this.editForm = {
        name: record.name || '',
        web_url: record.web_url || '',
        user: record.user || '',
        pass: record.pass || '',
        token: record.token || '',
        enabled: !!record.enabled
      }
      this.editTestOk = false
      this.editTestMsg = ''
      this.editVisible = true
    },
    async testCreate () {
      if (!this.form.web_url) {
        this.$message.warning('请先填写 Web URL')
        return
      }
      this.createTesting = true
      this.createTestOk = false
      this.createTestMsg = ''
      try {
        const res = await testZabbixConfig(this.form)
        const biz = (res && res.data) ? res.data : res
        const ok = biz && biz.code === 200 && biz.data && biz.data.success
        if (ok) {
          this.createTestOk = true
          this.createTestMsg = `连接成功，版本：${biz.data.version || '-'}`
        } else {
          this.createTestOk = false
          this.createTestMsg = (biz && biz.message) || '连接失败'
        }
      } finally {
        this.createTesting = false
      }
    },
    async create () {
      if (!this.form.name || !this.form.web_url) {
        this.$message.warning('请填写名称和 Web URL')
        return
      }
      if (!this.createTestOk) {
        this.$message.warning('请先测试连接成功')
        return
      }
      this.creating = true
      try {
        const res = await createZabbixInstance(this.form)
        const biz = (res && res.data) ? res.data : res
        if (biz && biz.code === 200) {
          this.$message.success('创建成功')
          this.createVisible = false
          await this.load()
        } else {
          this.$message.error((biz && biz.message) || '创建失败')
        }
      } finally {
        this.creating = false
      }
    },
    async test (record) {
      const res = await testZabbixInstance(record.id)
      const biz = (res && res.data) ? res.data : res
      if (biz && biz.code === 200 && biz.data && biz.data.success) {
        this.$message.success(`连接成功，版本：${biz.data.version || '-'}`)
        await this.load()
      } else {
        this.$message.error((biz && biz.message) || '连接失败')
        await this.load()
      }
    },
    async toggleEnabled (record) {
      const target = !record.enabled
      const res = await setZabbixInstanceEnabled(record.id, target)
      const biz = (res && res.data) ? res.data : res
      if (biz && biz.code === 200) {
        this.$message.success(target ? '已启用' : '已禁用')
        await this.load()
      } else {
        this.$message.error((biz && biz.message) || '操作失败')
      }
    },
    async activate (record) {
      const res = await activateZabbixInstance(record.id)
      const biz = (res && res.data) ? res.data : res
      if (biz && biz.code === 200) {
        this.$message.success('已切换当前 Zabbix')
        await this.load()
      } else {
        this.$message.error((biz && biz.message) || '切换失败')
      }
    }
    ,
    async testEdit () {
      if (!this.editForm.web_url) {
        this.$message.warning('请先填写 Web URL')
        return
      }
      this.editTesting = true
      this.editTestOk = false
      this.editTestMsg = ''
      try {
        const res = await testZabbixConfig(this.editForm)
        const biz = (res && res.data) ? res.data : res
        const ok = biz && biz.code === 200 && biz.data && biz.data.success
        if (ok) {
          this.editTestOk = true
          this.editTestMsg = `连接成功，版本：${biz.data.version || '-'}`
        } else {
          this.editTestOk = false
          this.editTestMsg = (biz && biz.message) || '连接失败'
        }
      } finally {
        this.editTesting = false
      }
    },
    async saveEdit () {
      if (!this.editId) return
      if (!this.editForm.name || !this.editForm.web_url) {
        this.$message.warning('请填写名称和 Web URL')
        return
      }
      if (!this.editTestOk) {
        this.$message.warning('请先测试连接成功')
        return
      }
      this.editing = true
      try {
        const res = await updateZabbixInstance(this.editId, this.editForm)
        const biz = (res && res.data) ? res.data : res
        if (biz && biz.code === 200) {
          this.$message.success('更新成功')
          this.editVisible = false
          await this.load()
        } else {
          this.$message.error((biz && biz.message) || '更新失败')
        }
      } finally {
        this.editing = false
      }
    },
    async remove (record) {
      const res = await deleteZabbixInstance(record.id)
      const biz = (res && res.data) ? res.data : res
      if (biz && biz.code === 200) {
        this.$message.success('删除成功')
        await this.load()
      } else {
        this.$message.error((biz && biz.message) || '删除失败')
      }
    }
  }
}
</script>

