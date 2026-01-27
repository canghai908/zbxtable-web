<template>
  <page-layout :noTitle="true">
    <a-form-model ref="ruleForm" :rules="rules" :model="form" :label-col="labelCol" :wrapper-col="wrapperCol">
      <a-form-model-item :label="$t('reportname')" prop="name">
        <a-input v-model="form.name" />
      </a-form-model-item>
      <a-form-model-item :label="$t('hosttype')" prop="hoststype">
        <a-select v-model="form.hoststype" :default-value="DefaultHostType" @change="handleChange">
          <a-select-option v-for="(item, index) in HostTypeList" :key="index" :value="item.value" :label="item.label">
            {{ item.label }}
          </a-select-option>
        </a-select>
      </a-form-model-item>
      <a-form-model-item :label="$t('host_selection')" prop="hostConfigs">
        <div v-for="(config, index) in form.hostConfigs" :key="index" style="margin-bottom: 16px; padding: 16px; border: 1px solid #d9d9d9; border-radius: 4px;">
          <a-row :gutter="16">
            <a-col :span="10">
              <a-select 
                v-model="config.host_id" 
                show-search 
                :placeholder="$t('select_host')"
                @popupScroll="handleHostPopupScroll" 
                @search="handleHostSearch" 
                option-filter-prop="label" 
                @change="handleHostChange(config, index)"
                style="width: 100%"
              >
                <a-select-option v-for="(host, idx) in curHostsList" :key="idx" :title="host.name" :label="host.name" :value="host.hostid">
                  {{ host.name }}
                </a-select-option>
              </a-select>
            </a-col>
            <a-col :span="12">
              <a-select 
                mode="multiple" 
                show-search 
                v-model="config.item_ids" 
                :placeholder="$t('select_items')"
                @popupScroll="handleItemPopupScroll" 
                @search="handleItemSearch" 
                option-filter-prop="label"
                style="width: 100%"
                :disabled="!config.host_id"
              >
                <a-select-option v-for="(item, idx) in curItemsList[index]" :key="idx" :label="item.name" :title="item.name" :value="item.itemid">
                  {{ item.name }}
                </a-select-option>
              </a-select>
            </a-col>
            <a-col :span="2">
              <a-button type="danger" icon="delete" @click="removeHostConfig(index)" :disabled="form.hostConfigs.length <= 1" />
            </a-col>
          </a-row>
        </div>
        <a-button type="dashed" @click="addHostConfig" style="width: 100%">
          <a-icon type="plus" />
          {{ $t('add_host_config') }}
        </a-button>
      </a-form-model-item>
      <a-form-model-item :label="$t('email')" prop="emails">
        <a-input v-model.trim="form.emails" :placeholder="$t('email_placeholder')" />
      </a-form-model-item>
      <a-form-model-item :label="$t('period')" prop="cycle">
        <a-checkbox-group v-model="form.cycle">
          <a-checkbox value="day" name="type">
            {{ $t('day') }}
          </a-checkbox>
          <a-checkbox value="week" name="type">
            {{ $t('week') }}
          </a-checkbox>
        </a-checkbox-group>
      </a-form-model-item>
      <a-form-model-item :label="$t('state')" prop="status">
        <a-switch :checked-children="$t('status_enabled')" :un-checked-children="$t('status_disabled')" defaultChecked v-model="form.status" />
      </a-form-model-item>
      <a-form-model-item :label="$t('description')">
        <a-input v-model="form.desc" type="textarea" :placeholder="$t('description_placeholder')" />
      </a-form-model-item>
      <a-form-model-item :wrapper-col="{ span: 12, offset: 8 }">
        <a-button type="primary" @click="onSubmit">
          {{ $t('save_btn') }}
        </a-button>
        <a-button style="margin-left: 10px;" @click="back">
          {{ $t('discard_btn') }}
        </a-button>
      </a-form-model-item>
    </a-form-model>
  </page-layout>
