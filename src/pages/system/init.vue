<template>
  <page-layout :noTitle="true">
    <a-alert message="实例选择提示" type="info" show-icon closable style="margin-bottom: 16px;">
      <template slot="description">
        指标映射需要从指定的 Zabbix 实例获取主机组、模板和监控项数据。请先选择要配置的实例。
      </template>
    </a-alert>
    
    <a-form-model class="home-search" layout="inline" :colon='false'>
      <a-form-model-item label="选择实例">
        <a-select v-model="selectedInstance" placeholder="请选择 Zabbix 实例" @change="handleInstanceChange" style="width: 300px">
          <a-select-option v-for="item in instanceList" :key="item.tenant_id" :value="item.tenant_id">
            {{ item.name }} ({{ item.tenant_id }})
          </a-select-option>
        </a-select>
      </a-form-model-item>
    </a-form-model>
    <div class="linux-list">
      <a-table :loading="loading" :columns="columns" :data-source="list" :rowKey="(record) => { return record.id}">
        <span slot="id" slot-scope="record">{{record.id}}</span>
        <div slot="name" slot-scope="record">{{record.name}}</div>
        <div slot="status" slot-scope="record">
          <a-tag v-if="record.status == 1" color="#2f9e5e">{{$t('conf_ok')}}</a-tag>
          <a-tag v-else-if="record.status == 0" color="#d05253">{{$t('conf_bad')}}</a-tag>
          <a-tag v-else status="default" :text="$t('conf_unknown')" />
        </div>
        <div slot="inited_at" slot-scope="record">
          {{ new Date(+new Date(record.inited_at) + 8 * 3600 * 1000).toISOString().replace(/T/g, ' ').replace(/\.[\d]{3}Z/, '') || '--' }}</div>
        <div slot="operation" slot-scope="record">
          <!-- <a-button class="pd20 paddingleft0" type="link" size="small" @click="seeEdit(record)">{{ $t('edit_btn') }}</a-button> -->
          <a-button class="pd20 paddingleft0" type="link" size="small" @click="edit(record)">{{ $t('edit_btn') }}</a-button>
          <a-button class="pd20 paddingleft0" type="link" size="small" @click="deployInit(record)">{{ $t('update_btn') }}</a-button>
        </div>
      </a-table>
      <a-drawer :title="title" :width="720" :visible="visible" :body-style="{ paddingBottom: '80px' }" @close="onClose">
        <!-- 主机组 -->
        <a-row :gutter="[16,2]">
          <a-col :span="12">
            <div class="height-50">
              <a-form-item :label="$t('group')">
                <a-select mode="multiple" show-search optionFilterProp="label" style="width: 100%" v-model="system.group_id" :placeholder="$t('groupselect')" option-label-prop="label"
                  @change="handleGroupChange">
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
                <a-select show-search optionFilterProp="label" style="width: 100%" v-model="system.ping_template_id" :placeholder="$t('template_select')" option-label-prop="label"
                  @change="handlPingTempChange">
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
                <a-select mode="multiple" v-model="system.uptime_id" show-search optionFilterProp="label" style="width: 100%" :placeholder="$t('item_select')" option-label-prop="label"
                  @change="handleUptimeItemChange">
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
                <a-select mode="multiple" style="width: 100%" show-search optionFilterProp="label" v-model="system.model" :placeholder="$t('item_select')" option-label-prop="label"
                  @change="handleModelItemChange">
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
                <a-select mode="multiple" show-search optionFilterProp="label" style="width: 100%" v-model="system.cpu_core" :placeholder="$t('item_select')" option-label-prop="label"
                  @change="handleCPUCoreItemChange">
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
                <a-select mode="multiple" show-search optionFilterProp="label" style="width: 100%" v-model="system.cpu_utilization_id" :placeholder="$t('item_select')" option-label-prop="label"
                  @change="handleCPUtiItemChange">
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
                  <a-select-option v-for="(item, index) in templateList" :key="item" :value="item.templateid" :label="item.name" :title="item.name">
                    {{ item.name }}
                  </a-select-option>
                </a-select>
              </a-form-item>
            </div>
          </a-col>
          <a-col :span="12">
            <div class="height-50">
              <a-form-item :label="$t('item')" :required="false">
                <a-select mode="multiple" show-search optionFilterProp="label" style="width: 100%" v-model="system.memory_utilization_id" :placeholder="$t('item_select')" option-label-prop="label"
                  @change="handleMemUtiItemChange">
                  <a-select-option v-for="(item, index) in itemList" :key="item" :value="item.itemid" :label="item.name" :title="item.name">
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
                  <a-select-option v-for="(item, index) in templateList" :key="item" :value="item.templateid" :label="item.name" :title="item.name">
                    {{ item.name }}
                  </a-select-option>
                </a-select>
              </a-form-item>
            </div>
          </a-col>
          <a-col :span="12">
            <div class="height-50">
              <a-form-item :label="$t('item')" :required="false">
                <a-select mode="multiple" show-search optionFilterProp="label" style="width: 100%" v-model="system.memory_total_id" :placeholder="$t('item_select')" option-label-prop="label"
                  @change="handleMemTotalItemChange">
                  <a-select-option v-for="(item, index) in itemList" :key="item" :value="item.itemid" :label="item.name" :title="item.name">
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
          <a-button :style="{ marginRight: '8px' }" @click="onClose">{{ $t('cancel_btn') }}</a-button>
          <a-button :style="{ marginRight: '8px' }" type="primary" @click="saveData" :loading="saveLoading" :disabled="saveDisabled">{{ $t('save_btn') }}</a-button>
          <a-button type="primary" @click="deployInit" :loading="initLoading" :disabled="initDisabled">{{ $t('init_btn') }}</a-button>
        </div>
      </a-drawer>
    </div>
  </page-layout>
