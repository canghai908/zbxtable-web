<template>
  <page-layout :title="detail.name || '设备详情'" :custom-breadcrumb="breadcrumbItems">
    <a-button slot="action" icon="arrow-left" @click="goBack">返回</a-button>

    <div slot="headerContent" class="generic-detail">
      <a-spin :spinning="loading">

        <!-- 基本信息卡片 -->
        <a-card title="基本信息" :body-style="{ padding: '12px' }" style="margin-bottom: 16px;">
          <a-descriptions bordered size="small" :column="{ xxl: 4, xl: 3, lg: 2, md: 2, sm: 1 }">
            <template v-for="field in visibleFields">
              <a-descriptions-item :key="field.key" :label="field.label">
                <!-- progress -->
                <template v-if="field.render === 'progress'">
                  <span v-if="detail[field.key]">
                    <a-progress
                      :percent="parseFieldPercent(detail[field.key])"
                      size="small"
                      status="active"
                      style="width: 140px; display: inline-block; margin-right: 8px;"
                    />
                    {{ fmtPercent(detail[field.key]) }}
                  </span>
                  <span v-else>--</span>
                </template>
                <!-- status -->
                <template v-else-if="field.render === 'status'">
                  <a-tooltip>
                    <template slot="title">{{ detail.error }}</template>
                    <a-tag v-if="detail[field.key] == 1" color="#34af67">正常</a-tag>
                    <a-tag v-else-if="detail[field.key] == 2" color="#DC143C">异常</a-tag>
                    <a-tag v-else color="#808080">未知</a-tag>
                  </a-tooltip>
                </template>
                <!-- ping -->
                <template v-else-if="field.render === 'ping'">
                  <a-tag v-if="detail[field.key] && detail[field.key].includes('Up')" color="#34af67">Up</a-tag>
                  <a-tag v-else-if="detail[field.key] && detail[field.key].includes('Down')" color="#DC143C">Down</a-tag>
                  <a-tag v-else color="#808080">Unknown</a-tag>
                  <span v-if="detail.ping_sec" style="font-size: 12px; color: #888; margin-left: 4px;">
                    {{ (detail.ping_sec || '').replace(/\s/g, '') }} / {{ (detail.ping_loss || '').replace(/\s/g, '') }}
                  </span>
                </template>
                <!-- tag -->
                <template v-else-if="field.render === 'tag'">
                  <a-tag :color="$themeColor">{{ detail[field.key] || '未知' }}</a-tag>
                </template>
                <!-- link -->
                <template v-else-if="field.render === 'link'">
                  <a v-if="detail[field.key]" :href="detail[field.key]" target="_blank">{{ detail[field.key] }}</a>
                  <span v-else>--</span>
                </template>
                <!-- text / default -->
                <template v-else>
                  <template v-if="isEditing && isEditableField(field.key)">
                    <a-date-picker
                      v-if="isDateField(field.key)"
                      v-model="editForm[field.key]"
                      value-format="YYYY-MM-DD"
                      size="small"
                    />
                    <a-input v-else v-model.trim="editForm[field.key]" size="small" style="width: 200px;" />
                  </template>
                  <span v-else>{{ detail[field.key] || '--' }}</span>
                </template>
              </a-descriptions-item>
            </template>
          </a-descriptions>

          <!-- 编辑按钮区 -->
          <div v-if="hasEditableField" style="margin-top: 12px; text-align: right;">
            <template v-if="isEditing">
              <a-button type="primary" size="small" :loading="saving" @click="handleSave" style="margin-right: 8px;">保存</a-button>
              <a-button size="small" @click="cancelEdit">取消</a-button>
            </template>
            <a-button v-else icon="edit" size="small" @click="startEdit">编辑信息</a-button>
          </div>
        </a-card>

        <!-- 监控图形 -->
        <a-card title="监控图形" :body-style="{ padding: '12px' }">
          <div style="margin-bottom: 12px;">
            <a-form-model layout="inline" :colon="false">
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
          </div>
          <a-spin :spinning="graphLoading">
            <div v-if="sortedPngData.length > 0" class="graph-container">
              <div v-for="item in sortedPngData" :key="item.name" class="graph-item">
                <h4>{{ item.name }}</h4>
                <img :src="`data:image/png;base64,${item.png}`" :alt="item.name" />
              </div>
            </div>
            <a-empty v-else-if="!graphLoading" description="暂无图表数据" />
          </a-spin>
        </a-card>

      </a-spin>
    </div>
  </page-layout>
</template>

<script>
import PageLayout from '@/layouts/PageLayout'
import moment from 'moment'
import { hostDetail, hostGraph, hostUpdate, getAssetTypes, getAssetTypeFields } from '@/services/admin'
import { parseTimeFun } from '@/utils/formatter'
import themeMixin from '@/mixins/themeMixin'

