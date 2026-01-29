<template>
  <page-layout>
    <div class="config-container">
      <a-card :bordered="false">
        <a-tabs v-model="activeTab" type="card">
          <!-- 系统配置 -->
          <a-tab-pane key="system" tab="系统配置">
            <a-form-model ref="systemForm" :model="systemForm" :label-col="{ span: 6 }" :wrapper-col="{ span: 14 }">
              <a-form-model-item v-for="item in systemConfigs" :key="item.id" :label="item.name">
                <a-input v-model="systemForm[item.key]" :placeholder="item.comment" />
                <div class="config-hint">{{ item.comment }}</div>
              </a-form-model-item>
              <a-form-model-item :wrapper-col="{ span: 14, offset: 6 }">
                <a-button type="primary" @click="saveCategory('system')" :loading="saveLoading">保存系统配置</a-button>
              </a-form-model-item>
            </a-form-model>
          </a-tab-pane>

          <!-- 邮件配置 -->
          <a-tab-pane key="email" tab="邮件配置">
            <a-form-model ref="emailForm" :model="emailForm" :label-col="{ span: 6 }" :wrapper-col="{ span: 14 }">
              <a-form-model-item v-for="item in emailConfigs" :key="item.id" :label="item.name">
                <a-input-password v-if="item.key === 'email_secret'" v-model="emailForm[item.key]" :placeholder="item.comment" />
                <a-input v-else v-model="emailForm[item.key]" :placeholder="item.comment" />
                <div class="config-hint">{{ item.comment }}</div>
              </a-form-model-item>
              <a-form-model-item :wrapper-col="{ span: 14, offset: 6 }">
                <a-button type="primary" @click="saveCategory('email')" :loading="saveLoading">保存邮件配置</a-button>
              </a-form-model-item>
            </a-form-model>
          </a-tab-pane>

          <!-- 企业微信配置 -->
          <a-tab-pane key="wechat" tab="企业微信配置">
            <a-form-model ref="wechatForm" :model="wechatForm" :label-col="{ span: 6 }" :wrapper-col="{ span: 14 }">
              <a-form-model-item v-for="item in wechatConfigs" :key="item.id" :label="item.name">
                <a-input-password v-if="item.key === 'wechat_secret'" v-model="wechatForm[item.key]" :placeholder="item.comment" />
                <a-input v-else v-model="wechatForm[item.key]" :placeholder="item.comment" />
                <div class="config-hint">{{ item.comment }}</div>
              </a-form-model-item>
              <a-form-model-item :wrapper-col="{ span: 14, offset: 6 }">
                <a-button type="primary" @click="saveCategory('wechat')" :loading="saveLoading">保存企业微信配置</a-button>
              </a-form-model-item>
            </a-form-model>
          </a-tab-pane>

          <!-- Ollama AI 配置 -->
          <a-tab-pane key="ollama" tab="Ollama AI 配置">
            <a-form-model ref="ollamaForm" :model="ollamaForm" :label-col="{ span: 6 }" :wrapper-col="{ span: 14 }">
              <a-form-model-item v-for="item in ollamaConfigs" :key="item.id" :label="item.name">
                <a-input v-model="ollamaForm[item.key]" :placeholder="item.comment" />
                <div class="config-hint">{{ item.comment }}</div>
              </a-form-model-item>
              <a-form-model-item :wrapper-col="{ span: 14, offset: 6 }">
                <a-button type="primary" @click="saveCategory('ollama')" :loading="saveLoading">保存 Ollama 配置</a-button>
              </a-form-model-item>
            </a-form-model>
          </a-tab-pane>
        </a-tabs>
      </a-card>
    </div>
  </page-layout>
</template>