</template>
<script>
import PageLayout from '@/layouts/PageLayout'
import { systemList, systemInit } from '@/services/admin'
import { systemInfo, hostgroupList, templateList, templateGetItemList, systemUpdate } from "@/services/admin";
import { listZabbixInstances } from '@/services/zabbix'
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
      instanceList: [],
      selectedInstance: undefined,
      columns: [
        { title: this.$t('table_headers_id'), key: 'id', align: 'left', scopedSlots: { customRender: 'id' } },
        { title: this.$t('table_headers_name'), key: 'name', align: 'left', scopedSlots: { customRender: 'name' } },
        { title: this.$t('table_headers_status'), key: 'status', align: 'left', scopedSlots: { customRender: 'status' } },
        { title: this.$t('table_headers_inited_at'), key: 'inited_at', align: 'left', scopedSlots: { customRender: 'inited_at' } },
        { title: this.$t('table_headers_operation'), key: 'operation', align: 'center', scopedSlots: { customRender: 'operation' } }
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
    this.loadInstances()
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
    loadInstances() {
      listZabbixInstances().then((resp) => {
        let res = resp.data
        if (res.code == 200) {
          // 后端返回格式：{code: 200, message: "ok", data: [...]}
          const allItems = Array.isArray(res.data) ? res.data : []
          this.instanceList = allItems.filter(item => item.enabled)
          if (this.instanceList.length > 0 && !this.selectedInstance) {
            this.selectedInstance = this.instanceList[0].tenant_id
          }
        }
      }).catch(err => {
        console.error('加载实例列表失败:', err)
        this.$message.error('加载实例列表失败')
      })
    },
    handleInstanceChange(value) {
      this.selectedInstance = value
      // 清空已选择的数据
      this.grouplist = []
      this.templateList = []
      this.itemList = []
      // 如果drawer是打开的，重新加载数据
      if (this.visible) {
        this.loadInstanceData()
      }
    },
    loadInstanceData() {
      if (!this.selectedInstance) {
        this.$message.warning('请先选择 Zabbix 实例')
        return
      }
      // 加载主机组
      hostgroupList(this.selectedInstance).then((resp) => {
        let res = resp.data
        if (res.code == 200) {
          this.grouplist = res.data.items || []
        }
      })
      // 加载模板
      templateList(this.selectedInstance).then((resp) => {
        let res = resp.data
        if (res.code == 200) {
          this.templateList = res.data.items || []
        }
      })
    },
    //初始化
    deployInit(record) {
      // 检查是否选择了实例
      if (!this.selectedInstance) {
        this.$message.warning('请先选择 Zabbix 实例')
        return
      }
      
      // 如果传入了record参数，使用record.id；否则使用this.id
      const id = record ? record.id : this.id
      if (!id) {
        this.$message.error('ID不能为空')
        return
      }
      this.loading = true
      this.initLoading = true
      //禁用保存
      this.saveDisabled = true
      // 传递实例ID参数
      systemInit(id, this.selectedInstance).then((resp) => {
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
        } else {
          this.$message.error(res.message || '初始化失败')
        }
      }).catch(err => {
        this.$message.error('初始化失败: ' + (err.message || '未知错误'))
      }).finally(() => { 
        this.loading = false
        this.initLoading = false
        this.saveDisabled = false
      })
    },
    //打开
    edit(record) {
      if (!this.selectedInstance) {
        this.$message.warning('请先选择 Zabbix 实例')
        return
      }
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
      
      // 加载实例数据
      this.loadInstanceData()
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
      if (!this.selectedInstance) {
        this.$message.warning('请先选择 Zabbix 实例')
        return
      }
      templateGetItemList(value, this.selectedInstance).then((resp) => {
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
      if (!this.selectedInstance) {
        this.$message.warning('请先选择 Zabbix 实例')
        return
      }
      templateGetItemList(value, this.selectedInstance).then((resp) => {
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
      if (!this.selectedInstance) {
        this.$message.warning('请先选择 Zabbix 实例')
        return
      }
      templateGetItemList(value, this.selectedInstance).then((resp) => {
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
      if (!this.selectedInstance) {
        this.$message.warning('请先选择 Zabbix 实例')
        return
      }
      templateGetItemList(value, this.selectedInstance).then((resp) => {
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
      if (!this.selectedInstance) {
        this.$message.warning('请先选择 Zabbix 实例')
        return
      }
      templateGetItemList(value, this.selectedInstance).then((resp) => {
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
      if (!this.selectedInstance) {
        this.$message.warning('请先选择 Zabbix 实例')
        return
      }
      templateGetItemList(value, this.selectedInstance).then((resp) => {
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
      if (!this.selectedInstance) {
        this.$message.warning('请先选择 Zabbix 实例')
        return
      }
      templateGetItemList(value, this.selectedInstance).then((resp) => {
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
      if (!this.selectedInstance) {
        this.$message.warning('请先选择 Zabbix 实例')
        return
      }
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
      // 添加实例ID
      this.system.instance_id = this.selectedInstance
      systemUpdate(this.id, this.system, this.selectedInstance).then((resp) => {
        let res = resp.data
        if (res.code == 200) {
          this.initDisabled = false
          this.saveLoading = false
	  this.$message.success(res.message + ",可以进行初始化!")
        }
      }).catch(err => {
        this.$message.error('保存失败: ' + (err.message || '未知错误'))
      }).finally(() => {
        this.saveLoading = false
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
