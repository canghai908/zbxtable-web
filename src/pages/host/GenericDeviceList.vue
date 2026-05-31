<template>
  <component :is="wrapper" v-bind="wrapperProps">
    <div class="generic-device-list">
      <!-- 搜索栏 -->
      <div class="search-bar-row">
        <a-form-model class="home-search" layout="inline" :colon="false">
          <a-form-model-item label="设备名称">
            <a-input v-model.trim="hosts" placeholder="设备名称" allow-clear />
          </a-form-model-item>
          <a-form-model-item label="IP地址">
            <a-input v-model.trim="interfaces" placeholder="IP地址" allow-clear />
          </a-form-model-item>
          <a-form-model-item label="采集状态">
            <a-select style="width: 120px" v-model="available">
              <a-select-option value="">全部</a-select-option>
              <a-select-option value="1">正常</a-select-option>
              <a-select-option value="2">异常</a-select-option>
            </a-select>
          </a-form-model-item>
          <a-form-model-item>
            <a-button type="primary" @click="onQuery">查询</a-button>
            <a-button style="margin-left: 10px" @click="resetSearch">重置</a-button>
            <a-button type="primary" style="margin-left: 10px" @click="handleExport">导出</a-button>
          </a-form-model-item>
        </a-form-model>
        <!-- 字段设置按钮（有 typeId 时才显示） -->
        <a-button
          v-if="typeId"
          icon="setting"
          class="field-config-btn"
          @click="fieldDrawerVisible = true"
        >字段设置</a-button>
      </div>

      <!-- 字段配置抽屉 -->
      <asset-type-field-drawer
        :visible="fieldDrawerVisible"
        :asset-type="typeId ? { id: typeId, name: typeName } : null"
        @close="fieldDrawerVisible = false"
        @saved="onFieldsSaved"
      />

      <!-- 设备列表 -->
      <a-table
        :loading="loading"
        :columns="tableColumns"
        :data-source="list"
        @change="changePage"
        :pagination="pagination"
        :rowKey="(r, i) => (r.hostid ? r.hostid + '-' + i : 'row-' + i)"
        size="small"
      >
        <!-- 通用文本字段（资产字段在编辑态下可内联编辑；长文本省略+悬浮显示全文） -->
        <template v-for="col in textColumns" :slot="col.key" slot-scope="record">
          <span :key="col.key">
            <template v-if="isEditing(record) && isEditableField(col.key)">
              <a-date-picker
                v-if="isDateField(col.key)"
                v-model="editForm[col.key]"
                value-format="YYYY-MM-DD"
                size="small"
                style="width: 100%;"
              />
              <a-input v-else v-model.trim="editForm[col.key]" size="small" />
            </template>
            <a-tooltip v-else-if="record[col.key]" :title="record[col.key]" placement="topLeft">
              <span class="cell-ellipsis">{{ record[col.key] }}</span>
            </a-tooltip>
            <template v-else>--</template>
          </span>
        </template>

        <!-- 维保到期：按距当前时间远近显示不同风格的 Tag（已过期 / 紧急 / 临近 / 提醒 / 正常） -->
        <span slot="date_hw_expiry" slot-scope="record">
          <a-date-picker
            v-if="isEditing(record)"
            v-model="editForm.date_hw_expiry"
            value-format="YYYY-MM-DD"
            size="small"
            style="width: 100%;"
          />
          <a-tooltip v-else-if="record.date_hw_expiry" :title="expiryStatus(record.date_hw_expiry).tip">
            <a-tag :color="expiryStatus(record.date_hw_expiry).color">
              {{ record.date_hw_expiry }}
              <span style="margin-left: 4px;">{{ expiryStatus(record.date_hw_expiry).text }}</span>
            </a-tag>
          </a-tooltip>
          <template v-else>--</template>
        </span>

        <div slot="instance_name" slot-scope="record">
          <a-tag :color="$themeColor">{{ record.instance_name || '未知' }}</a-tag>
        </div>

        <div slot="cpu_utilization" slot-scope="record">
          <a-progress :percent="parseFloat(record.cpu_utilization || 0)" size="small" status="active" />
        </div>

        <div slot="memory_utilization" slot-scope="record">
          <a-progress :percent="parseFloat(record.memory_utilization || 0)" size="small" status="active" />
        </div>

        <div slot="ping" slot-scope="record">
          <a-tag v-if="record.ping && record.ping.includes('Up')" color="#34af67">Up</a-tag>
          <a-tag v-else-if="record.ping && record.ping.includes('Down')" color="#DC143C">Down</a-tag>
          <a-tag v-else color="#808080">Unknown</a-tag>
          <span v-if="record.ping_sec" style="font-size: 12px; color: #888;">
            {{ (record.ping_sec || '').replace(/\s/g, '') }}/{{ (record.ping_loss || '').replace(/\s/g, '') }}
          </span>
        </div>

        <span slot="available" slot-scope="record">
          <a-tooltip>
            <template slot="title">{{ record.error }}</template>
            <a-tag v-if="record.available == 1" color="#34af67">正常</a-tag>
            <a-tag v-else-if="record.available == 2" color="#DC143C">异常</a-tag>
            <a-tag v-else color="#808080">未知</a-tag>
          </a-tooltip>
        </span>

        <span slot="operation" slot-scope="record">
          <template v-if="isEditing(record)">
            <a-button type="link" size="small" @click="saveRow(record)">保存</a-button>
            <a-popconfirm title="放弃修改？" @confirm="cancelRow()">
              <a-button type="link" size="small">取消</a-button>
            </a-popconfirm>
          </template>
          <template v-else>
            <a-button v-if="hasEditableColumn" type="link" size="small" @click="editRow(record)">编辑</a-button>
            <a-button type="link" size="small" @click="seeGraph(record)">查看图形</a-button>
            <a-button type="link" size="small" @click="seeInfo(record)">详细信息</a-button>
          </template>
        </span>
      </a-table>

      <!-- 查看图形弹窗（复用原列表页“查看图形”内容） -->
      <a-modal
        :visible="graphVisible"
        :title="`监控图形 - ${detailRecord.name || ''}`"
        :width="1200"
        :footer="null"
        @cancel="closeGraph"
      >
        <a-form-model layout="inline" :colon="false" style="margin-bottom: 12px; text-align: center;">
          <a-form-model-item label="时间范围">
            <a-range-picker
              format="YYYY-MM-DD HH:mm:ss"
              :show-time="{ format: 'HH:mm', defaultValue: [moment('00:00:00', 'HH:mm:ss'), moment('23:59:59', 'HH:mm:ss')] }"
              v-model="timeValue"
              @change="changeGraphTime"
              :getCalendarContainer="triggerNode => triggerNode.parentNode || document.body"
            />
          </a-form-model-item>
          <a-form-model-item>
            <a-button type="primary" @click="fetchGraph">查询</a-button>
            <a-button style="margin-left: 8px;" @click="() => { resetGraphRange(); fetchGraph(); }">重置</a-button>
          </a-form-model-item>
        </a-form-model>

        <a-spin :spinning="graphLoading">
          <div class="detail-graph-container">
            <div v-if="sortedPngData && sortedPngData.length > 0">
              <div v-for="item in sortedPngData" :key="item.name" class="detail-graph-item">
                <h4>{{ item.name }}</h4>
                <img :src="`data:image/png;base64,${item.png}`" :alt="item.name" />
              </div>
            </div>
            <a-empty v-else-if="!graphLoading" description="暂无图表数据" />
          </div>
        </a-spin>
      </a-modal>

      <!-- 详细信息弹窗 -->
      <a-modal
        :visible="infoVisible"
        :title="`详细信息 - ${detailRecord.name || ''}`"
        :width="760"
        :footer="null"
        @cancel="closeInfo"
      >
        <a-descriptions bordered size="small" :column="2">
          <a-descriptions-item label="设备名称">{{ detailRecord.name || '--' }}</a-descriptions-item>
          <a-descriptions-item label="主机ID">{{ detailRecord.hostid || '--' }}</a-descriptions-item>
          <a-descriptions-item label="所属实例">
            <a-tag :color="$themeColor">{{ detailRecord.instance_name || '未知' }}</a-tag>
          </a-descriptions-item>
          <a-descriptions-item label="IP地址">{{ detailRecord.interfaces || '--' }}</a-descriptions-item>
          <a-descriptions-item label="采集状态">
            <a-tag v-if="detailRecord.available == 1" color="#34af67">正常</a-tag>
            <a-tag v-else-if="detailRecord.available == 2" color="#DC143C">异常</a-tag>
            <a-tag v-else color="#808080">未知</a-tag>
          </a-descriptions-item>
          <a-descriptions-item label="Ping状态">
            <a-tag v-if="detailRecord.ping && detailRecord.ping.includes('Up')" color="#34af67">Up</a-tag>
            <a-tag v-else-if="detailRecord.ping && detailRecord.ping.includes('Down')" color="#DC143C">Down</a-tag>
            <a-tag v-else color="#808080">Unknown</a-tag>
          </a-descriptions-item>
          <a-descriptions-item label="操作系统" :span="2">{{ detailRecord.os || '--' }}</a-descriptions-item>
          <a-descriptions-item label="运行时长">{{ detailRecord.uptime || '--' }}</a-descriptions-item>
          <a-descriptions-item label="CPU使用率">{{ fmtPercent(detailRecord.cpu_utilization) }}</a-descriptions-item>
          <a-descriptions-item label="内存使用率">{{ fmtPercent(detailRecord.memory_utilization) }}</a-descriptions-item>
          <a-descriptions-item label="设备型号">{{ detailRecord.model || '--' }}</a-descriptions-item>
          <a-descriptions-item label="序列号">{{ detailRecord.serial_no || '--' }}</a-descriptions-item>
          <a-descriptions-item label="厂商">{{ detailRecord.vendor || '--' }}</a-descriptions-item>
          <a-descriptions-item label="设备位置">{{ detailRecord.location || '--' }}</a-descriptions-item>
          <a-descriptions-item label="部门">{{ detailRecord.department || '--' }}</a-descriptions-item>
          <a-descriptions-item label="资产编号">{{ detailRecord.resource_id || '--' }}</a-descriptions-item>
          <a-descriptions-item label="MAC地址">{{ detailRecord.mac || '--' }}</a-descriptions-item>
          <a-descriptions-item label="安装时间">{{ detailRecord.date_hw_install || '--' }}</a-descriptions-item>
          <a-descriptions-item label="维保到期">
            <a-tooltip v-if="detailRecord.date_hw_expiry" :title="expiryStatus(detailRecord.date_hw_expiry).tip">
              <a-tag :color="expiryStatus(detailRecord.date_hw_expiry).color">
                {{ detailRecord.date_hw_expiry }}
                <span style="margin-left: 4px;">{{ expiryStatus(detailRecord.date_hw_expiry).text }}</span>
              </a-tag>
            </a-tooltip>
            <template v-else>--</template>
          </a-descriptions-item>
        </a-descriptions>
      </a-modal>
    </div>
  </component>