<script>
import PageLayout from '@/layouts/PageLayout'
import { parseTimeFun } from '@/utils/formatter'
import { configGetList, configUpdate } from '@/services/admin'
export default {
  name: 'edit',
  i18n: require('./i18n'),
  components: { PageLayout },
  data() {
    return {
      loading: false,
      list: [],
      activeTab: 'system',
      systemForm: {},
      emailForm: {},
      wechatForm: {},
      ollamaForm: {},
      saveLoading: false
    }
  },
  computed: {
    systemConfigs() {
      return this.list.filter(item => 
        item.key === 'zbx_dash' || 
        item.key === 'dash_id' || 
        item.key === 'sync_inventory' ||
        item.key === 'webhook_url'
      )
    },
    emailConfigs() {
      return this.list.filter(item => 
        item.key && item.key.startsWith('email_')
      )
    },
    wechatConfigs() {
      return this.list.filter(item => 
        item.key && item.key.startsWith('wechat_')
      )
    },
    ollamaConfigs() {
      return this.list.filter(item => 
        item.key && item.key.startsWith('ollama_')
      )
    }
  },
  filters: {
    parsetime(v) {
      return parseTimeFun(v)
    }
  },
  created() {
    this.init()
  },
  methods: {
    init() {
      this.loading = true
      configGetList()
        .then((resp) => {
          let res = resp.data
          if (res.code == 200) {
            this.list = res.data.items || []
            this.initForms()
          }
        })
        .finally(() => {
          this.loading = false
        })
    },
    initForms() {
      // 初始化各个表单的数据
      this.systemConfigs.forEach(item => {
        this.$set(this.systemForm, item.key, item.value)
      })
      this.emailConfigs.forEach(item => {
        this.$set(this.emailForm, item.key, item.value)
      })
      this.wechatConfigs.forEach(item => {
        this.$set(this.wechatForm, item.key, item.value)
      })
      this.ollamaConfigs.forEach(item => {
        this.$set(this.ollamaForm, item.key, item.value)
      })
    },
    async saveCategory(category) {
      this.saveLoading = true
      try {
        let configs = []
        let form = {}
        
        switch(category) {
          case 'system':
            configs = this.systemConfigs
            form = this.systemForm
            break
          case 'email':
            configs = this.emailConfigs
            form = this.emailForm
            break
          case 'wechat':
            configs = this.wechatConfigs
            form = this.wechatForm
            break
          case 'ollama':
            configs = this.ollamaConfigs
            form = this.ollamaForm
            break
        }
        
        // 批量更新配置
        const promises = configs.map(item => {
          return configUpdate(item.id, { value: form[item.key] || '' })
        })
        
        await Promise.all(promises)
        this.$message.success('保存成功')
        this.init()
      } catch (error) {
        this.$message.error('保存失败')
      } finally {
        this.saveLoading = false
      }
    }
  }
}
</script>

<style lang="less" scoped>
.config-container {
  padding: 24px;
  background: #f0f2f5;
  min-height: calc(100vh - 200px);
}

.config-hint {
  color: #999;
  font-size: 12px;
  margin-top: 4px;
  line-height: 1.5;
}

/deep/ .ant-card {
  border-radius: 4px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
}

/deep/ .ant-tabs-card > .ant-tabs-content {
  margin-top: -16px;
}

/deep/ .ant-tabs-card > .ant-tabs-content > .ant-tabs-tabpane {
  background: #fff;
  padding: 24px;
}

/deep/ .ant-tabs-card > .ant-tabs-bar {
  border-color: #fff;
  margin-bottom: 0;
}

/deep/ .ant-tabs-card > .ant-tabs-bar .ant-tabs-tab {
  border-color: transparent;
  background: transparent;
  margin-right: 4px;
}

/deep/ .ant-tabs-card > .ant-tabs-bar .ant-tabs-tab-active {
  border-color: #fff;
  background: #fff;
  font-weight: 600;
}

/deep/ .ant-form-item {
  margin-bottom: 20px;
}

/deep/ .ant-input,
/deep/ .ant-input-password {
  border-radius: 4px;
}
</style>
