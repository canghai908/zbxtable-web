<template>
  <div class="drawer_container">
    <!-- 画布设置 -->
    <div v-if="drawerType === 'grid'">
      <div class="drawer_title">画布设置</div>
      <div class="drawer_wrap">
        <a-form-model :model="form" :label-col="labelCol" :wrapper-col="wrapperCol">
          <a-form-model-item label="拓扑图名称">
            <a-input v-model="form.name" placeholder="请输入拓扑图名称" />
          </a-form-model-item>
          <a-form-model-item label="">
            <a-alert message="点击画布空白处可关闭此面板" type="info" show-icon />
          </a-form-model-item>
        </a-form-model>
      </div>
    </div>

    <!-- 节点设置 -->
    <div v-if="drawerType === 'node'">
      <div class="drawer_title">节点设置</div>
      <div class="drawer_wrap">
        <a-form :model="drawerNode" :label-col="labelCol" :wrapper-col="wrapperCol">
          <a-form-item label="Zabbix实例">
            <a-select 
              v-model="drawerNode.ZID" 
              style="width: 100%" 
              placeholder="请选择Zabbix实例"
              @change="handleInstanceChange"
            >
              <a-select-option v-for="instance in zabbixInstances" :key="instance.id" :value="instance.id">
                {{ instance.name }}
              </a-select-option>
            </a-select>
          </a-form-item>
          
          <a-form-item label="设备类型">
            <a-select 
              :value="drawerNode.HostType" 
              style="width: 100%" 
              placeholder="请选择设备类型" 
              @change="handleChange"
            >
              <a-select-option v-for="(item, index) in HostTypeList" :key="index" :value="item.value">
                {{ item.label }}
              </a-select-option>
            </a-select>
          </a-form-item>
          
          <a-form-item label="设备名称">
            <a-select 
              v-model="drawerNode.HostID"
              show-search 
              style="width: 100%" 
              option-filter-prop="label" 
              placeholder="请选择设备"
              @popupScroll="handleHostPopupScroll" 
              @search="handleHostSearch" 
              @change="handleHostChange"
            >
              <a-select-option 
                v-for="(host, index) in curHostsList" 
                :key="index" 
                :title="host.name" 
                :label="host.name" 
                :value="host.hostid"
              >
                {{ host.name }}
              </a-select-option>
            </a-select>
          </a-form-item>
          
          <a-form-item label="功能">
            <a-button type="danger" ghost @click="deleteNode">
              删除
            </a-button>
          </a-form-item>
        </a-form>
      </div>
    </div>

    <!-- 线条设置 -->
    <div v-if="drawerType === 'edge'">
      <div class="drawer_title">线条设置</div>
      <div class="drawer_wrap">
        <a-form :model="drawerEdge" :label-col="labelCol" :wrapper-col="wrapperCol">
          <a-form-item label="Zabbix实例">
            <a-select 
              v-model="drawerEdge.ZID" 
              style="width: 100%" 
              placeholder="请选择Zabbix实例"
              @change="handleInstanceChange"
            >
              <a-select-option v-for="instance in zabbixInstances" :key="instance.id" :value="instance.id">
                {{ instance.name }}
              </a-select-option>
            </a-select>
          </a-form-item>
          
          <a-form-item label="设备类型">
            <a-select 
              :value="drawerEdge.HostType"
              style="width: 100%" 
              placeholder="请选择设备类型"
              @change="handleChange"
            >
              <a-select-option v-for="(item, index) in HostTypeList" :key="index" :value="item.value">
                {{ item.label }}
              </a-select-option>
            </a-select>
          </a-form-item>
          
          <a-form-item label="设备名称">
            <a-select 
              v-model="drawerEdge.HostID"
              show-search 
              style="width: 100%" 
              option-filter-prop="label"
              placeholder="请选择设备"
              @popupScroll="handleHostPopupScroll" 
              @search="handleHostSearch" 
              @change="handleHostChange"
            >
              <a-select-option 
                v-for="(host, index) in curHostsList" 
                :key="index" 
                :title="host.name" 
                :label="host.name" 
                :value="host.hostid"
              >
                {{ host.name }}
              </a-select-option>
            </a-select>
          </a-form-item>
          
          <a-form-item label="流量指标">
            <a-select 
              v-model="drawerEdge.FlowID"
              show-search 
              style="width: 100%" 
              option-filter-prop="label"
              placeholder="请选择流量指标"
              @popupScroll="handlePopupScroll" 
              @search="handleSearch" 
              @change="handleFlowChange"
            >
              <a-select-option 
                v-for="(flow, index) in curFlowItemList" 
                :key="index" 
                :label="flow.name" 
                :title="flow.name" 
                :value="flow.itemid"
              >
                {{ flow.name }}
              </a-select-option>
            </a-select>
          </a-form-item>
          
          <a-form-item label="触发指标">
            <a-select 
              v-model="drawerEdge.TriggerID"
              show-search 
              style="width: 100%" 
              option-filter-prop="label"
              placeholder="请选择触发指标"
              @popupScroll="handleTriggerPopupScroll" 
              @search="handleTriggerSearch" 
              @change="handleTriggerChange"
            >
              <a-select-option 
                v-for="(trigger, index) in curTriggerItemList" 
                :key="index" 
                :title="trigger.description" 
                :label="trigger.description" 
                :value="trigger.triggerid"
              >
                {{ trigger.description }}
              </a-select-option>
            </a-select>
          </a-form-item>
          
          <a-form-item label="功能">
            <a-button type="danger" ghost @click="deleteNode">
              删除
            </a-button>
          </a-form-item>
        </a-form>
      </div>
    </div>
  </div>
