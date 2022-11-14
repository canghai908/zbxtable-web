<template>
  <page-layout :noTitle="true">
    <a-form-model ref="ruleForm" :model="form" :loading="loading" :label-col="labelCol" :wrapper-col="wrapperCol">
      <a-form-model-item label="链路名称" prop="name">
        <a-input v-model="form.name" />
      </a-form-model-item>
      <a-form-model-item label="设备类型" prop="hoststype">
        <a-select v-model="form.hoststype" :default-value="DefaultHostType" @change="handleChange">
          <a-select-option v-for="(item, index) in HostTypeList" :key="index" :value="item.value" :label="item.label">
            {{ item.label }}
          </a-select-option>
        </a-select>
      </a-form-model-item>
      <a-form-model-item label="主机" prop="hosts">
        <a-select v-model="form.hosts" show-search @popupScroll="handleHostPopupScroll" @search="handleHostSearch" option-filter-prop="label" @change="handleHostChange">
          <a-select-option v-for="(handle, index) in curHostsList" :key="index" :title="handle.name" :label="handle.name" :value="handle.hostid">
            {{ handle.name }}
          </a-select-option>
        </a-select>
      </a-form-model-item>
      <a-form-model-item label="接口" prop="items">
        <a-select mode="multiple" show-search v-model="form.items" @popupScroll="handlePopupScroll" @change="handleFlowChange" @search="handleSearch" option-filter-prop="label">
          <a-select-option v-for="(flow, index) in curFlowItemList" :key="index" :label="flow.name" :title="flow.name" :value="flow.itemid">
            {{ flow.name }}
          </a-select-option>
        </a-select>
      </a-form-model-item>
      <a-form-model-item label="链路带宽" prop="linkbandwidth">
        <a-input v-model="form.linkbandwidth" addon-after="MB" placeholder="各带宽之间使用逗号分隔单位为MB" />
      </a-form-model-item>
      <a-form-model-item label="接收人邮箱" prop="emails">
        <a-input v-model.trim="form.emails" placeholder="多个邮箱使用逗号分隔" />
      </a-form-model-item>
      <!-- <a-form-model-item label="Activity time">
        <a-date-picker v-model="form.date1" show-time type="date" placeholder="Pick a date" style="width: 100%;" />
      </a-form-model-item> -->
      <a-form-model-item label="周期" prop="cycle">
        <a-checkbox-group v-model="form.cycle">
          <a-checkbox value="day" name="type">
            每天
          </a-checkbox>
          <a-checkbox value="week" name="type">
            每周
          </a-checkbox>
        </a-checkbox-group>
      </a-form-model-item>
      <a-form-model-item label="状态" prop="status">
        <a-switch checked-children="启用" un-checked-children="禁用" v-model="form.status" default-checked @change="statuschanage" />
      </a-form-model-item>
      <a-form-model-item label="备注">
        <a-input v-model="form.desc" type="textarea" placeholder="备注" />
      </a-form-model-item>
      <a-form-model-item :wrapper-col="{ span: 12, offset: 8 }">
        <a-button type="primary" @click="onSubmit">
          提交
        </a-button>
        <a-button style="margin-left: 10px;" @click="back">
          返回
        </a-button>
      </a-form-model-item>
    </a-form-model>
  </page-layout>
</template>
<script>
const selectSize = 30
import PageLayout from '@/layouts/PageLayout'
import { hostList, itemListTraffic, reportGet, reportPut } from "@/services/admin"
const debounce = (func, delay = 60) => {
  let timer = null;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => func.apply(this, args), delay);
  }
};
export default {
  name: "add",
  components: { PageLayout },
  data() {
    return {
      labelCol: { span: 6 },
      wrapperCol: { span: 6 },
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
      //带宽列表  
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
      form: {
        name: '',
        hoststype: '',
        hosts: '',
        items: [],
        linkbandwidth: [],
        cycle: ['day', 'week'],
        emails: '',
        status: 1,
        report_type: '1',
        desc: '',
      },
      HostsList: [],
      curHostsList: [],
      hostsFilterList: [],
      hosts: '',
      FlowItemList: [],
      curFlowItemList: [],
      flowItemFilterList: [],
      flow: '',
      itemmlist: [],
      rules: {
        name: [{ required: true, message: '请输入链路名称', trigger: 'blur' },],
        hoststype: [{ required: true, message: '请选择设备类型', trigger: 'change' }],
        hosts: [{ required: true, message: '请选择主机', trigger: 'change' }],
        items: [{ required: true, message: '请选择接口', trigger: 'change' }],
        emails: [{ required: false, message: '请输入邮箱', trigger: 'blur' }],
        linkbandwidth: [{ type: 'number', required: true, message: '请输入正确的带宽', trigger: 'blur' }],
        cycle: [{ type: 'array', required: true, message: '请选择报表周期', trigger: 'change', },],
        status: [{ required: true, message: '请选择状态', trigger: 'change' }],
        desc: [{ required: false, }],
      },
    };
  },
  created() {
    this.id = this.$route.query.id || ""
    this.init(this.id)
  },
  methods: {
    init(id) {
      this.loading = true
      reportGet(id).then((resp) => {
        let res = resp.data
        if (res.code == 200) {
          this.form = res.data.items || []
          this.form.items = res.data.items.items.split(',')
          console.log(this.form.items)
          console.log(this.form)
        }
      }).finally(() => { this.loading = false })
    },
    onSubmit() {
      reportPut(this.id, this.form).then((resp) => {
        console.log(this.form)
        let res = resp.data
        if (res.code == 200) {
          this.$message.success('修改成功')
          console.log(this.form);
          this.$router.push('/report/traffic')
        }
      })
    },
    handleChange(e) {
      this.hosttype = e
      let params = {
        page: 1,
        limit: 10000,
        hosttype: e,
        hosts: ''
      }
      hostList(params).then((resp) => {
        let res = resp.data
        if (res.code == 200) {
          this.HostsList = res.data.items
          console.log(this.HostsList)
          this.hostsFilterList = this.HostsList
          this.curHostsList = this.hostsFilterList.slice(0, selectSize)
        }
      })
    },
    handleHostChange(value) {
      let params = {
        hostid: value
      }
      itemListTraffic(params).then((resp) => {
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
      console.log('flow', value)
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
    statuschanage(checked) {
      console.log(checked)
    },
    back() {
      this.$router.push("/report/traffic")
    }
  },
};
</script>