const EDITABLE_FIELDS = new Set(['location', 'department', 'resource_id', 'mac', 'date_hw_install', 'date_hw_expiry'])
const DATE_FIELDS = new Set(['date_hw_install', 'date_hw_expiry'])

export default {
  name: 'GenericDeviceDetail',
  mixins: [themeMixin],
  components: { PageLayout },
  data() {
    return {
      moment,
      id: '',
      zid: '',
      typeCode: '',
      typeName: '',
      typeId: null,
      loading: false,
      detail: {},
      fieldConfigs: [],
      isEditing: false,
      saving: false,
      editForm: {},
      graphLoading: false,
      pngData: [],
      sortedPngData: [],
      timeValue: [],
      beginTime: '',
      endTime: '',
    }
  },
  computed: {
    breadcrumbItems() {
      return ['资产管理', '资产树', this.typeName || '设备详情']
    },
    visibleFields() {
      return this.fieldConfigs
        .filter((f) => f.visible)
        .sort((a, b) => a.order - b.order)
    },
    hasEditableField() {
      return this.visibleFields.some((f) => EDITABLE_FIELDS.has(f.key))
    },
  },
  created() {
    this.id = this.$route.query.id || ''
    this.zid = this.$route.query.zid || ''
    this.typeCode = this.$route.query.typeCode || (this.$route.meta && this.$route.meta.type_code) || ''
    this.resetGraphRange()
    this.init()
  },
  methods: {
    async init() {
      this.loading = true
      try {
        // 并行加载：类型配置 + 设备详情
        const typesRes = await getAssetTypes()
        const types = (typesRes.data && typesRes.data.data) || []
        const typeInfo = types.find((t) => t.type_code === this.typeCode)
        if (typeInfo) {
          this.typeName = typeInfo.name
          this.typeId = typeInfo.id
          const fieldsRes = await getAssetTypeFields(typeInfo.id)
          this.fieldConfigs = (fieldsRes.data && fieldsRes.data.data) || []
        }
        const detailRes = await hostDetail(this.id, this.zid)
        const biz = detailRes.data
        if (biz && biz.code === 200) {
          this.detail = biz.data || {}
        }
      } catch {
        this.$message.error('加载设备信息失败')
      } finally {
        this.loading = false
      }
      this.fetchGraph()
    },

    isEditableField: (key) => EDITABLE_FIELDS.has(key),
    isDateField: (key) => DATE_FIELDS.has(key),

    startEdit() {
      const form = {}
      EDITABLE_FIELDS.forEach((k) => { form[k] = this.detail[k] || '' })
      this.editForm = form
      this.isEditing = true
    },
    cancelEdit() {
      this.isEditing = false
      this.editForm = {}
    },
    async handleSave() {
      this.saving = true
      try {
        const payload = Object.assign({}, this.detail, this.editForm)
        const res = await hostUpdate(payload)
        const biz = res && res.data ? res.data : res
        if (biz && biz.code === 200) {
          EDITABLE_FIELDS.forEach((k) => { this.$set(this.detail, k, this.editForm[k]) })
          this.cancelEdit()
          this.$message.success('保存成功')
        } else {
          this.$message.error((biz && biz.message) || '保存失败')
        }
      } catch {
        this.$message.error('保存失败')
      } finally {
        this.saving = false
      }
    },

    parseFieldPercent(val) {
      if (!val) return 0
      return parseFloat(String(val).split(' ')[0]) || 0
    },
    fmtPercent(val) {
      const n = parseFloat(String(val).split(' ')[0])
      return isNaN(n) ? '--' : n.toFixed(1) + '%'
    },

    goBack() {
      const fromType = this.$route.query.fromType || this.typeCode
      if (this.$route.query.from === 'assets') {
        this.$router.push(fromType ? `/assets/tree?type=${fromType}` : '/assets/tree')
      } else {
        this.$router.back()
      }
    },

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
      if (!this.id) return
      this.graphLoading = true
      hostGraph(this.id, { start: this.beginTime, end: this.endTime })
        .then((resp) => {
          const res = resp.data
          if (res.code === 200) {
            const items = (res.data && res.data.items) || []
            this.sortedPngData = [...items].sort((a, b) => a.name.localeCompare(b.name))
          } else {
            this.sortedPngData = []
          }
        })
        .catch(() => { this.sortedPngData = [] })
        .finally(() => { this.graphLoading = false })
    },
  },
}
</script>

<style lang="less" scoped>
.generic-detail {
  padding-bottom: 24px;
}
.graph-container {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}
.graph-item {
  text-align: center;
  flex: 1 1 480px;
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
