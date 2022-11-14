<template>
  <page-layout :title="title">
    <div>
      <a-card :bordered="false">
        <a-form>
          <!-- 主机组 -->
          <a-form-item :label="$t('group')" :labelCol="{span: 7}" :wrapperCol="{span: 10}">
            <a-select mode="multiple" show-search optionFilterProp="label" style="width: 100%" v-model="system.group_id" :placeholder="$t('groupselect')" option-label-prop="label" @change="handleGroupChange">
              <a-select-option v-for="(item, index) in grouplist" :key="index" :value="item.groupid" :label="item.name" :title="item.groupid">
                {{ item.name }}
              </a-select-option>
            </a-select>
          </a-form-item>
          <!-- Uptime -->
          <a-form-item :label="$t('uptime')" :labelCol="{span: 7}" :wrapperCol="{span: 10}" :required="false">
            <a-select style="width: 50%" show-search optionFilterProp="label" :placeholder="$t('template_select')" option-label-prop="label" @change="handlUptimeTempChange">
              <a-select-option v-for="(item, index) in templateList" :key="index" :value="item.templateid" :label="item.name" :title="item.name">
                {{ item.name }}
              </a-select-option>
            </a-select>
            <a-select mode="multiple" style="width: 50%" v-model="system.uptime_id" show-search optionFilterProp="label" :placeholder="$t('item_select')" option-label-prop="label" @change="handleUptimeItemChange">
              <a-select-option v-for="(item, index) in itemList" :key="index" :value="item.itemid" :label="item.name" :title="item.name">
                {{ item.name }}
              </a-select-option>
            </a-select>
          </a-form-item>
          <!-- 设备型号 -->
          <a-form-item v-if="system.id==3 ||system.id==4" :label="$t('model')" :labelCol="{span: 7}" :wrapperCol="{span: 10}" :required="false">
            <a-select style="width: 50%" show-search optionFilterProp="label" :placeholder="$t('template_select')" option-label-prop="label" @change="handlModelTempChange">
              <a-select-option v-for="(item, index) in templateList" :key="index" :value="item.templateid" :label="item.name" :title="item.name">
                {{ item.name }}
              </a-select-option>
            </a-select>
            <a-select mode="multiple" style="width: 50%" show-search optionFilterProp="label" v-model="system.model" :placeholder="$t('item_select')" option-label-prop="label" @change="handleModelItemChange">
              <a-select-option v-for="(item, index) in itemList" :key="index" :value="item.itemid" :label="item.name" :title="item.name">
                {{ item.name }}
              </a-select-option>
            </a-select>
          </a-form-item>
          <!-- cpu core -->
          <a-form-item :label="$t('cpu_core')" :labelCol="{span: 7}" :wrapperCol="{span: 10}" :required="false">
            <a-select style="width: 50%" show-search optionFilterProp="label" :placeholder="$t('template_select')" option-label-prop="label" @change="handlCPUCoreTempChange">
              <a-select-option v-for="(item, index) in templateList" :key="index" :value="item.templateid" :label="item.name" :title="item.name">
                {{ item.name }}
              </a-select-option>
            </a-select>
            <a-select mode="multiple" style="width: 50%" show-search optionFilterProp="label" v-model="system.cpu_core" :placeholder="$t('item_select')" option-label-prop="label" @change="handleCPUCoreItemChange">
              <a-select-option v-for="(item, index) in itemList" :key="index" :value="item.itemid" :label="item.name" :title="item.name">
                {{ item.name }}
              </a-select-option>
            </a-select>
          </a-form-item>
          <!-- cpu util -->
          <a-form-item :label="$t('cpu_uti')" :labelCol="{span: 7}" :wrapperCol="{span: 10}">
            <a-select style="width: 50%" show-search optionFilterProp="label" :placeholder="$t('template_select')" option-label-prop="label" @change="handlCPUTempChange">
              <a-select-option v-for="(item, index) in templateList" :key="index" :value="item.templateid" :label="item.name" :title="item.name">
                {{ item.name }}
              </a-select-option>
            </a-select>
            <a-select mode="multiple" style="width: 50%" show-search optionFilterProp="label" v-model="system.cpu_utilization_id" :placeholder="$t('item_select')" option-label-prop="label" @change="handleCPUtiItemChange">
              <a-select-option v-for="(item, index) in itemList" :key="index" :value="item.itemid" :label="item.name" :title="item.name">
                {{ item.name }}
              </a-select-option>
            </a-select>
          </a-form-item>
          <!-- MemoryUtilization  -->
          <a-form-item :label="$t('mem_uti')" :labelCol="{span: 7}" :wrapperCol="{span: 10}">
            <a-select style="width: 50%" show-search optionFilterProp="label" :placeholder="$t('template_select')" option-label-prop="label" @change="handlMemUtiTempChange">
              <a-select-option v-for="(item, index) in templateList" :key="index" :value="item.templateid" :label="item.name" :title="item.name">
                {{ item.name }}
              </a-select-option>
            </a-select>
            <a-select mode="multiple" style="width: 50%" show-search optionFilterProp="label" v-model="system.memory_utilization_id" :placeholder="$t('item_select')" option-label-prop="label" @change="handleMemUtiItemChange">
              <a-select-option v-for="(item, index) in itemList" :key="index" :value="item.itemid" :label="item.name" :title="item.name">
                {{ item.name }}
              </a-select-option>
            </a-select>
          </a-form-item>
          <!-- MemoryUsed  -->
          <!-- <a-form-item :label="$t('mem_used')" :labelCol="{span: 7}" :wrapperCol="{span: 10}">
            <a-select style="width: 50%" :placeholder="$t('template_select')" option-label-prop="label" @change="handlMemUsedTempChange">
              <a-select-option v-for="(item, index) in templateList" :key="index" :value="item.templateid" :label="item.name" :title="item.name">
                {{ item.name }}
              </a-select-option>
            </a-select>
            <a-select mode="multiple" style="width: 50%" show-search optionFilterProp="label" v-model="system.memory_used_id" :placeholder="$t('item_select')" option-label-prop="label" @change="handleMemUsedItemChange">
              <a-select-option v-for="(item, index) in itemList" :key="index" :value="item.itemid" :label="item.name" :title="item.name">
                {{ item.name }}
              </a-select-option>
            </a-select>
          </a-form-item> -->
          <!-- MemoryTotal -->
          <a-form-item :label="$t('mem_total')" :labelCol="{span: 7}" :wrapperCol="{span: 10}" :required="false">
            <a-select style="width: 50%" show-search optionFilterProp="label" :placeholder="$t('template_select')" option-label-prop="label" @change="handlMemTotalTempChange">
              <a-select-option v-for="(item, index) in templateList" :key="index" :value="item.templateid" :label="item.name" :title="item.name">
                {{ item.name }}
              </a-select-option>
            </a-select>
            <a-select mode="multiple" style="width: 50%" show-search optionFilterProp="label" v-model="system.memory_total_id" :placeholder="$t('item_select')" option-label-prop="label" @change="handleMemTotalItemChange">
              <a-select-option v-for="(item, index) in itemList" :key="index" :value="item.itemid" :label="item.name" :title="item.name">
                {{ item.name }}
              </a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item style="margin-top: 24px" :wrapperCol="{span: 10, offset: 7}">
            <a-button style="margin-left: 150px" @click="back">{{$t('back')}}</a-button>
            <a-button style="margin-left: 20px" type="primary" @click="saveData">{{$t('save')}}</a-button>
          </a-form-item>
        </a-form>
      </a-card>
    </div>
  </page-layout>
