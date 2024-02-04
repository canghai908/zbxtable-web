<template>
  <page-layout :noTitle="true">
    <a-form-model class="home-search" layout="inline" :colon='false'>
      <a-form-model-item>
      </a-form-model-item>
    </a-form-model>
    <div class="linux-list">
      <a-table :loading="loading" :columns="columns" :data-source="list" :rowKey="(record) => { return record.id}">
        <span slot="id" slot-scope="record">{{record.id}}</span>
        <div slot="name" slot-scope="record">{{record.name}}</div>
        <div slot="status" slot-scope="record">
          <a-tag v-if="record.status == 1" color="#2f9e5e">已完成</a-tag>
          <a-tag v-else-if="record.status == 0" color="#d05253"> 未完成</a-tag>
          <a-tag v-else status="default" text="未知" />
        </div>
        <div slot="inited_at" slot-scope="record">
          {{ new Date(+new Date(record.inited_at) + 8 * 3600 * 1000).toISOString().replace(/T/g, ' ').replace(/\.[\d]{3}Z/, '') || '--' }}</div>
        <div slot="operation" slot-scope="record">
          <!-- <a-button class="pd20 paddingleft0" type="link" size="small" @click="seeEdit(record)">编辑</a-button> -->
          <a-button class="pd20 paddingleft0" type="link" size="small" @click="edit(record)">编辑</a-button>
          <a-button class="pd20 paddingleft0" type="link" size="small" @click="deployInit(record)">初始化</a-button>
        </div>
      </a-table>
      <a-drawer :title="title" :width="720" :visible="visible" :body-style="{ paddingBottom: '80px' }" @close="onClose">
        <!-- 主机组 -->
        <a-row :gutter="[16,2]">
          <a-col :span="12">
            <div class="height-50">
              <a-form-item :label="$t('group')">
                <a-select mode="multiple" show-search optionFilterProp="label" style="width: 100%" v-model="system.group_id" :placeholder="$t('groupselect')" option-label-prop="label" @change="handleGroupChange">
                  <a-select-option v-for="(item, index) in grouplist" :key="index" :value="item.groupid" :label="item.name" :title="item.groupid">
                    {{ item.name }}
                  </a-select-option>
                </a-select>
              </a-form-item>
            </div>
          </a-col>
          <a-col :span="12">
            <!-- Ping -->
            <div class="height-50">
              <a-form-item :label="$t('ping')" :required="false">
                <a-select show-search optionFilterProp="label" style="width: 100%" v-model="system.ping_template_id" :placeholder="$t('template_select')" option-label-prop="label" @change="handlPingTempChange">
                  <a-select-option v-for="(item, index) in templateList" :key="index" :value="item.templateid" :label="item.name" :title="item.name">
                    {{ item.name }}
                  </a-select-option>
                </a-select>
              </a-form-item>
            </div>
          </a-col>
        </a-row>
        <!-- Uptime -->
        <a-row :gutter="16">
          <a-col :span="12">
            <div class="height-50">
              <a-form-item :label="$t('uptime')" :required="false">
                <a-select show-search optionFilterProp="label" style="width: 100%" :placeholder="$t('template_select')" option-label-prop="label" @change="handlUptimeTempChange">
                  <a-select-option v-for="(item, index) in templateList" :key="index" :value="item.templateid" :label="item.name" :title="item.name">
                    {{ item.name }}
                  </a-select-option>
                </a-select>
              </a-form-item>
            </div>
          </a-col>
          <a-col :span="12">
            <div class="height-50">
              <a-form-item :label="$t('item')" :required="false">
                <a-select mode="multiple" v-model="system.uptime_id" show-search optionFilterProp="label" style="width: 100%" :placeholder="$t('item_select')" option-label-prop="label" @change="handleUptimeItemChange">
                  <a-select-option v-for="(item, index) in itemList" :key="index" :value="item.itemid" :label="item.name" :title="item.name">
                    {{ item.name }}
                  </a-select-option>
                </a-select>
              </a-form-item>
            </div>
          </a-col>
        </a-row>
        <!-- 设备型号 -->
        <a-row :gutter="16" v-if="system.id==3 ||system.id==4">
          <a-col :span="12">
            <div class="height-50">
              <a-form-item v-if="system.id==3 ||system.id==4" :label="$t('model')" :required="false">
                <a-select style="width: 100%" show-search optionFilterProp="label" :placeholder="$t('template_select')" option-label-prop="label" @change="handlModelTempChange">
                  <a-select-option v-for="(item, index) in templateList" :key="index" :value="item.templateid" :label="item.name" :title="item.name">
                    {{ item.name }}
                  </a-select-option>
                </a-select>
              </a-form-item>
            </div>
          </a-col>
          <a-col :span="12">
            <div class="height-50">
              <a-form-item :label="$t('item')" :required="false">
                <a-select mode="multiple" style="width: 100%" show-search optionFilterProp="label" v-model="system.model" :placeholder="$t('item_select')" option-label-prop="label" @change="handleModelItemChange">
                  <a-select-option v-for="(item, index) in itemList" :key="index" :value="item.itemid" :label="item.name" :title="item.name">
                    {{ item.name }}
                  </a-select-option>
                </a-select>
              </a-form-item>
            </div>
          </a-col>
        </a-row>
        <!-- cpu core -->
        <a-row :gutter="16" v-if="system.id==1 ||system.id==2">
          <a-col :span="12">
            <div class="height-50">
              <a-form-item :label="$t('cpu_core')" :required="false">
                <a-select show-search optionFilterProp="label" style="width: 100%" :placeholder="$t('template_select')" option-label-prop="label" @change="handlCPUCoreTempChange">
                  <a-select-option v-for="(item, index) in templateList" :key="index" :value="item.templateid" :label="item.name" :title="item.name">
                    {{ item.name }}
                  </a-select-option>
                </a-select>
              </a-form-item>
            </div>
          </a-col>
          <a-col :span="12">
            <div class="height-50">
              <a-form-item :label="$t('item')" :required="false">
                <a-select mode="multiple" show-search optionFilterProp="label" style="width: 100%" v-model="system.cpu_core" :placeholder="$t('item_select')" option-label-prop="label" @change="handleCPUCoreItemChange">
                  <a-select-option v-for="(item, index) in itemList" :key="index" :value="item.itemid" :label="item.name" :title="item.name">
                    {{ item.name }}
                  </a-select-option>
                </a-select>
              </a-form-item>
            </div>
          </a-col>
        </a-row>
        <!-- cpu util -->
        <a-row :gutter="16">
          <a-col :span="12">
            <div class="height-50">
              <a-form-item :label="$t('cpu_uti')">
                <a-select show-search optionFilterProp="label" style="width: 100%" :placeholder="$t('template_select')" option-label-prop="label" @change="handlCPUTempChange">
                  <a-select-option v-for="(item, index) in templateList" :key="index" :value="item.templateid" :label="item.name" :title="item.name">
                    {{ item.name }}
                  </a-select-option>
                </a-select>
              </a-form-item>
            </div>
          </a-col>
          <a-col :span="12">
            <div class="height-50">
              <a-form-item :label="$t('item')" :required="false">
                <a-select mode="multiple" show-search optionFilterProp="label" style="width: 100%" v-model="system.cpu_utilization_id" :placeholder="$t('item_select')" option-label-prop="label" @change="handleCPUtiItemChange">
                  <a-select-option v-for="(item, index) in itemList" :key="index" :value="item.itemid" :label="item.name" :title="item.name">
                    {{ item.name }}
                  </a-select-option>
                </a-select>
              </a-form-item>
            </div>
          </a-col>
        </a-row>
        <!-- MemoryUtilization  -->
        <a-row :gutter="16">
          <a-col :span="12">
            <div class="height-50">
              <a-form-item :label="$t('mem_uti')">
                <a-select show-search optionFilterProp="label" style="width: 100%" :placeholder="$t('template_select')" option-label-prop="label" @change="handlMemUtiTempChange">
                  <a-select-option v-for="(item, index) in templateList" :key="index" :value="item.templateid" :label="item.name" :title="item.name">
                    {{ item.name }}
                  </a-select-option>
                </a-select>
              </a-form-item>
            </div>
          </a-col>
          <a-col :span="12">
            <div class="height-50">
              <a-form-item :label="$t('item')" :required="false">
                <a-select mode="multiple" show-search optionFilterProp="label" style="width: 100%" v-model="system.memory_utilization_id" :placeholder="$t('item_select')" option-label-prop="label" @change="handleMemUtiItemChange">
                  <a-select-option v-for="(item, index) in itemList" :key="index" :value="item.itemid" :label="item.name" :title="item.name">
                    {{ item.name }}
                  </a-select-option>
                </a-select>
              </a-form-item>
            </div>
          </a-col>
        </a-row>
        <!-- MemoryTotal -->
        <a-row :gutter="16">
          <a-col :span="12">
            <div class="height-50">
              <a-form-item :label="$t('mem_total')" :required="false">
                <a-select show-search optionFilterProp="label" style="width: 100%" :placeholder="$t('template_select')" option-label-prop="label" @change="handlMemTotalTempChange">
                  <a-select-option v-for="(item, index) in templateList" :key="index" :value="item.templateid" :label="item.name" :title="item.name">
                    {{ item.name }}
                  </a-select-option>
                </a-select>
              </a-form-item>
            </div>
          </a-col>
          <a-col :span="12">
            <div class="height-50">
              <a-form-item :label="$t('item')" :required="false">
                <a-select mode="multiple" show-search optionFilterProp="label" style="width: 100%" v-model="system.memory_total_id" :placeholder="$t('item_select')" option-label-prop="label" @change="handleMemTotalItemChange">
                  <a-select-option v-for="(item, index) in itemList" :key="index" :value="item.itemid" :label="item.name" :title="item.name">
                    {{ item.name }}
                  </a-select-option>
                </a-select>
              </a-form-item>
            </div>
          </a-col>
        </a-row>
        <div :style="{
          position: 'absolute',
          right: 0,
          bottom: 0,
          width: '100%',
          borderTop: '1px solid #e9e9e9',
          padding: '10px 16px',
          background: '#fff',
          textAlign: 'right',
          zIndex: 1,
        }">
          <a-button :style="{ marginRight: '8px' }" @click="onClose">
            取消
          </a-button>
          <a-button :style="{ marginRight: '8px' }" type="primary" @click="saveData" :loading="saveLoading" :disabled="saveDisabled">
            保存
          </a-button>
          <a-button type="primary" @click="deployInit" :loading="initLoading" :disabled="initDisabled">
            初始化
          </a-button>
        </div>
      </a-drawer>
    </div>
  </page-layout>
