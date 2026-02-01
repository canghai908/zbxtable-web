<template>
  <page-layout :title="$t('egress_config')">
    <div>
      <a-card :bordered="false">
        <a-alert message="配置说明" type="info" show-icon closable style="margin-bottom: 16px;">
          <template slot="description">
            出口配置用于监控网络出口的流量情况。请先选择 Zabbix 实例，然后选择主机和对应的入流量、出流量监控项。配置完成后，系统会自动采集数据并在首页展示。
          </template>
        </a-alert>

        <a-button type="primary" icon="plus" @click="handleAdd" style="margin-bottom: 16px;">
          {{ $t('add_egress') }}
        </a-button>

        <a-table 
          :columns="columns" 
          :data-source="dataSource" 
          :loading="loading"
          :pagination="false"
          rowKey="id"
        >
          <span slot="name" slot-scope="text, record">
            <a-input 
              v-if="record.editable" 
              v-model="record.name" 
              :placeholder="$t('placeholder_egress_name')"
              style="width: 100%"
            />
            <span v-else>{{ text }}</span>
          </span>

          <span slot="instance" slot-scope="text, record">
            <a-select 
              v-if="record.editable"
              v-model="record.zid"
              :placeholder="$t('select_instance')"
              @change="() => handleInstanceChange(record)"
              style="width: 100%"
              show-search
              option-filter-prop="children"
            >
              <a-select-option v-for="item in instanceList" :key="item.zid" :value="item.zid">
                {{ item.name }}
              </a-select-option>
            </a-select>
            <span v-else>{{ getInstanceName(text) }}</span>
          </span>

          <span slot="host" slot-scope="text, record">
            <a-select 
              v-if="record.editable"
              v-model="record.host_id"
              :placeholder="$t('select_host')"
              @change="() => handleHostChange(record)"
              style="width: 100%"
              show-search
              option-filter-prop="children"
              :disabled="!record.zid"
            >
              <a-select-option 
                v-for="item in record.hostList || []" 
                :key="item.hostid" 
                :value="item.hostid"
              >
                {{ item.name }}
              </a-select-option>
            </a-select>
            <span v-else>{{ getHostName(record) }}</span>
          </span>

          <span slot="in_item" slot-scope="text, record">
            <a-select 
              v-if="record.editable"
              v-model="record.in_item_id"
              :placeholder="$t('select_in_item')"
              style="width: 100%"
              show-search
              option-filter-prop="children"
              :disabled="!record.host_id"
            >
              <a-select-option 
                v-for="item in record.itemList || []" 
                :key="item.itemid" 
                :value="item.itemid"
              >
                {{ item.name }}
              </a-select-option>
            </a-select>
            <span v-else>{{ getItemName(record, 'in') }}</span>
          </span>

          <span slot="out_item" slot-scope="text, record">
            <a-select 
              v-if="record.editable"
              v-model="record.out_item_id"
              :placeholder="$t('select_out_item')"
              style="width: 100%"
              show-search
              option-filter-prop="children"
              :disabled="!record.host_id"
            >
              <a-select-option 
                v-for="item in record.itemList || []" 
                :key="item.itemid" 
                :value="item.itemid"
              >
                {{ item.name }}
              </a-select-option>
            </a-select>
            <span v-else>{{ getItemName(record, 'out') }}</span>
          </span>

          <span slot="status" slot-scope="text">
            <a-badge :status="text === 1 ? 'success' : 'default'" :text="text === 1 ? $t('enabled') : $t('disabled')" />
          </span>

          <span slot="action" slot-scope="text, record">
            <template v-if="record.editable">
              <a @click="() => handleSave(record)" style="margin-right: 8px;">{{ $t('save') }}</a>
              <a @click="() => handleCancel(record)">{{ $t('cancel') }}</a>
            </template>
            <template v-else>
              <a @click="() => handleEdit(record)" style="margin-right: 8px;">{{ $t('edit') }}</a>
              <a-popconfirm
                :title="$t('confirm_delete')"
                @confirm="() => handleDelete(record)"
                :ok-text="$t('yes')"
                :cancel-text="$t('no')"
              >
                <a style="color: #ff4d4f;">{{ $t('delete') }}</a>
              </a-popconfirm>
            </template>
          </span>
        </a-table>
      </a-card>
    </div>
  </page-layout>
