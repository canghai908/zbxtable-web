<template>
  <page-layout :title="title">
    <div>
      <a-card :bordered="false">
        <a-form>
          <a-form-item :label="$t('bindwidthone')" :labelCol="{span: 7}" :wrapperCol="{span: 10}" :required="false">
            <a-input v-model="egress.name_one" placeholder="请输入名称" />
          </a-form-item>
          <!-- Out1 -->
          <a-form-item :label="$t('bindwidthone_item')" :labelCol="{span: 7}" :wrapperCol="{span: 10}" :required="false">
            <a-select style="width: 30%" show-search optionFilterProp="label" :placeholder="$t('host_select')" option-label-prop="label" @search="handleOneSearch" @change="handlHostOneChange">
              <a-select-option v-for="(item, index) in hostonelist" :key="index" :value="item.hostid" :label="item.name" :title="item.name">
                {{ item.name }}
              </a-select-option>
            </a-select>
            <a-select style="width: 35%" v-model="egress.in_one" show-search optionFilterProp="label" :placeholder="$t('item_in')" option-label-prop="label" @change="handleInOneChange">
              <a-select-option v-for="(item, index) in itemOneList" :key="index" :value="item.itemid" :label="item.name" :title="item.name">
                {{ item.name }}
              </a-select-option>
            </a-select>
            <a-select style="width: 35%" v-model="egress.out_one" show-search optionFilterProp="label" :placeholder="$t('item_out')" option-label-prop="label" @change="handleOutOneChange">
              <a-select-option v-for="(item, index) in itemOneList" :key="index" :value="item.itemid" :label="item.name" :title="item.name">
                {{ item.name }}
              </a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item :label="$t('bindwidthtwo')" :labelCol="{span: 7}" :wrapperCol="{span: 10}" :required="false">
            <a-input v-model="egress.name_two" placeholder="请输入系统名称" />
          </a-form-item>
          <!-- Out2 -->
          <a-form-item :label="$t('bindwidthtwo_item')" :labelCol="{span: 7}" :wrapperCol="{span: 10}" :required="false">
            <a-select style="width: 30%" show-search optionFilterProp="label" :placeholder="$t('host_select')" option-label-prop="label" @search="handleTwoSearch" @change="handlHostTwoChange">
              <a-select-option v-for="(item, index) in hosttwolist" :key="index" :value="item.hostid" :label="item.name" :title="item.name">
                {{ item.name }}
              </a-select-option>
            </a-select>
            <a-select style="width: 35%" v-model="egress.in_two" show-search optionFilterProp="label" :placeholder="$t('item_in')" option-label-prop="label" @change="handleInTwoChange">
              <a-select-option v-for="(item, index) in itemTwoList" :key="index" :value="item.itemid" :label="item.name" :title="item.name">
                {{ item.name }}
              </a-select-option>
            </a-select>
            <a-select style="width: 35%" v-model="egress.out_two" show-search optionFilterProp="label" :placeholder="$t('item_out')" option-label-prop="label" @change="handleOutTwoChange">
              <a-select-option v-for="(item, index) in itemTwoList" :key="index" :value="item.itemid" :label="item.name" :title="item.name">
                {{ item.name }}
              </a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item style="margin-top: 24px" :wrapperCol="{span: 10, offset: 7}">
            <a-button style="margin-left: 20px" type="primary" @click="saveData">{{$t('save')}}</a-button>
          </a-form-item>
        </a-form>
      </a-card>
    </div>
  </page-layout>
</template>

<script>
import PageLayout from "@/layouts/PageLayout";
import { egressGet, egressUpdate, itemListTraffic, hostSearch } from "@/services/admin";
export default {
  name: 'edit',
  i18n: require('./i18n'),
  components: { PageLayout, },
  data() {
    return {
      loading: false,
      hostonelist: [],
      hosttwolist: [],
      itemOneList: [],
      itemTwoList: [],
      id: '',
      egress: {
        name_one: '',
        in_one: '',
        out_one: undefined,
        name_two: '',
        in_two: undefined,
        out_two: undefined,
      },
      title: ''
    }
  },
  created() {
    this.init()
  },
  methods: {
    init() {
      this.loading = true
      egressGet().then((resp) => {
        let res = resp.data
        if (res.code == 200) {
          this.egress = res.data.items || []
          if (this.egress.in_one == '') {
            this.egress.in_one = undefined
          }
          if (this.egress.out_one == '') {
            this.egress.out_one = undefined
          }
          if (this.egress.in_two == '') {
            this.egress.in_two = undefined
          }
          if (this.egress.out_two == '') {
            this.egress.out_two = undefined
          }
        }
      }).finally(() => { this.loading2 = false })
    },
    handleOneSearch(name) {
      let params = {
        name: name
      }
      hostSearch(params).then((resp) => {
        let res = resp.data
        if (res.code == 200) {
          console.log(res.data)
          this.hostonelist = res.data.items || []
        }
      })
    },
    handleTwoSearch(name) {
      let params = {
        name: name
      }
      hostSearch(params).then((resp) => {
        let res = resp.data
        if (res.code == 200) {
          this.hosttwolist = res.data.items || []
        }
      })
    },
    handlHostOneChange(value) {
      console.log(value)
      let params = {
        hostid: value
      }
      itemListTraffic(params).then((resp) => {
        let res = resp.data
        if (res.code == 200) {
          console.log(res.data)
          this.itemOneList = res.data.items || []
          console.log(this.itemList)
        }
      })
    },
    handlHostTwoChange(value) {
      let params = {
        hostid: value
      }
      itemListTraffic(params).then((resp) => {
        let res = resp.data
        if (res.code == 200) {
          this.itemTwoList = res.data.items || []
        }
      })
    },
    handleInOneChange(value) {
      this.egress.in_one = value
    },
    handleOutOneChange(value) {
      this.egress.out_one = value
    },
    handleInTwoChange(value) {
      this.egress.in_two = value
    },
    handleOutTwoChange(value) {
      this.egress.out_two = value
    },
    saveData() {
      console.log(this.egress)
      egressUpdate(this.egress).then((resp) => {
        let res = resp.data
        if (res.code == 200) {
          this.$message.success(res.message)
        }
      })
    },
  }
}
</script>

<style lang="less" scoped>
.card {
  margin-bottom: 24px;
}
</style>