</template>
<script>
const selectSize = 30
import PageLayout from '@/layouts/PageLayout'
import { reportGetHosts, reportGetItems, reportAdd } from '@/services/admin'
const debounce = (func, delay = 60) => {
  let timer = null
  return function (...args) {
    clearTimeout(timer)
    timer = setTimeout(() => func.apply(this, args), delay)
  }
}
export default {
  name: 'hostAdd',
  i18n: require('./i18n'),
  components: { PageLayout },
  data() {
    return {
      labelCol: { span: 6 },
      wrapperCol: { span: 12 },
      HostTypeList: [
        {
          value: 'VM_WIN',
          label: this.$t('windows_device')
        },
        {
          value: 'VM_LIN',
          label: this.$t('linux_device')
        },
        {
          value: 'HW_SRV',
          label: this.$t('hardware_device')
        },
        {
          value: 'HW_NET',
          label: this.$t('network_device')
        }
      ],
      DefaultHostType: '',
      form: {
        name: '',
        hoststype: '',
        hostConfigs: [
          {
            host_id: '',
            item_ids: []
          }
        ],
        cycle: ['day'],
        status: '1',
        report_type: 'host',
        emails: '',
        desc: ''
      },
      HostsList: [],
      curHostsList: [],
      hostsFilterList: [],
      ItemsList: {}, // key: host_id, value: items list
      curItemsList: {}, // key: index, value: items list
      itemsFilterList: {}, // key: index, value: filtered items list
      rules: {
        name: [
          {
            required: true,
            message: this.$t('message_report_name'),
            trigger: 'blur'
          }
        ],
        hoststype: [
          {
            required: true,
            message: this.$t('message_host_type'),
            trigger: 'change'
          }
        ],
        hostConfigs: [
          {
            required: true,
            message: this.$t('message_host_config'),
            trigger: 'change',
            validator: (rule, value, callback) => {
              if (!value || value.length === 0) {
                callback(new Error(this.$t('message_host_config')))
                return
              }
              for (let config of value) {
                if (!config.host_id) {
                  callback(new Error(this.$t('message_host_required')))
                  return
                }
                if (!config.item_ids || config.item_ids.length === 0) {
                  callback(new Error(this.$t('message_items_required')))
                  return
                }
              }
              callback()
            }
          }
        ],
        emails: [
          {
            required: false,
            message: this.$t('message_email'),
            trigger: 'blur'
          }
        ],
        cycle: [
          {
            type: 'array',
            required: true,
            message: this.$t('message_reporting_period'),
            trigger: 'change'
          }
        ],
        status: [
          {
            required: true,
            message: this.$t('message_state'),
            trigger: 'change'
          }
        ]
      }
    }
  },
  methods: {
    onSubmit() {
      this.$refs.ruleForm.validate((valid) => {
        if (valid) {
          // 构建host_ids和item_ids JSON字符串
          const hostIds = JSON.stringify(this.form.hostConfigs.map(c => ({
            host_id: c.host_id,
            item_ids: c.item_ids
          })))
          const itemIds = JSON.stringify(this.form.hostConfigs.flatMap(c => c.item_ids))
          
          const params = {
            name: this.form.name,
            report_type: 'host',
            host_ids: hostIds,
            item_ids: itemIds,
            cycle: this.form.cycle.join(','),
            status: this.form.status ? '1' : '0',
            emails: this.form.emails,
            desc: this.form.desc
          }
          
          reportAdd(params).then((resp) => {
            let res = resp.data
            if (res.code == 200) {
              this.$message.success(this.$t('message_task_added'))
              this.$router.push('/report/hostReport')
            }
          })
        } else {
          return false
        }
      })
    },
    handleChange(e) {
      this.form.hoststype = e
      let params = {
        page: 1,
        limit: 10000,
        host_type: e
      }
      reportGetHosts(params).then((resp) => {
        let res = resp.data
        if (res.code == 200) {
          this.HostsList = res.data.items
          this.hostsFilterList = this.HostsList
          this.curHostsList = this.hostsFilterList.slice(0, selectSize)
        }
      })
    },
    handleHostChange(config, index) {
      if (!config.host_id) {
        this.$set(this.curItemsList, index, [])
        return
      }
      let params = {
        host_id: config.host_id
      }
      reportGetItems(params).then((resp) => {
        let res = resp.data
        if (res.code == 200) {
          this.$set(this.ItemsList, config.host_id, res.data.items)
          this.$set(this.itemsFilterList, index, res.data.items)
          this.$set(this.curItemsList, index, res.data.items.slice(0, selectSize))
        }
      })
    },
    addHostConfig() {
      this.form.hostConfigs.push({
        host_id: '',
        item_ids: []
      })
      const index = this.form.hostConfigs.length - 1
      this.$set(this.curItemsList, index, [])
    },
    removeHostConfig(index) {
      this.form.hostConfigs.splice(index, 1)
      // 清理对应的items列表
      delete this.curItemsList[index]
      // 重新索引
      const newItemsList = {}
      this.form.hostConfigs.forEach((config, idx) => {
        if (this.curItemsList[idx] !== undefined) {
          newItemsList[idx] = this.curItemsList[idx]
        }
      })
      this.curItemsList = newItemsList
    },
    handleHostPopupScroll: debounce(function () {
      const curLen = this.curHostsList.length
      const allLen = this.hostsFilterList.length
      if (curLen < allLen) {
        const nextPage = this.hostsFilterList.slice(curLen, curLen + selectSize)
        this.curHostsList = this.curHostsList.concat(nextPage)
      }
    }),
    handleHostSearch: debounce(function (value) {
      this.hostsFilterList = this.HostsList.filter((item) => {
        const reg = new RegExp(value, 'gi')
        const match = item.name.toString().match(reg)
        return match
      })
      this.curHostsList = this.hostsFilterList.slice(0, selectSize)
    }),
    handleItemPopupScroll: debounce(function (index) {
      const curLen = this.curItemsList[index] ? this.curItemsList[index].length : 0
      const allLen = this.itemsFilterList[index] ? this.itemsFilterList[index].length : 0
      if (curLen < allLen) {
        const nextPage = this.itemsFilterList[index].slice(curLen, curLen + selectSize)
        this.$set(this.curItemsList, index, [...(this.curItemsList[index] || []), ...nextPage])
      }
    }),
    handleItemSearch: debounce(function (value, index) {
      const hostConfig = this.form.hostConfigs[index]
      if (!hostConfig || !hostConfig.host_id) {
        return
      }
      const allItems = this.ItemsList[hostConfig.host_id] || []
      this.$set(this.itemsFilterList, index, allItems.filter((item) => {
        const reg = new RegExp(value, 'gi')
        const match = item.name.toString().match(reg)
        return match
      }))
      this.$set(this.curItemsList, index, this.itemsFilterList[index].slice(0, selectSize))
    }),
    back() {
      this.$router.push('/report/hostReport')
    }
  }
}
</script>
