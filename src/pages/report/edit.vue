<template>
  <page-layout :noTitle="true">
    <a-form-model ref="ruleForm" :model="form" :loading="loading" :label-col="labelCol" :wrapper-col="wrapperCol">
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
      <a-form-model-item :label="$t('interfacetype')" prop="hosts">
        <a-select v-model="form.hosts" show-search @popupScroll="handleHostPopupScroll" @search="handleHostSearch" option-filter-prop="label" @change="handleHostChange">
          <a-select-option v-for="(handle, index) in curHostsList" :key="index" :title="handle.name" :label="handle.name" :value="handle.hostid">
            {{ handle.name }}
          </a-select-option>
        </a-select>
      </a-form-model-item>
      <a-form-model-item :label="$t('interface')" prop="items">
        <a-select mode="multiple" show-search v-model="form.items" @popupScroll="handlePopupScroll" @change="handleFlowChange" @search="handleSearch" option-filter-prop="label">
          <a-select-option v-for="(flow, index) in curFlowItemList" :key="index" :label="flow.name" :title="flow.name" :value="flow.itemid">
            {{ flow.name }}
          </a-select-option>
        </a-select>
      </a-form-model-item>
      <a-form-model-item :label="$t('bandwidth')" prop="linkbandwidth">
        <a-input v-model="form.linkbandwidth" addon-after="MB" :placeholder="$t('bandwidth_placeholder')" />
      </a-form-model-item>
      <a-form-model-item :label="$t('email')" prop="emails">
        <a-input v-model.trim="form.emails" :placeholder="$t('email_placeholder')" />
      </a-form-model-item>
      <!-- <a-form-model-item label="Activity time">
        <a-date-picker v-model="form.date1" show-time type="date" placeholder="Pick a date" style="width: 100%;" />
      </a-form-model-item> -->
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
        <a-switch :checked-children="$t('status_enabled')" :un-checked-children="$t('status_disabled')" v-model="form.status" default-checked @change="statuschanage" />
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
  i18n: require('./i18n'),
  components: { PageLayout },
  data() {
    return {
      labelCol: { span: 6 },
      wrapperCol: { span: 6 },
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
        name: [{ required: true, message: this.$t('message_report_name'), trigger: 'blur' },],
        hoststype: [{ required: true, message: this.$t('message_host_type'), trigger: 'change' }],
        hosts: [{ required: true, message: this.$t('message_host'), trigger: 'change' }],
        items: [{ required: true, message: this.$t('message_interface'), trigger: 'change' }],
        linkbandwidth: [{ type: 'number', required: true, message: this.$t('message_bandwidth'), trigger: 'blur' }],
        emails: [{ required: false, message: this.$t('message_email'), trigger: 'blur' }],
        cycle: [{ type: 'array', required: true, message: this.$t('message_reporting_period'), trigger: 'change', },],
        status: [{ required: true, message: this.$t('message_state'), trigger: 'change' }],
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
          this.$message.success(this.$t('message_task_edited'));
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
