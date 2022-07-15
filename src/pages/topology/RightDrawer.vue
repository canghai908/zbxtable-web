<template>
  <div class="drawer_container">
    <div v-if="drawerType === 'grid'">
      <div class="drawer_title">画布设置</div>
      <div class="drawer_wrap">
        <a-form-model :model="form" :label-col="labelCol" :wrapper-col="wrapperCol">
          <a-form-model-item label="拓扑图名称">
            <a-input v-model="form.name" placeholder="请输入拓扑图名称" />
          </a-form-model-item>
        </a-form-model>
      </div>
    </div>
    <div v-if="drawerType === 'node'">
      <div class="drawer_title">节点设置</div>
      <div class="drawer_wrap">
        <a-form :model="drawerNode" :label-col="labelCol" :wrapper-col="wrapperCol">
          <a-form-item label="设备类型">
            <a-select :default-value="DefaultHostType" label-in-value style="width: 200px" placeholder="请选择设备类型" @change="handleChange">
              <a-select-option v-for="(item, index) in HostTypeList" :key="index" :value="item.value">
                {{ item.label }}
              </a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item label="设备名称">
            <a-select label-in-value show-search :default-value="DefaultHostName" style="width: 200px" option-filter-prop="label" @popupScroll="handleHostPopupScroll" @search="handleHostSearch" @change="handleHostChange">
              <a-select-option v-for="(handle, index) in curHostsList" :key="index" :title="handle.name" :label="handle.name" :value="handle.hostid">
                {{ handle.name }}
              </a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item label="功能">
            <a-button type="primary" ghost style="margin-right: 10px;" @click="toTopZIndex">
              置顶
            </a-button>
            <a-button type="danger" ghost @click="deleteNode">
              删除
            </a-button>
          </a-form-item>
        </a-form>
      </div>
    </div>
    <div v-if="drawerType === 'edge'">
      <div class="drawer_title">线条设置</div>
      <div class="drawer_wrap">
        <a-form :model="drawerEdge" :label-col="labelCol" :wrapper-col="wrapperCol">
          <a-form-item label="设备类型">
            <a-select label-in-value :default-value="DefaultHostType" style="width: 200px" @change="handleChange">
              <a-select-option v-for="(item, index) in HostTypeList" :key="index" :value="item.value">
                {{ item.label }}
              </a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item label="设备名称">
            <!-- :default-value="DefaultHostName"  -->
            <a-select label-in-value show-search style="width: 200px" option-filter-prop="label" @popupScroll="handleHostPopupScroll" @search="handleHostSearch" @change="handleHostChange">
              <a-select-option v-for="(handle, index) in curHostsList" :key="index" :title="handle.name" :label="handle.name" :value="handle.hostid">
                {{ handle.name }}
              </a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item label="流量指标">
            <!-- :default-value="DefaultFlowName"  -->
            <a-select label-in-value show-search style="width: 200px" option-filter-prop="label" @popupScroll="handlePopupScroll" @search="handleSearch" @change="handleFlowChange">
              <a-select-option v-for="(flow, index) in curFlowItemList" :key="index" :label="flow.name" :title="flow.name" :value="flow.itemid">
                {{ flow.name }}
              </a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item label="触发指标">
            <!-- :default-value="DefaultTriggerDesc"  -->
            <a-select label-in-value show-search style="width: 200px" option-filter-prop="label" @popupScroll="handleTriggerPopupScroll" @search="handleTriggerSearch" @change="handleTriggerChange">
              <a-select-option v-for="(trigger, index) in curTriggerItemList" :key="index" :title="trigger.description" :label="trigger.description" :value="trigger.triggerid">
                {{ trigger.description }}
              </a-select-option>
            </a-select>
          </a-form-item>
          <!-- <a-form-item label="功能"> -->
          <a-form-item label="功能">
            <!-- <a-button type="primary" ghost style="margin-right: 10px;" @click="toTopZIndex">
              置顶
            </a-button> -->
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
      DefaultHostType: {
        key: '',
        label: ''
      },
      DefaultHostName: {
        key: '',
        label: ''
      },
      DefaultFlowName: {
        key: '',
        label: ''
      },
      DefaultTriggerDesc: {
        key: '',
        label: ''
      },
      drawerNode: {
        HostType: '',
        HostValue: '',
        HostName: '',
        HostID: '',
      },
      drawerEdge: {
        HostType: '',
        HostValue: '',
        HostName: '',
        HostID: '',
        FlowName: '',
        FlowID: '',
        TriggerDesc: '',
        TriggerID: '',
      },
      labelCol: { span: 8 },
      wrapperCol: { span: 16 },
      hosttype: 'VM_WIN',
      HostTypeList: [
        {
          value: 'VM_WIN',
          label: 'Windows'
        },
        {
          value: 'VM_LIN',
          label: 'Linux'
        },
        {
          value: 'HW_SRV',
          label: '硬件服务器'
        },
        {
          value: 'HW_NET',
          label: '网络设备'
        }
      ],
      HostsList: [],
      curHostsList: [],
      hostsFilterList: [],
      hosts: '',
      FlowItemList: [],
      curFlowItemList: [],
      flowItemFilterList: [],
      flow: '',
      TriggerItemList: [],
      curTriggerItemList: [],
      triggerItemFilterList: [],
      trigger: ''
    }
  },
  props: {
    drawerType: {
      type: String
    },
    selectCell: {
      type: [String, Object]
    },
    graph: {
      type: [String, Object]
    },
    form: {
      type: Object
    },
    // grid:{
    // 	type: Object
    // }
  },
  watch: {
    selectCell: {
      handler(val) {
        if (val) {
          this.DefaultHostType = {
            key: '',
            label: ''
          },
            this.DefaultHostName = {
              key: '',
              label: ''
            },
            this.DefaultFlowName = {
              key: '',
              label: ''
            },
            this.DefaultTriggerDesc = {
              key: '',
              label: ''
            }
          // let val = JSON.parse(val)
          if (val.isNode()) { // 节点
            this.drawerNode.HostType = val.store.data.attrs.label.HostType
            this.drawerNode.HostValue = val.store.data.attrs.label.HostValue
            this.drawerNode.HostName = val.store.data.attrs.label.text
            this.drawerNode.HostID = val.store.data.attrs.label.HostID
            if (val.store.data.attrs.label.HostID) {
              this.DefaultHostType = {
                key: val.store.data.attrs.label.HostType,
                label: val.store.data.attrs.label.HostValue
              }
              this.DefaultHostName = {
                key: val.store.data.attrs.label.text,
                label: val.store.data.attrs.label.HostID
              }
            }
          } else { // 边
            if (val.store.data.labels) {
              if (val.store.data.labels[0].text) {
                this.drawerEdge.HostName = val.store.data.labels[0].text
              } else if (val.store.data.labels[0].attrs) {
                this.drawerEdge.HostName = val.store.data.labels[0].attrs.label.text
              }
            }
            this.drawerEdge.HostType = val.store.data.attrs.line.HostType
            this.drawerEdge.HostValue = val.store.data.attrs.line.HostValue
            this.drawerEdge.HostID = val.store.data.attrs.line.HostID
            this.drawerEdge.FlowName = val.store.data.attrs.line.FlowName
            this.drawerEdge.FlowID = val.store.data.attrs.line.FlowID
            this.drawerEdge.TriggerDesc = val.store.data.attrs.line.TriggerDesc
            this.drawerEdge.TriggerID = val.store.data.attrs.line.TriggerID
            if (val.store.data.attrs.line.HostID) {
              this.DefaultHostType = {
                key: val.store.data.attrs.line.HostType,
                label: val.store.data.attrs.line.HostValue
              }
              this.DefaultHostName = {
                key: val.store.data.attrs.line.HostID,
                label: this.drawerEdge.HostName,
              }
              this.DefaultFlowName = {
                key: val.store.data.attrs.line.FlowID,
                label: val.store.data.attrs.line.FlowName
              }
              this.DefaultTriggerDesc = {
                key: val.store.data.attrs.line.TriggerID,
                label: val.store.data.attrs.line.TriggerDesc
              }
            }
          }
        }
      },
      immediate: true,
      deep: false
    }
  },
  created() {
    // this.handleChange({key: 'VM_WIN', label: 'Windows'})
  },
  methods: {
    toTopZIndex() {
      this.selectCell.toFront()
    },
    deleteNode() {
      const cell = this.graph.getSelectedCells()
      this.graph.removeCells(cell)
      this.type = 'grid'
    },
    handleChange(e) {
      this.hosttype = e.key
      this.drawerNode.HostType = e.key
      this.drawerNode.HostValue = e.label
      if (this.drawerType == 'node') {
        this.selectCell.attr('label/HostValue', this.drawerNode.HostValue)
        this.selectCell.attr('label/HostType', this.drawerNode.HostType)
      }
      if (this.drawerType == 'edge') {
        this.drawerEdge.HostType = e.key
        this.drawerEdge.HostValue = e.label
        this.selectCell.attr('line/HostValue', this.drawerEdge.HostValue)
        this.selectCell.attr('line/HostType', this.drawerEdge.HostType)
      }
      let params = {
        page: 1,
        limit: 10000,
        hosttype: e.key,
        hosts: ''
      }
      hostList(params).then((resp) => {
        let res = resp.data
        if (res.code == 200) {
          this.HostsList = res.data.items
          this.hostsFilterList = this.HostsList
          this.curHostsList = this.hostsFilterList.slice(0, selectSize)
          if (this.HostsList.length > 0) {
            this.DefaultHostName = {
              key: this.HostsList[0].hostid.toString(),
              label: this.HostsList[0].name
            }
            this.handleHostChange(this.DefaultHostName)
          } else {
            this.$message.warn('该类型暂时没有设备')
            this.hosts = ''
            this.drawerNode.nodeText = ''
          }
        }
      })
    },
    filterOption(input, option) {
      return (
        option.componentOptions.children[0].text.toLowerCase().indexOf(input.toLowerCase()) >= 0
      )
    },
    handleHostChange(value) {
      this.drawerEdge.HostName = value.label
      this.drawerEdge.HostID = value.key
      this.drawerNode.HostName = value.label
      this.drawerNode.HostID = value.key
      if (this.drawerType == 'node') {
        this.selectCell.attr('label/text', this.drawerNode.HostName)
        this.selectCell.attr('label/HostID', this.drawerNode.HostID)
      }
      if (this.drawerType == 'edge') {
        this.selectCell.setLabels(
          [{
            attrs: {
              label: { text: this.drawerEdge.HostName, fontSize: 12, fill: '#333', },
              txt: {
                fill: "#7c68fc",
                textAnchor: "middle",
                textVerticalAnchor: "middle"
              },
              // body: {
              //   ref: 'label',
              //   fill: '#FFFFFF',
              //   stroke: '#00FF00',
              //   strokeWidth: 2,
              //   rx: 4,
              //   ry: 4,
              //   refWidth: '140%',
              //   refHeight: '140%',
              //   refX: '-20%',
              //   refY: '-20%',
              // },
            },
            position: {
              distance: 0.5,
              angle: 0,
              offset: -10,
              options: {
                keepGradient: true,
                ensureLegibility: true
              }
            }
          }]
        )
        this.selectCell.attr('line/HostID', this.drawerEdge.HostID)
      }
      let params = {
        hostid: value.key
      }
      itemTopoTraffic(params).then((resp) => {
        let res = resp.data
        if (res.code == 200) {
          this.FlowItemList = res.data.items
          this.flowItemFilterList = this.FlowItemList
          this.curFlowItemList = this.flowItemFilterList.slice(0, selectSize)
          if (this.FlowItemList.length > 0) {
            this.DefaultFlowName = {
              key: this.FlowItemList[0].itemid,
              label: this.FlowItemList[0].name
            }
          }
        }
      })
      triggerList(params).then((resp) => {
        let res = resp.data
        if (res.code == 200) {
          this.TriggerItemList = res.data.items
          this.triggerItemFilterList = this.TriggerItemList
          this.curTriggerItemList = this.triggerItemFilterList.slice(0, selectSize)
          if (this.TriggerItemList.length > 0) {
            this.DefaultTriggerDesc = {
              key: this.TriggerItemList[0].triggerid,
              label: this.TriggerItemList[0].description
            }
          }
        }
      })
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
        const match = item.name.toString().match(reg);
        return match;
      });
      this.curHostsList = this.hostsFilterList.slice(0, selectSize);
    }),
    handleFlowChange(value) {
      console.log(value)
      this.drawerEdge.FlowName = value.label
      this.drawerEdge.FlowID = value.key
      this.selectCell.attr('line/FlowName', this.drawerEdge.FlowName)
      this.selectCell.attr('line/FlowID', this.drawerEdge.FlowID)
    },
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
        const match = item.name.toString().match(reg);
        return match;
      });
      this.curFlowItemList = this.flowItemFilterList.slice(0, selectSize);
    }),
    handleTriggerChange(value) {
      this.drawerEdge.TriggerDesc = value.label
      this.drawerEdge.TriggerID = value.key
      this.selectCell.attr('line/TriggerDesc', this.drawerEdge.TriggerDesc)
      this.selectCell.attr('line/TriggerID', this.drawerEdge.TriggerID)
    },
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
        const match = item.description.toString().match(reg);
        return match;
      });
      this.curTriggerItemList = this.triggerItemFilterList.slice(0, selectSize);
    }),
  }
}
</script>