</template>
<script>
import PageLayout from '@/layouts/PageLayout'
import { systemList, systemInit } from '@/services/admin'
import { systemInfo, hostgroupList, templateList, templateGetItemList, systemUpdate } from "@/services/admin";
export default {
  name: 'tuopu',
  i18n: require('./i18n'),
  components: { PageLayout },
  data() {
    return {
      title: "",
      topology: '',
      page: 1,
      pageSize: 10,
      loading: false,
      visible: false,
      list: [],
      columns: [
        { title: '序号', key: 'id', align: 'left', scopedSlots: { customRender: 'id' } },
        { title: '系统类型', key: 'name', align: 'left', scopedSlots: { customRender: 'name' } },
        { title: '初始化状态', key: 'status', align: 'left', scopedSlots: { customRender: 'status' } },
        { title: '最近初始化时间', key: 'inited_at', align: 'left', scopedSlots: { customRender: 'inited_at' } },
        { title: '操作', key: 'operation', align: 'center', scopedSlots: { customRender: 'operation' } }
      ],
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
        ping_template_id: '',
        ping: "",
        ping_loss: "",
        ping_sec: "",
      },
      saveDisabled: false,
      initDisabled: true,
      saveLoading: false,
      initLoading: false,
    }
  },
  created() {
    this.init()
  },
  methods: {
    init() {
      this.loading = true
      systemList().then((resp) => {
        let res = resp.data
        if (res.code == 200) {
          this.list = res.data.items || []
        }
      }).finally(() => { this.loading = false })
    },
    //初始化
    deployInit() {
      this.loading = true
      this.initLoading = true
      //禁用保存
      this.saveDisabled = true
      systemInit(this.id,).then((resp) => {
        let res = resp.data
        if (res.code == 200) {
          this.initLoading = false
          this.loading = false
          //配置禁用
          this.initDisabled = true
          this.saveDisabled = false
          //关闭drawer
          this.visible = false
          this.$message.success(res.message)
          this.init()
        }
      }).finally(() => { this.loading = false })
    },
    //打开
    edit(record) {
      this.id = record.id
      this.title = record.name + '指标初始化'
      this.visible = true;
      systemInfo(record.id).then((resp) => {
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
          //
          if (this.system.memory_total_id != '') {
            this.system.memory_total_id = this.system.memory_total_id.split(',')
          } else {
            this.system.memory_total_id = []
          }
          //ping
          if (this.system.ping_template_id != '') {
            this.system.ping_template_id = this.system.ping_template_id.split(',')
          } else {
            this.system.ping_template_id = []
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
    onClose() {
      this.visible = false;
    },
    //主机组
    handleGroupChange(value) {
      this.system.group_id = value
    },
    //ping
    handlPingTempChange(val) {
      this.system.ping_template_id = val
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
    //保存
    saveData() {
      this.saveLoading = true
      this.system.group_id = this.system.group_id.toString()
      this.system.uptime_id = this.system.uptime_id.toString()
      this.system.cpu_core = this.system.cpu_core.toString()
      this.system.cpu_utilization_id = this.system.cpu_utilization_id.toString()
      this.system.model = this.system.model.toString()
      this.system.memory_utilization_id = this.system.memory_utilization_id.toString()
      this.system.memory_used_id = this.system.memory_used_id.toString()
      this.system.memory_total_id = this.system.memory_total_id.toString()
      this.system.ping_template_id = this.system.ping_template_id.toString()
      systemUpdate(this.id, this.system).then((resp) => {
        let res = resp.data
        if (res.code == 200) {
          this.initDisabled = false
          this.saveLoading = false
          this.$message.success(res.message + ",可以进行初始化!")
        }
      })
    },
  },
}
</script>

<style lang="less" scoped>
.tuopu_bg {
  width: 708px;
}

.bg-blue-light {
  background-color: #43bdf5;
}

.height-50 {
  height: 90px;
}
</style>