</template>

<script>
import PageLayout from "@/layouts/PageLayout";
import { systemInfo, hostgroupList, templateList, templateGetItemList, systemUpdate } from "@/services/admin";
export default {
  name: 'edit',
  i18n: require('./i18n'),
  components: { PageLayout, },
  data() {
    return {
      loading: false,
      grouplist: [],
      templateList: [],
      itemList: [],
      id: '',
      system: {
        group_id: '',
        uptime_id: '',
        model: '',
        cpu_core: '',
        cpu_utilization_id: '',
        memory_utilization_id: '',
        memory_used_id: '',
        memory_total_id: '',
      },
      title: ''
    }
  },
  created() {
    this.id = this.$route.query.id || ""
    this.init(this.id)
  },
  methods: {
    init() {
      this.loading = true
      systemInfo(this.id).then((resp) => {
        let res = resp.data
        if (res.code == 200) {
          this.title = res.data.items.name
          this.system = res.data.items || []
          if (this.system.group_id != '') {
            this.system.group_id = this.system.group_id.split(',')
          } else {
            this.system.group_id = []
          }
          if (this.system.uptime_id != '') {
            this.system.uptime_id = this.system.uptime_id.split(',')
          } else {
            this.system.uptime_id = []
          }
          if (this.system.model != '') {
            this.system.model = this.system.model.split(',')
          } else {
            this.system.model = []
          }
          if (this.system.cpu_core != '') {
            this.system.cpu_core = this.system.cpu_core.split(',')
          } else {
            this.system.cpu_core = []
          }
          if (this.system.cpu_utilization_id != '') {
            this.system.cpu_utilization_id = this.system.cpu_utilization_id.split(',')
          } else {
            this.system.cpu_utilization_id = []
          }
          if (this.system.memory_utilization_id != '') {
            this.system.memory_utilization_id = this.system.memory_utilization_id.split(',')
          } else {
            this.system.memory_utilization_id = []
          }
          if (this.system.memory_used_id != '') {
            this.system.memory_used_id = this.system.memory_used_id.split(',')
          } else {
            this.system.memory_used_id = []
          }
          if (this.system.memory_total_id != '') {
            this.system.memory_total_id = this.system.memory_total_id.split(',')
          } else {
            this.system.memory_total_id = []
          }
        }
      }).finally(() => { this.loading2 = false })
      hostgroupList().then((resp) => {
        let res = resp.data
        if (res.code == 200) {
          this.grouplist = res.data.items || []
        }
      }).finally(() => { this.loading2 = false })
      templateList().then((resp) => {
        let res = resp.data
        if (res.code == 200) {
          this.templateList = res.data.items || []
        }
      }).finally(() => { this.loading2 = false })
    },
    handleGroupChange(value) {
      this.system.group_id = value
    },
    handlUptimeTempChange(value) {
      templateGetItemList(value).then((resp) => {
        let res = resp.data
        if (res.code == 200) {
          this.itemList = res.data.items[0].items || []
        }
      })
    },
    handleUptimeItemChange(value) {
      this.system.uptime_id = value
    },
    handlCPUTempChange(value) {
      templateGetItemList(value).then((resp) => {
        let res = resp.data
        if (res.code == 200) {
          this.itemList = res.data.items[0].items || []
        }
      })
    },
    handleCPUtiItemChange(val) {
      this.system.cpu_utilization_id = val
    },
    handlMemUtiTempChange(value) {
      templateGetItemList(value).then((resp) => {
        let res = resp.data
        if (res.code == 200) {
          this.itemList = res.data.items[0].items || []
        }
      })
    },
    handleMemUtiItemChange(val) {
      this.system.memory_utilization_id = val
    },
    handlMemUsedTempChange(value) {
      templateGetItemList(value).then((resp) => {
        let res = resp.data
        if (res.code == 200) {
          this.itemList = res.data.items[0].items || []
        }
      })
    },
    handleMemUsedItemChange(val) {
      this.system.memory_used_id = val
    },
    handlMemTotalTempChange(value) {
      templateGetItemList(value).then((resp) => {
        let res = resp.data
        if (res.code == 200) {
          this.itemList = res.data.items[0].items || []
        }
      })
    },
    handleMemTotalItemChange(val) {
      this.system.memory_total_id = val
    },
    handlCPUCoreTempChange(value) {
      templateGetItemList(value).then((resp) => {
        let res = resp.data
        if (res.code == 200) {
          this.itemList = res.data.items[0].items || []
        }
      })
    },
    handleCPUCoreItemChange(val) {
      this.system.cpu_core = val
    },
    handlModelTempChange(value) {
      templateGetItemList(value).then((resp) => {
        let res = resp.data
        if (res.code == 200) {
          this.itemList = res.data.items[0].items || []
        }
      })
    },
    handleModelItemChange(val) {
      this.system.model = val
    },
    saveData() {
      this.system.group_id = this.system.group_id.toString()
      this.system.uptime_id = this.system.uptime_id.toString()
      this.system.cpu_core = this.system.cpu_core.toString()
      this.system.cpu_utilization_id = this.system.cpu_utilization_id.toString()
      this.system.model = this.system.model.toString()
      this.system.memory_utilization_id = this.system.memory_utilization_id.toString()
      this.system.memory_used_id = this.system.memory_used_id.toString()
      this.system.memory_total_id = this.system.memory_total_id.toString()
      systemUpdate(this.id, this.system).then((resp) => {
        let res = resp.data
        if (res.code == 200) {
          this.$message.success(res.message)
          this.$router.push("/system/init")
        }
      })
    },
    back() {
      this.$router.push("/system/init")
    }
  }
}
</script>

<style lang="less" scoped>
.card {
  margin-bottom: 24px;
}
</style>