</template>

<script>
import { hostList, itemList, triggerList, itemTopoTraffic } from "@/services/admin"
import { listZabbixInstance } from "@/services/zabbix"

const selectSize = 30
const debounce = (func, delay = 60) => {
  let timer = null;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => func.apply(this, args), delay);
  }
};

export default {
  data() {
    return {
      zabbixInstances: [], // Zabbix实例列表
      drawerNode: {
        ZID: undefined,
        HostType: '',
        HostValue: '',
        HostName: '',
        HostID: undefined,
      },
      drawerEdge: {
        ZID: undefined,
        HostType: '',
        HostValue: '',
        HostName: '',
        HostID: undefined,
        FlowName: '',
        FlowID: undefined,
        TriggerDesc: '',
        TriggerID: undefined,
      },
      labelCol: { span: 8 },
      wrapperCol: { span: 16 },
      hosttype: 'VM_WIN',
      HostTypeList: [
        { value: 'VM_WIN', label: 'Windows' },
        { value: 'VM_LIN', label: 'Linux' },
        { value: 'HW_SRV', label: '硬件服务器' },
        { value: 'HW_NET', label: '网络设备' }
      ],
      HostsList: [],
      curHostsList: [],
      hostsFilterList: [],
      FlowItemList: [],
      curFlowItemList: [],
      flowItemFilterList: [],
      TriggerItemList: [],
      curTriggerItemList: [],
      triggerItemFilterList: [],
    }
  },
  props: {
    drawerType: { type: String },
    selectCell: { type: [String, Object] },
    graph: { type: [String, Object] },
    form: { type: Object },
  },
  watch: {
    selectCell: {
      handler(val) {
        if (val) {
          if (val.isNode()) {
            // 节点
            this.drawerNode.ZID = val.store.data.attrs.label.ZID || undefined
            this.drawerNode.HostType = val.store.data.attrs.label.HostType || ''
            this.drawerNode.HostValue = val.store.data.attrs.label.HostValue || ''
            this.drawerNode.HostName = val.store.data.attrs.label.text || ''
            this.drawerNode.HostID = val.store.data.attrs.label.HostID || undefined
            
            // 如果有实例ID，加载对应的主机列表
            if (this.drawerNode.ZID && this.drawerNode.HostType) {
              this.loadHostsByInstance(this.drawerNode.ZID, this.drawerNode.HostType)
            }
          } else {
            // 边
            if (val.store.data.labels && val.store.data.labels[0]) {
              if (val.store.data.labels[0].text) {
                this.drawerEdge.HostName = val.store.data.labels[0].text
              } else if (val.store.data.labels[0].attrs) {
                this.drawerEdge.HostName = val.store.data.labels[0].attrs.label.text
              }
            }
            this.drawerEdge.ZID = val.store.data.attrs.line.ZID || undefined
            this.drawerEdge.HostType = val.store.data.attrs.line.HostType || ''
            this.drawerEdge.HostValue = val.store.data.attrs.line.HostValue || ''
            this.drawerEdge.HostID = val.store.data.attrs.line.HostID || undefined
            this.drawerEdge.FlowName = val.store.data.attrs.line.FlowName || ''
            this.drawerEdge.FlowID = val.store.data.attrs.line.FlowID || undefined
            this.drawerEdge.TriggerDesc = val.store.data.attrs.line.TriggerDesc || ''
            this.drawerEdge.TriggerID = val.store.data.attrs.line.TriggerID || undefined
            
            // 如果有实例ID和主机ID，加载对应的数据
            if (this.drawerEdge.ZID && this.drawerEdge.HostType) {
              this.loadHostsByInstance(this.drawerEdge.ZID, this.drawerEdge.HostType)
            }
            if (this.drawerEdge.HostID) {
              this.loadItemsAndTriggers(this.drawerEdge.HostID)
            }
          }
        }
      },
      immediate: true,
      deep: false
    }
  },
  created() {
    this.loadZabbixInstances()
  },
  methods: {
    // 加载Zabbix实例列表
    async loadZabbixInstances() {
      try {
        const resp = await listZabbixInstance()
        if (resp.data.code === 200) {
          // 只显示已启用的实例
          this.zabbixInstances = (resp.data.data || []).filter(instance => instance.enabled)
        }
      } catch (err) {
        this.$message.error('加载Zabbix实例失败')
      }
    },
    
    // 实例变更
    handleInstanceChange(zid) {
      if (this.drawerType === 'node') {
        this.drawerNode.ZID = zid
        this.selectCell.attr('label/ZID', zid)
        // 清空主机选择
        this.drawerNode.HostID = undefined
        this.drawerNode.HostName = ''
        this.HostsList = []
        this.curHostsList = []
      } else if (this.drawerType === 'edge') {
        this.drawerEdge.ZID = zid
        this.selectCell.attr('line/ZID', zid)
        // 清空主机和指标选择
        this.drawerEdge.HostID = undefined
        this.drawerEdge.HostName = ''
        this.drawerEdge.FlowID = undefined
        this.drawerEdge.FlowName = ''
        this.drawerEdge.TriggerID = undefined
        this.drawerEdge.TriggerDesc = ''
        this.HostsList = []
        this.curHostsList = []
        this.FlowItemList = []
        this.curFlowItemList = []
        this.TriggerItemList = []
        this.curTriggerItemList = []
      }
    },
    
    // 根据实例加载主机列表
    async loadHostsByInstance(zid, hostType) {
      const params = {
        page: 1,
        limit: 10000,
        hosttype: hostType,
        hosts: '',
        zid: zid
      }
      try {
        const resp = await hostList(params)
        if (resp.data.code === 200) {
          this.HostsList = resp.data.data.items || []
          this.hostsFilterList = this.HostsList
          this.curHostsList = this.hostsFilterList.slice(0, selectSize)
        }
      } catch (err) {
        this.$message.error('加载主机列表失败')
      }
    },
    
    // 加载监控项和触发器
    async loadItemsAndTriggers(hostId) {
      // 获取当前选中的 ZID
      const zid = this.drawerEdge.ZID
      
      if (!zid) {
        this.$message.warn('请先选择Zabbix实例')
        return
      }
      
      const params = { 
        hostid: hostId,
        zid: zid
      }
      
      // 加载流量监控项
      try {
        const resp = await itemTopoTraffic(params)
        if (resp.data.code === 200) {
          this.FlowItemList = resp.data.data.items || []
          this.flowItemFilterList = this.FlowItemList
          this.curFlowItemList = this.flowItemFilterList.slice(0, selectSize)
        }
      } catch (err) {
        console.error('加载流量监控项失败', err)
      }
      
      // 加载触发器
      try {
        const resp = await triggerList(params)
        if (resp.data.code === 200) {
          this.TriggerItemList = resp.data.data.items || []
          this.triggerItemFilterList = this.TriggerItemList
          this.curTriggerItemList = this.triggerItemFilterList.slice(0, selectSize)
        }
      } catch (err) {
        console.error('加载触发器失败', err)
      }
    },
    
    toTopZIndex() {
      this.selectCell.toFront()
    },
    
    deleteNode() {
      this.$emit('deleteNode')
    },
    
    handleChange(value) {
      const item = this.HostTypeList.find(t => t.value === value)
      if (!item) return
      
      if (this.drawerType === 'node') {
        this.drawerNode.HostType = item.value
        this.drawerNode.HostValue = item.label
        this.selectCell.attr('label/HostValue', item.label)
        this.selectCell.attr('label/HostType', item.value)
      } else if (this.drawerType === 'edge') {
        this.drawerEdge.HostType = item.value
        this.drawerEdge.HostValue = item.label
        this.selectCell.attr('line/HostValue', item.label)
        this.selectCell.attr('line/HostType', item.value)
      }
      
      // 加载对应实例的主机列表
      const zid = this.drawerType === 'node' ? this.drawerNode.ZID : this.drawerEdge.ZID
      if (zid) {
        this.loadHostsByInstance(zid, item.value)
      } else {
        this.$message.warn('请先选择Zabbix实例')
      }
    },
    
    handleHostChange(hostId) {
      const host = this.HostsList.find(h => h.hostid === hostId)
      if (!host) return
      
      if (this.drawerType === 'node') {
        this.drawerNode.HostName = host.name
        this.drawerNode.HostID = host.hostid
        this.selectCell.attr('label/text', host.name)
        this.selectCell.attr('label/HostID', host.hostid)
      } else if (this.drawerType === 'edge') {
        this.drawerEdge.HostName = host.name
        this.drawerEdge.HostID = host.hostid
        this.selectCell.setLabels([{
          attrs: {
            label: { text: host.name, fontSize: 12, fill: '#333' },
            txt: { fill: "#7c68fc", textAnchor: "middle", textVerticalAnchor: "middle" }
          },
          position: { distance: 0.5, angle: 0, offset: -10, options: { keepGradient: true, ensureLegibility: true } }
        }])
        this.selectCell.attr('line/HostID', host.hostid)
        
        // 加载监控项和触发器
        this.loadItemsAndTriggers(host.hostid)
      }
    },
    
    handleFlowChange(flowId) {
      const flow = this.FlowItemList.find(f => f.itemid === flowId)
      if (!flow) return
      
      this.drawerEdge.FlowName = flow.name
      this.drawerEdge.FlowID = flow.itemid
      this.selectCell.attr('line/FlowName', flow.name)
      this.selectCell.attr('line/FlowID', flow.itemid)
    },
    
    handleTriggerChange(triggerId) {
      const trigger = this.TriggerItemList.find(t => t.triggerid === triggerId)
      if (!trigger) return
      
      this.drawerEdge.TriggerDesc = trigger.description
      this.drawerEdge.TriggerID = trigger.triggerid
      this.selectCell.attr('line/TriggerDesc', trigger.description)
      this.selectCell.attr('line/TriggerID', trigger.triggerid)
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
      this.hostsFilterList = this.HostsList.filter(item => {
        const reg = new RegExp(value, 'gi');
        return item.name.toString().match(reg);
      });
      this.curHostsList = this.hostsFilterList.slice(0, selectSize);
    }),
    
    handlePopupScroll: debounce(function () {
      const curLen = this.curFlowItemList.length
      const allLen = this.flowItemFilterList.length
      if (curLen < allLen) {
        const nextPage = this.flowItemFilterList.slice(curLen, curLen + selectSize)
        this.curFlowItemList = this.curFlowItemList.concat(nextPage)
      }
    }),
    
    handleSearch: debounce(function (value) {
      this.flowItemFilterList = this.FlowItemList.filter(item => {
        const reg = new RegExp(value, 'gi');
        return item.name.toString().match(reg);
      });
      this.curFlowItemList = this.flowItemFilterList.slice(0, selectSize);
    }),
    
    handleTriggerPopupScroll: debounce(function () {
      const curLen = this.curTriggerItemList.length
      const allLen = this.triggerItemFilterList.length
      if (curLen < allLen) {
        const nextPage = this.triggerItemFilterList.slice(curLen, curLen + selectSize)
        this.curTriggerItemList = this.curTriggerItemList.concat(nextPage)
      }
    }),
    
    handleTriggerSearch: debounce(function (value) {
      this.triggerItemFilterList = this.TriggerItemList.filter(item => {
        const reg = new RegExp(value, 'gi');
        return item.description.toString().match(reg);
      });
      this.curTriggerItemList = this.triggerItemFilterList.slice(0, selectSize);
    }),
  }
}
</script>

<style scoped>
.drawer_container {
  padding: 20px;
  background: #fff;
  border-left: 1px solid #e8e8e8;
  height: 100%;
  overflow-y: auto;
}

.drawer_title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 20px;
  color: #333;
  border-bottom: 2px solid #1890ff;
  padding-bottom: 10px;
}

.drawer_wrap {
  margin-top: 20px;
}
</style>