</template>

<script>
import PageLayout from "@/layouts/PageLayout";
import { 
  egressConfigList, 
  egressConfigAdd, 
  egressConfigUpdate, 
  egressConfigDelete,
  hostSearch,
  itemListTraffic
} from "@/services/admin";
import { listZabbixInstance } from "@/services/zabbix";

export default {
  name: 'BandwidthConfig',
  i18n: require('./i18n'),
  components: { PageLayout },
  data() {
    return {
      loading: false,
      instanceList: [],
      dataSource: [],
      columns: [
        {
          title: this.$t('egress_name'),
          dataIndex: 'name',
          key: 'name',
          width: '15%',
          scopedSlots: { customRender: 'name' },
        },
        {
          title: this.$t('instance'),
          dataIndex: 'zid',
          key: 'zid',
          width: '15%',
          scopedSlots: { customRender: 'instance' },
        },
        {
          title: this.$t('host'),
          dataIndex: 'host_id',
          key: 'host_id',
          width: '15%',
          scopedSlots: { customRender: 'host' },
        },
        {
          title: this.$t('in_traffic_item'),
          dataIndex: 'in_item_id',
          key: 'in_item_id',
          width: '18%',
          scopedSlots: { customRender: 'in_item' },
        },
        {
          title: this.$t('out_traffic_item'),
          dataIndex: 'out_item_id',
          key: 'out_item_id',
          width: '18%',
          scopedSlots: { customRender: 'out_item' },
        },
        {
          title: this.$t('status'),
          dataIndex: 'status',
          key: 'status',
          width: '10%',
          scopedSlots: { customRender: 'status' },
        },
        {
          title: this.$t('action'),
          key: 'action',
          width: '10%',
          scopedSlots: { customRender: 'action' },
        },
      ],
    }
  },
  created() {
    this.loadInstances()
    this.loadData()
  },
  methods: {
    async loadInstances() {
      try {
        const res = await listZabbixInstance()
        const biz = (res && res.data) ? res.data : res
        if (biz && biz.code === 200) {
          this.instanceList = biz.data || []
        }
      } catch (e) {
        console.error('加载实例列表失败', e)
        this.$message.error('加载实例列表失败')
      }
    },
    async loadData() {
      this.loading = true
      try {
        const res = await egressConfigList()
        const biz = (res && res.data) ? res.data : res
        if (biz && biz.code === 200) {
          this.dataSource = (biz.data || []).map(item => ({
            ...item,
            editable: false,
            hostList: [],
            itemList: [],
          }))
        }
      } catch (e) {
        console.error('加载出口配置失败', e)
        this.$message.error('加载出口配置失败')
      } finally {
        this.loading = false
      }
    },
    handleAdd() {
      const newData = {
        id: `new_${Date.now()}`,
        name: '',
        zid: undefined,
        host_id: undefined,
        in_item_id: undefined,
        out_item_id: undefined,
        status: 1,
        sort_order: this.dataSource.length,
        editable: true,
        hostList: [],
        itemList: [],
        isNew: true,
      }
      this.dataSource = [...this.dataSource, newData]
    },
    handleEdit(record) {
      const target = this.dataSource.find(item => item.id === record.id)
      if (target) {
        target.editable = true
        target._backup = { ...target }
        // 加载主机和监控项列表
        if (target.zid) {
          this.loadHostList(target)
        }
        if (target.host_id) {
          this.loadItemList(target)
        }
      }
    },
    handleCancel(record) {
      if (record.isNew) {
        this.dataSource = this.dataSource.filter(item => item.id !== record.id)
      } else {
        const target = this.dataSource.find(item => item.id === record.id)
        if (target && target._backup) {
          Object.assign(target, target._backup)
          target.editable = false
          delete target._backup
        }
      }
    },
    async handleSave(record) {
      if (!record.name || !record.zid || !record.host_id || !record.in_item_id || !record.out_item_id) {
        this.$message.warning('请填写完整信息')
        return
      }

      this.loading = true
      try {
        const params = {
          name: record.name,
          zid: record.zid,
          host_id: record.host_id,
          in_item_id: record.in_item_id,
          out_item_id: record.out_item_id,
          status: record.status || 1,
          sort_order: record.sort_order || 0,
        }

        if (record.isNew) {
          const res = await egressConfigAdd(params)
          const biz = (res && res.data) ? res.data : res
          if (biz && biz.code === 200) {
            this.$message.success('添加成功')
            this.loadData()
          } else {
            this.$message.error(biz.message || '添加失败')
          }
        } else {
          const res = await egressConfigUpdate(record.id, params)
          const biz = (res && res.data) ? res.data : res
          if (biz && biz.code === 200) {
            this.$message.success('更新成功')
            this.loadData()
          } else {
            this.$message.error(biz.message || '更新失败')
          }
        }
      } catch (e) {
        console.error('保存失败', e)
        this.$message.error('保存失败')
      } finally {
        this.loading = false
      }
    },
    async handleDelete(record) {
      this.loading = true
      try {
        const res = await egressConfigDelete(record.id)
        const biz = (res && res.data) ? res.data : res
        if (biz && biz.code === 200) {
          this.$message.success('删除成功')
          this.loadData()
        } else {
          this.$message.error(biz.message || '删除失败')
        }
      } catch (e) {
        console.error('删除失败', e)
        this.$message.error('删除失败')
      } finally {
        this.loading = false
      }
    },
    async handleInstanceChange(record) {
      record.host_id = undefined
      record.in_item_id = undefined
      record.out_item_id = undefined
      record.hostList = []
      record.itemList = []
      if (record.zid) {
        await this.loadHostList(record)
      }
    },
    async handleHostChange(record) {
      record.in_item_id = undefined
      record.out_item_id = undefined
      record.itemList = []
      if (record.host_id) {
        await this.loadItemList(record)
      }
    },
    async loadHostList(record) {
      try {
        const res = await hostSearch({ zid: record.zid })
        const biz = (res && res.data) ? res.data : res
        if (biz && biz.code === 200) {
          record.hostList = biz.data.items || []
        }
      } catch (e) {
        console.error('加载主机列表失败', e)
      }
    },
    async loadItemList(record) {
      try {
        const res = await itemListTraffic({ 
          hostid: record.host_id,
          zid: record.zid 
        })
        const biz = (res && res.data) ? res.data : res
        if (biz && biz.code === 200) {
          record.itemList = biz.data.items || []
        }
      } catch (e) {
        console.error('加载监控项列表失败', e)
      }
    },
    getInstanceName(zid) {
      const instance = this.instanceList.find(item => item.zid === zid)
      return instance ? instance.name : zid
    },
    getHostName(record) {
      if (!record.hostList || record.hostList.length === 0) {
        return record.host_id
      }
      const host = record.hostList.find(item => item.hostid === record.host_id)
      return host ? host.name : record.host_id
    },
    getItemName(record, type) {
      const itemId = type === 'in' ? record.in_item_id : record.out_item_id
      if (!record.itemList || record.itemList.length === 0) {
        return itemId
      }
      const item = record.itemList.find(i => i.itemid === itemId)
      return item ? item.name : itemId
    },
  }
}
</script>

<style lang="less" scoped>
.card {
  margin-bottom: 24px;
}
</style>
