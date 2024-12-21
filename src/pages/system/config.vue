<template>
  <page-layout>
    <div class="linux-list">
      <a-table :loading="loading" :columns="columns" :data-source="list" :rowKey="(record) => { return record.id}">
        <span slot="id" slot-scope="record">{{record.id}}</span>
        <div slot="name" slot-scope="record">{{record.name}}</div>
        <div slot="value" slot-scope="record">{{record.value}}</div>
        <div slot="comment" slot-scope="record">{{record.comment}}</div>
        <div slot="updated_at" slot-scope="record">{{record.updated_at | parsetime}}</div>
        <!-- <div slot="status" slot-scope="record">
          <a-tag v-if="record.status == 1" color="#2f9e5e">{{$t('config_ok')}}</a-tag>
          <a-tag v-else-if="record.status == 0" color="#d05253">{{$t('cofnig_bad')}}</a-tag>
          <a-tag v-else status="default" :text="$t('conf_unknown')" />
        </div> -->
        <div slot="operation" slot-scope="record">
          <!-- <a-button class="pd20 paddingleft0" type="link" size="small" @click="seeEdit(record)">{{ $t('edit_btn') }}</a-button> -->
          <a-button class="pd20 paddingleft0" type="link" size="small" @click="edit(record)">{{ $t('edit_btn') }}</a-button>
          <!-- <a-button class="pd20 paddingleft0" type="link" size="small" @click="deployInit(record)">{{ $t('update_btn') }}</a-button> -->
        </div>
      </a-table>
      <a-drawer :title="title" :width="300" :visible="visible" :body-style="{ paddingBottom: '80px' }" @close="onClose">
        <a-row :gutter="[0, 16]">
          <a-col :span="24" style="display: flex; align-items: center;">
            <span style="display: flex; align-items: center; justify-content: left; width: 100px;">
              {{ $t('config_value') }}<span style="margin-left: 2px;">：</span>
            </span>
            <a-input v-model="config.value" :placeholder="$t('config_value')" />
          </a-col>
        </a-row>
        <a-row :gutter="[0, 16]">
          <a-col :span="24" style="display: flex; align-items: center;">
            <span style="display: flex; align-items: center; justify-content: left; width: 100px;">
              {{ $t('config_comment') }}<span style="margin-left: 2px;">：</span>
            </span>
            <span>{{ config.comment }}</span>
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
          <a-button :style="{ marginRight: '8px' }" type="primary" @click="saveData" :loading="saveLoading">{{ $t('save_btn') }}</a-button>
        </div>
      </a-drawer>
      <!-- <a-card :bordered="false">
        <a-form>
          <a-form-item :label="$t('dashname')" :labelCol="{span: 7}" :wrapperCol="{span: 10}" :required="false">
            <a-input v-model="dash.name" :placeholder="$t('placeholder_enter_bandwidth_name')" />
          </a-form-item>
          <a-form-item :label="$t('dashoard_id')" :labelCol="{span: 7}" :wrapperCol="{span: 10}" :required="false">
            <a-input v-model="dash.dashboard_id" :placeholder="$t('placeholder_enter_bandwidth_name')" />
          </a-form-item>
          <a-form-item :label="$t('dash_status')" :labelCol="{span: 7}" :wrapperCol="{span: 10}" :required="false">
            <a-switch v-model="dash.status" />
          </a-form-item>
          <a-form-item style="margin-top: 24px" :wrapperCol="{span: 10, offset: 7}">
            <a-button style="margin-left: 20px" type="primary" @click="saveData">{{$t('save')}}</a-button>
          </a-form-item>
        </a-form>
      </a-card> -->
    </div>
  </page-layout>
</template>

<script>
import PageLayout from '@/layouts/PageLayout'
import { parseTimeFun } from '@/utils/formatter'
import { configGetList, configGetOne, configUpdate } from '@/services/admin'
export default {
  name: 'edit',
  i18n: require('./i18n'),
  components: { PageLayout },
  data() {
    return {
      loading: false,
      list: [],
      columns: [
        {
          title: this.$t('table_headers_id'),
          key: 'id',
          align: 'left',
          scopedSlots: { customRender: 'id' }
        },
        {
          title: this.$t('config_name'),
          key: 'name',
          align: 'left',
          scopedSlots: { customRender: 'name' }
        },
        {
          title: this.$t('config_value'),
          key: 'value',
          align: 'left',
          scopedSlots: { customRender: 'value' }
        },
        {
          title: this.$t('config_comment'),
          key: 'comment',
          align: 'left',
          scopedSlots: { customRender: 'comment' }
        },
        {
          title: this.$t('config_updated_at'),
          key: 'updated_at',
          align: 'left',
          scopedSlots: { customRender: 'updated_at' }
        },
        {
          title: this.$t('table_headers_operation'),
          key: 'operation',
          align: 'center',
          scopedSlots: { customRender: 'operation' }
        }
      ],
      id: '',
      config: {
        value: '',
        status: 0
      },
      title: '',
      visible: false,
      grouplist: [],
      templateList: [],
      saveLoading: false,
      initLoading: false
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
          }
        })
        .finally(() => {
          this.loading = false
        })
    },
    //打开
    edit(record) {
      this.id = record.id
      this.title = record.name + '编辑'
      this.visible = true
      configGetOne(record.id)
        .then((resp) => {
          let res = resp.data
          if (res.code == 200) {
            this.title = res.data.items.name
            this.config = res.data.items
          }
        })
        .finally(() => {
          this.loading2 = false
        })
    },
    onClose() {
      this.visible = false
    },
    saveData() {
      configUpdate(this.id, this.config).then((resp) => {
        let res = resp.data
        if (res.code == 200) {
          this.$message.success(res.message)
          this.visible = false
          this.init()
        }
      })
    }
  }
}
</script>

<style lang="less" scoped>
.card {
  margin-bottom: 24px;
}
</style>