</template>

<script>
import PageLayout from '@/layouts/PageLayout'
import moment from 'moment'
import { hostList, hostExport, hostUpdate, hostGraph, getAssetTypes, getAssetTypeFields } from '@/services/admin'
import { parseTimeFun, expiryStatus } from '@/utils/formatter'
import AssetTypeFieldDrawer from '@/pages/system/asset-type-fields.vue'

// 专用 slot key（有单独的 template slot，不走通用文本 slot）
const DEDICATED_SLOTS = new Set([
  'instance_name', 'cpu_utilization', 'memory_utilization', 'ping', 'available', 'operation',
  'date_hw_expiry',
])

// 可内联编辑的资产字段（与原 inventory 页面一致）
const EDITABLE_FIELDS = new Set([
  'location', 'department', 'resource_id', 'mac', 'date_hw_install', 'date_hw_expiry',
])

// 日期型可编辑字段
const DATE_FIELDS = new Set(['date_hw_install', 'date_hw_expiry'])

export default {
  name: 'GenericDeviceList',
  components: { PageLayout, AssetTypeFieldDrawer },
  props: {
    // 嵌入模式时，typeCode 由父组件传入；独立路由时从 $route.meta 读取
    typeCode: { type: String, default: '' },
    // 嵌入模式：不加 page-layout 包装
    embedded: { type: Boolean, default: false },
  },
  data() {
    return {
      moment, // 供模板中 a-range-picker 默认值使用
      effectiveTypeCode: '',
      typeName: '',
      typeId: null,
      fieldConfigs: [],
      hosts: '',
      interfaces: '',
      available: '',
      page: 1,
      pageSize: 10,
      loading: false,
      list: [],
      // 内联编辑状态：当前编辑行的唯一标识 + 编辑表单
      editingId: '',
      editForm: {},
      // 字段配置抽屉
      fieldDrawerVisible: false,
      // 详情/图形弹窗
      graphVisible: false,
      infoVisible: false,
      detailRecord: {},
      // 图形弹窗（复用原“查看图形”弹窗逻辑）
      graphLoading: false,
      pngData: [],
      sortedPngData: [],
      timeValue: [],
      beginTime: '',
      endTime: '',
      pagination: {
        total: 0, current: 1, pageSize: 10,
        'show-quick-jumper': true,
        'page-size-options': ['10', '20', '30', '40', '50', '100', '200'],
        'show-size-changer': true,
        'show-total': (total) => `共 ${total} 条`,
      },
    }
  },
  computed: {
    // 独立模式用 page-layout 包裹，嵌入模式用普通 div
    wrapper() {
      return this.embedded ? 'div' : PageLayout
    },
    wrapperProps() {
      return this.embedded ? {} : { noTitle: true }
    },
    visibleFields() {
      return [...(this.fieldConfigs || [])]
        .filter((f) => f.visible)
        .sort((a, b) => a.order - b.order)
    },
    textColumns() {
      return this.visibleFields.filter(
        (f) => f.render === 'text' && !DEDICATED_SLOTS.has(f.key)
      )
    },
    // 当前可见字段中是否存在可编辑的资产字段（决定是否显示"编辑"按钮）
    hasEditableColumn() {
      return this.visibleFields.some((f) => EDITABLE_FIELDS.has(f.key))
    },
    tableColumns() {
      const cols = this.visibleFields.map((f) => {
        // 不设 dataIndex：scopedSlots 的 slot-scope 拿到整行 record（与 linuxList 一致）
        const col = {
          title: f.label, key: f.key, align: 'left',
          scopedSlots: { customRender: f.key },
        }
        if (f.width) col.width = f.width
        return col
      })
      const opWidth = this.hasEditableColumn ? 220 : 170
      cols.push({ title: '操作', key: 'operation', align: 'left', width: opWidth, fixed: 'right', scopedSlots: { customRender: 'operation' } })
      return cols
    },
  },
  watch: {
    // 嵌入模式：父组件传入新的 typeCode 时重新加载
    typeCode(newVal) {
      if (newVal && newVal !== this.effectiveTypeCode) {
        this.effectiveTypeCode = newVal
        this.resetAndLoad()
      }
    },
    // 独立路由模式：路由变化时重新加载
    '$route'(to) {
      const code = to.meta && to.meta.type_code
      if (code && code !== this.effectiveTypeCode) {
        this.effectiveTypeCode = code
        this.resetAndLoad()
      }
    },
  },
  created() {
    this.effectiveTypeCode =
      this.typeCode || (this.$route.meta && this.$route.meta.type_code) || ''
    this.loadTypeConfig()
  },
  methods: {
    onQuery() {
      this.page = 1
      this.fetchList()
    },
    // 字段配置保存后重新加载字段配置并刷新列
    async onFieldsSaved() {
      if (!this.typeId) return
      try {
        const fieldsRes = await getAssetTypeFields(this.typeId)
        this.fieldConfigs = (fieldsRes.data && fieldsRes.data.data) || []
      } catch { /* silent */ }
    },
    resetAndLoad() {
      this.hosts = ''; this.interfaces = ''; this.available = ''
      this.page = 1; this.fieldConfigs = []
      this.loadTypeConfig()
    },
    async loadTypeConfig() {
      if (!this.effectiveTypeCode) return
      try {
        const typesRes = await getAssetTypes()
        const types = (typesRes.data && typesRes.data.data) || []
        const typeInfo = types.find((t) => t.type_code === this.effectiveTypeCode)
        if (typeInfo) {
          this.typeName = typeInfo.name
          this.typeId = typeInfo.id
          const fieldsRes = await getAssetTypeFields(typeInfo.id)
          this.fieldConfigs = (fieldsRes.data && fieldsRes.data.data) || []
        }
      } catch (e) { /* silent */ }
      this.fetchList()
    },
    fetchList() {
      if (!this.effectiveTypeCode) return
      this.loading = true
      this.cancelRow() // 切换数据时退出编辑态
      hostList({
        page: this.page, limit: this.pageSize,
        hosttype: this.effectiveTypeCode,
        hosts: this.hosts, ip: this.interfaces, available: this.available,
      }).then((resp) => {
        const res = resp.data
        if (res.code == 200) {
          this.pagination.total = res.data.total
          this.pagination.current = this.page
          this.pagination.pageSize = this.pageSize
          this.list = res.data.items || []
        }
      }).finally(() => { this.loading = false })
    },
    changePage(e) { this.page = e.current; this.pageSize = e.pageSize; this.fetchList() },

    // ── 内联编辑 ──────────────────────────────────────────────
    rowId(record) {
      return `${record.zid || 0}_${record.hostid}`
    },
    isEditing(record) {
      return this.editingId === this.rowId(record)
    },
    isEditableField(key) {
      return EDITABLE_FIELDS.has(key)
    },
    isDateField(key) {
      return DATE_FIELDS.has(key)
    },
    editRow(record) {
      this.editingId = this.rowId(record)
      const form = {}
      EDITABLE_FIELDS.forEach((k) => { form[k] = record[k] || '' })
      this.editForm = form
    },
    cancelRow() {
      this.editingId = ''
      this.editForm = {}
    },
    saveRow(record) {
      const payload = Object.assign({}, record, this.editForm)
      hostUpdate(payload).then((resp) => {
        const res = resp.data
        if (res && res.code === 200) {
          // 本地回填，避免整页刷新
          EDITABLE_FIELDS.forEach((k) => { this.$set(record, k, this.editForm[k]) })
          this.cancelRow()
          this.$message.success('保存成功')
        } else {
          this.$message.error((res && res.message) || '保存失败')
        }
      }).catch(() => this.$message.error('保存失败'))
    },
    resetSearch() {
      this.hosts = ''; this.interfaces = ''; this.available = ''
      this.page = 1; this.fetchList()
    },
    handleExport() {
      hostExport(
        { hosttype: this.effectiveTypeCode, hosts: this.hosts, ip: this.interfaces, available: this.available },
        { responseType: 'arraybuffer' }
      ).then((resp) => {
        const cd = resp.headers['content-disposition'] || ''
        let filename = (cd.split(';').find((n) => n.includes('filename=')) || '')
          .replace('filename=', '').trim() || `${this.typeName || this.effectiveTypeCode}.xlsx`
        const url = window.URL.createObjectURL(new Blob([resp.data]))
        const link = document.createElement('a')
        link.href = url; link.setAttribute('download', filename)
        document.body.appendChild(link); link.click(); link.remove()
      })
    },
    // 查看图形：弹窗展示该主机的监控图表（复用原列表页“查看图形”）
    seeGraph(record) {
      this.detailRecord = record
      this.graphVisible = true
      this.resetGraphRange()
      this.fetchGraph()
    },
    closeGraph() {
      this.graphVisible = false
      this.pngData = []
      this.sortedPngData = []
    },
    // 详细信息：内置类型跳转到各自原详情页；自定义类型无专属页则弹窗展示信息
    seeInfo(record) {
      const route = this.detailRouteFor(record)
      if (route) {
        this.$router.push(route)
      } else {
        this.detailRecord = record
        this.infoVisible = true
      }
    },
    // 按设备类型返回对应原详情页路由，无对应页面返回空串
    detailRouteFor(record) {
      const id = record.hostid
      const zid = record.zid
      const code = record.type_code || this.effectiveTypeCode
      // from=assets 标记来源，fromType 记录设备类型，供详情页“返回”定位到对应类型
      const from = `&from=assets&fromType=${code}`
      switch (code) {
        case 'VM_LIN': return `/host/lindetail?id=${id}&zid=${zid}&type=1${from}`
        case 'VM_WIN': return `/host/windetail?id=${id}&zid=${zid}&type=2${from}`
        case 'HW_NET': return `/net/detail?id=${id}&zid=${zid}${from}`
        case 'HW_SRV':
        case 'HW_FIB':
        case 'HW_STO': return `/server/detail?id=${id}&zid=${zid}${from}`
        default: return `/host/device-detail?id=${id}&zid=${zid}&typeCode=${code}&from=assets&fromType=${code}`
      }
    },
    closeInfo() {
      this.infoVisible = false
    },
    fmtPercent(v) {
      const n = parseFloat(v)
      return isNaN(n) ? '--' : n.toFixed(1) + '%'
    },
    // 维保到期状态（共享工具，详见 @/utils/formatter）
    expiryStatus(dateStr) {
      return expiryStatus(dateStr)
    },
    // ── 详情弹窗内的图表 ──────────────────────────────────────
    resetGraphRange() {
      const ntime = new Date()
      const qtime = new Date(Date.now() - 2 * 60 * 60 * 1000)
      this.beginTime = parseTimeFun(qtime)
      this.endTime = parseTimeFun(ntime)
      this.timeValue = [moment(qtime), moment(ntime)]
    },
    changeGraphTime(e) {
      if (e && e.length) {
        this.beginTime = parseTimeFun(new Date(e[0]))
        this.endTime = parseTimeFun(new Date(e[1]))
      } else {
        this.beginTime = ''
        this.endTime = ''
      }
    },
    fetchGraph() {
      if (!this.detailRecord || !this.detailRecord.hostid) return
      this.graphLoading = true
      hostGraph(this.detailRecord.hostid, { start: this.beginTime, end: this.endTime })
        .then((resp) => {
          const res = resp.data
          if (res.code == 200) {
            this.pngData = (res.data && res.data.items) || []
          } else if (res.code == 403) {
            this.$message.error(res.message || '该实例未配置密码，无法获取图表')
            this.pngData = []
          } else {
            this.pngData = []
          }
          this.sortPngData()
        })
        .catch(() => { this.pngData = []; this.sortPngData() })
        .finally(() => { this.graphLoading = false })
    },
    sortPngData() {
      this.sortedPngData = [...this.pngData].sort((a, b) => a.name.localeCompare(b.name))
    },
  },
}
</script>

<style lang="less" scoped>
.generic-device-list {
  padding: 0;
}
/* 搜索栏行：搜索表单左对齐，字段设置按钮右对齐 */
.search-bar-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 12px;
}
.home-search {
  flex: 1;
  margin-bottom: 0;
}
.field-config-btn {
  margin-left: 12px;
  flex-shrink: 0;
}
/* 长文本单元格：单行省略，超出部分悬浮显示全文 */
.cell-ellipsis {
  display: inline-block;
  max-width: 260px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  vertical-align: middle;
}
/* 详情弹窗图表 */
.detail-graph-container {
  min-height: 80px;
}
.detail-graph-item {
  text-align: center;
  margin-bottom: 16px;
  h4 {
    font-size: 14px;
    color: #333;
    margin-bottom: 6px;
  }
  img {
    max-width: 100%;
  }
}
</style>
