<template>
  <div v-if="embedded">
    <div class="asset-binding-page">
      <a-card :bordered="false" class="table-card">
        <template #title>
          <div class="table-card__title-wrap">
            <div class="table-card__title">设备绑定配置</div>
          </div>
        </template>
        <template #extra>
          <div class="table-card__actions">
            <a-tag color="blue">共 {{ dataSource.length }} 项</a-tag>
            <a-button type="primary" icon="plus" @click="handleAdd">新建绑定</a-button>
          </div>
        </template>

        <a-table
          :columns="columns"
          :data-source="dataSource"
          :loading="loading"
          :pagination="false"
          rowKey="id"
          :rowClassName="getRowClassName"
          :scroll="{ x: 1770 }"
        >
          <span slot="name" slot-scope="text, record">
            <div class="binding-name-cell">
              <a-icon
                :type="getAssetTypeIcon(record.type_code)"
                class="binding-name-icon"
              />
              <div class="binding-name">{{ record.name || getAssetTypeName(record.type_code) }}</div>
            </div>
          </span>
          <span slot="asset_type" slot-scope="text, record">
            <div class="asset-type-cell">
              <a-icon
                :type="getAssetTypeIcon(record.type_code)"
                class="asset-type-icon"
              />
              <span>{{ getAssetTypeName(record.type_code) }}</span>
              <a-tag color="blue">{{ record.type_code }}</a-tag>
            </div>
          </span>
          <span slot="zabbix_instance" slot-scope="text, record">
            <div class="instance-cell">
              <a-icon type="cloud-server" />
              <span>{{ getInstanceName(record.zid) }}</span>
            </div>
          </span>
          <span slot="group_id" slot-scope="text, record">
            <a-tooltip :title="formatGroupNames(record)">
              <div class="group-cell">{{ formatGroupNames(record) }}</div>
            </a-tooltip>
          </span>
          <span slot="status" slot-scope="text, record">
            <div class="status-cell">
              <a-badge v-if="record.status === 1" status="success" text="已初始化" />
              <a-badge v-else-if="record.status === 2" status="error" :text="'失败'" />
              <a-badge v-else status="default" text="未初始化" />
              <a-tooltip v-if="record.status === 2 && record.init_error" :title="record.init_error">
                <a-icon type="info-circle" class="status-error-icon" />
              </a-tooltip>
            </div>
          </span>
          <span slot="auto_init" slot-scope="text, record">
            <div class="auto-init-cell">
              <a-tag v-if="record.auto_init === 1" color="green">自动</a-tag>
              <a-tag v-else>手动</a-tag>
              <span v-if="record.auto_init === 1 && record.init_cron" class="auto-init-cron">{{ record.init_cron }}</span>
            </div>
          </span>
          <span slot="last_success_at" slot-scope="text">
            <div class="last-success-cell">
              <a-icon type="clock-circle" />
              <span>{{ text ? formatTime(text) : '暂无成功记录' }}</span>
            </div>
          </span>
          <span slot="action" slot-scope="text, record">
            <div class="action-cell">
              <a-button size="small" type="primary" @click="handleInit(record)">初始化</a-button>
              <a-button size="small" @click="handleCopy(record)">复制</a-button>
              <a-button size="small" @click="handleEdit(record)">编辑</a-button>
              <a-button size="small" @click="showHistory(record)">历史</a-button>
              <a-popconfirm
                title="确认删除该绑定配置？"
                ok-text="确认"
                cancel-text="取消"
                @confirm="handleDelete(record)"
              >
                <a-button size="small" type="danger">删除</a-button>
              </a-popconfirm>
            </div>
          </span>
        </a-table>
      </a-card>

      <!-- 新建/编辑 Modal -->
      <a-modal
        :title="modalTitle"
        :visible="modalVisible"
        :confirm-loading="modalLoading"
        @ok="handleSubmit"
        @cancel="handleCancel"
        width="880px"
        wrapClassName="asset-binding-modal"
        :bodyStyle="{ maxHeight: '70vh', overflowY: 'auto', padding: '16px 20px 8px' }"
      >
        <a-form-model
          ref="form"
          class="binding-form"
          :model="form"
          :rules="rules"
          :label-col="{ span: 6 }"
          :wrapper-col="{ span: 16 }"
        >
          <a-row :gutter="16" class="binding-form__grid">
            <a-col :span="12">
              <a-form-model-item label="配置名称" prop="name" :label-col="{ span: 7 }" :wrapper-col="{ span: 17 }">
                <a-input v-model="form.name" placeholder="可选，用于描述该绑定" />
              </a-form-model-item>
            </a-col>
            <a-col :span="12">
              <a-form-model-item label="Zabbix实例" prop="zid" :label-col="{ span: 7 }" :wrapper-col="{ span: 17 }">
                <a-select
                  v-model="form.zid"
                  placeholder="请选择 Zabbix 实例"
                  show-search
                  option-label-prop="label"
                  option-filter-prop="children"
                  @change="handleInstanceChange"
                >
                  <a-select-option v-for="inst in instanceList" :key="inst.instance" :value="inst.instance" :label="inst.name">
                    {{ inst.name }}
                  </a-select-option>
                </a-select>
              </a-form-model-item>
            </a-col>
            <a-col :span="12">
              <a-form-model-item label="资产类型" prop="type_code" :label-col="{ span: 7 }" :wrapper-col="{ span: 17 }">
                <a-select v-model="form.type_code" placeholder="请选择资产类型" option-label-prop="label">
                  <a-select-option
                    v-for="at in assetTypes"
                    :key="at.type_code"
                    :value="at.type_code"
                    :label="at.name"
                  >
                    <a-icon :type="at.icon || 'folder'" class="asset-type-option-icon" />
                    {{ at.name }} ({{ at.type_code }})
                  </a-select-option>
                </a-select>
              </a-form-model-item>
            </a-col>
            <a-col :span="12">
              <a-form-model-item label="主机组" prop="group_id" :label-col="{ span: 7 }" :wrapper-col="{ span: 17 }">
                <a-select
                  v-model="selectedGroups"
                  mode="multiple"
                  placeholder="请先选择 Zabbix 实例"
                  :loading="groupsLoading"
                  show-search
                  option-label-prop="label"
                  option-filter-prop="children"
                  @change="updateGroupId"
                >
                  <a-select-option v-for="g in hostGroups" :key="g.groupid" :value="g.groupid" :label="g.name">
                    {{ g.name }}
                  </a-select-option>
                </a-select>
              </a-form-model-item>
            </a-col>
          </a-row>

          <a-divider orientation="left" class="binding-form__divider">监控指标绑定（可选）</a-divider>
          <div class="binding-form__hint">先选模板，再选监控项</div>

          <a-row :gutter="12" v-for="m in metricDefs" :key="m.key" class="binding-form__metric-row">
            <a-col :span="12">
              <a-form-model-item :label="m.label + ' / 模板'" :label-col="{ span: 10 }" :wrapper-col="{ span: 14 }">
                <a-select show-search option-label-prop="label" option-filter-prop="label" placeholder="选择模板" :loading="templatesLoading"
                  @change="val => handleTemplateChange(val, m.key)">
                  <a-select-option v-for="tpl in templateList" :key="tpl.templateid" :value="tpl.templateid" :label="tpl.name">
                    {{ tpl.name }}
                  </a-select-option>
                </a-select>
              </a-form-model-item>
            </a-col>
            <a-col :span="12">
              <a-form-model-item label="监控项" :label-col="{ span: 6 }" :wrapper-col="{ span: 18 }">
                <a-select show-search option-label-prop="label" option-filter-prop="label" v-model="selectedItems[m.key]"
                  placeholder="选择监控项" :loading="itemsLoading[m.key]"
                  @change="val => handleItemChange(val, m.field)">
                  <a-select-option v-for="item in itemLists[m.key]" :key="item.itemid" :value="item.itemid" :label="item.name">
                    {{ item.name }}
                  </a-select-option>
                </a-select>
              </a-form-model-item>
            </a-col>
          </a-row>

          <a-form-model-item label="ICMP模板">
            <a-select v-model="form.ping_template_id" show-search option-label-prop="label" option-filter-prop="label"
              placeholder="选择 ICMP 模板（可选）" :loading="templatesLoading" allow-clear>
              <a-select-option v-for="tpl in templateList" :key="tpl.templateid" :value="tpl.templateid" :label="tpl.name">
                {{ tpl.name }}
              </a-select-option>
            </a-select>
          </a-form-model-item>

          <a-divider orientation="left" class="binding-form__divider">自动化配置</a-divider>

          <a-form-model-item label="自动初始化">
            <a-switch v-model="autoInitSwitch" @change="val => form.auto_init = val ? 1 : 0" />
            <span style="margin-left: 8px; color: #888; font-size: 12px;">开启后按 Cron 表达式定时执行</span>
          </a-form-model-item>

          <a-form-model-item label="Cron 表达式" v-if="autoInitSwitch">
            <a-input v-model="form.init_cron" placeholder="0 0 2 * * * （秒 分 时 日 月 周）" />
            <div style="font-size: 12px; color: #aaa; margin-top: 2px;">格式：秒 分 时 日 月 周，示例每天凌晨2点：0 0 2 * * *</div>
          </a-form-model-item>

          <a-form-model-item label="新主机自动初始化" v-if="autoInitSwitch">
            <a-switch v-model="initOnNewHostSwitch" @change="val => form.init_on_new_host = val ? 1 : 0" />
            <span style="margin-left: 8px; color: #888; font-size: 12px;">主机组新增主机时自动执行</span>
          </a-form-model-item>

          <a-form-model-item label="最大重试次数">
            <a-input-number v-model="form.max_retry" :min="0" :max="10" style="width: 100px;" />
          </a-form-model-item>
        </a-form-model>
      </a-modal>

      <!-- 执行历史 Modal -->
      <a-modal
        title="初始化执行历史"
        :visible="historyVisible"
        width="900px"
        :footer="null"
        @cancel="historyVisible = false"
      >
        <a-table
          :loading="historyLoading"
          :columns="historyColumns"
          :data-source="historyList"
          :pagination="historyPagination"
          rowKey="id"
          @change="handleHistoryPageChange"
        >
          <span slot="exec_type" slot-scope="text">
            <a-tag :color="execTypeColor(text)">{{ execTypeLabel(text) }}</a-tag>
          </span>
          <span slot="status" slot-scope="text">
            <a-tag :color="historyStatusColor(text)">{{ text }}</a-tag>
          </span>
          <span slot="start_time" slot-scope="text">{{ formatTime(text) }}</span>
          <span slot="duration" slot-scope="text">{{ text ? text + 's' : '-' }}</span>
        </a-table>
      </a-modal>
    </div>
  </div>
  <page-layout v-else :noTitle="true">
    <div class="asset-binding-page">
      <a-card :bordered="false" class="table-card">
        <template #title>
          <div class="table-card__title-wrap">
            <div class="table-card__title">设备绑定配置</div>
          </div>
        </template>
        <template #extra>
          <div class="table-card__actions">
            <a-tag color="blue">共 {{ dataSource.length }} 项</a-tag>
            <a-button type="primary" icon="plus" @click="handleAdd">新建绑定</a-button>
          </div>
        </template>

        <a-table
          :columns="columns"
          :data-source="dataSource"
          :loading="loading"
          :pagination="false"
          rowKey="id"
          :rowClassName="getRowClassName"
          :scroll="{ x: 1770 }"
        >
          <span slot="name" slot-scope="text, record">
            <div class="binding-name-cell">
              <a-icon
                :type="getAssetTypeIcon(record.type_code)"
                class="binding-name-icon"
              />
              <div class="binding-name">{{ record.name || getAssetTypeName(record.type_code) }}</div>
            </div>
          </span>
          <span slot="asset_type" slot-scope="text, record">
            <div class="asset-type-cell">
              <a-icon
                :type="getAssetTypeIcon(record.type_code)"
                class="asset-type-icon"
              />
              <span>{{ getAssetTypeName(record.type_code) }}</span>
              <a-tag color="blue">{{ record.type_code }}</a-tag>
            </div>
          </span>
          <span slot="zabbix_instance" slot-scope="text, record">
            <div class="instance-cell">
              <a-icon type="cloud-server" />
              <span>{{ getInstanceName(record.zid) }}</span>
            </div>
          </span>
          <span slot="group_id" slot-scope="text, record">
            <a-tooltip :title="formatGroupNames(record)">
              <div class="group-cell">{{ formatGroupNames(record) }}</div>
            </a-tooltip>
          </span>
          <span slot="status" slot-scope="text, record">
            <div class="status-cell">
              <a-badge v-if="record.status === 1" status="success" text="已初始化" />
              <a-badge v-else-if="record.status === 2" status="error" :text="'失败'" />
              <a-badge v-else status="default" text="未初始化" />
              <a-tooltip v-if="record.status === 2 && record.init_error" :title="record.init_error">
                <a-icon type="info-circle" class="status-error-icon" />
              </a-tooltip>
            </div>
          </span>
          <span slot="auto_init" slot-scope="text, record">
            <div class="auto-init-cell">
              <a-tag v-if="record.auto_init === 1" color="green">自动</a-tag>
              <a-tag v-else>手动</a-tag>
              <span v-if="record.auto_init === 1 && record.init_cron" class="auto-init-cron">{{ record.init_cron }}</span>
            </div>
          </span>
          <span slot="last_success_at" slot-scope="text">
            <div class="last-success-cell">
              <a-icon type="clock-circle" />
              <span>{{ text ? formatTime(text) : '暂无成功记录' }}</span>
            </div>
          </span>
          <span slot="action" slot-scope="text, record">
            <div class="action-cell">
              <a-button size="small" type="primary" @click="handleInit(record)">初始化</a-button>
              <a-button size="small" @click="handleCopy(record)">复制</a-button>
              <a-button size="small" @click="handleEdit(record)">编辑</a-button>
              <a-button size="small" @click="showHistory(record)">历史</a-button>
              <a-popconfirm
                title="确认删除该绑定配置？"
                ok-text="确认"
                cancel-text="取消"
                @confirm="handleDelete(record)"
              >
                <a-button size="small" type="danger">删除</a-button>
              </a-popconfirm>
            </div>
          </span>
        </a-table>
      </a-card>

      <!-- 新建/编辑 Modal -->
      <a-modal
        :title="modalTitle"
        :visible="modalVisible"
        :confirm-loading="modalLoading"
        @ok="handleSubmit"
        @cancel="handleCancel"
        width="880px"
        wrapClassName="asset-binding-modal"
        :bodyStyle="{ maxHeight: '70vh', overflowY: 'auto', padding: '16px 20px 8px' }"
      >
        <a-form-model
          ref="form"
          class="binding-form"
          :model="form"
          :rules="rules"
          :label-col="{ span: 6 }"
          :wrapper-col="{ span: 16 }"
        >
          <a-row :gutter="16" class="binding-form__grid">
            <a-col :span="12">
              <a-form-model-item label="配置名称" prop="name" :label-col="{ span: 7 }" :wrapper-col="{ span: 17 }">
                <a-input v-model="form.name" placeholder="可选，用于描述该绑定" />
              </a-form-model-item>
            </a-col>
            <a-col :span="12">
              <a-form-model-item label="Zabbix实例" prop="zid" :label-col="{ span: 7 }" :wrapper-col="{ span: 17 }">
                <a-select
                  v-model="form.zid"
                  placeholder="请选择 Zabbix 实例"
                  show-search
                  option-label-prop="label"
                  option-filter-prop="children"
                  @change="handleInstanceChange"
                >
                  <a-select-option v-for="inst in instanceList" :key="inst.instance" :value="inst.instance" :label="inst.name">
                    {{ inst.name }}
                  </a-select-option>
                </a-select>
              </a-form-model-item>
            </a-col>
            <a-col :span="12">
              <a-form-model-item label="资产类型" prop="type_code" :label-col="{ span: 7 }" :wrapper-col="{ span: 17 }">
                <a-select v-model="form.type_code" placeholder="请选择资产类型" option-label-prop="label">
                  <a-select-option
                    v-for="at in assetTypes"
                    :key="at.type_code"
                    :value="at.type_code"
                    :label="at.name"
                  >
                    <a-icon :type="at.icon || 'folder'" class="asset-type-option-icon" />
                    {{ at.name }} ({{ at.type_code }})
                  </a-select-option>
                </a-select>
              </a-form-model-item>
            </a-col>
            <a-col :span="12">
              <a-form-model-item label="主机组" prop="group_id" :label-col="{ span: 7 }" :wrapper-col="{ span: 17 }">
                <a-select
                  v-model="selectedGroups"
                  mode="multiple"
                  placeholder="请先选择 Zabbix 实例"
                  :loading="groupsLoading"
                  show-search
                  option-label-prop="label"
                  option-filter-prop="children"
                  @change="updateGroupId"
                >
                  <a-select-option v-for="g in hostGroups" :key="g.groupid" :value="g.groupid" :label="g.name">
                    {{ g.name }}
                  </a-select-option>
                </a-select>
              </a-form-model-item>
            </a-col>
          </a-row>

          <a-divider orientation="left" class="binding-form__divider">监控指标绑定（可选）</a-divider>
          <div class="binding-form__hint">先选模板，再选监控项</div>

          <a-row :gutter="12" v-for="m in metricDefs" :key="m.key" class="binding-form__metric-row">
            <a-col :span="12">
              <a-form-model-item :label="m.label + ' / 模板'" :label-col="{ span: 10 }" :wrapper-col="{ span: 14 }">
                <a-select show-search option-label-prop="label" option-filter-prop="label" placeholder="选择模板" :loading="templatesLoading"
                  @change="val => handleTemplateChange(val, m.key)">
                  <a-select-option v-for="tpl in templateList" :key="tpl.templateid" :value="tpl.templateid" :label="tpl.name">
                    {{ tpl.name }}
                  </a-select-option>
                </a-select>
              </a-form-model-item>
            </a-col>
            <a-col :span="12">
              <a-form-model-item label="监控项" :label-col="{ span: 6 }" :wrapper-col="{ span: 18 }">
                <a-select show-search option-label-prop="label" option-filter-prop="label" v-model="selectedItems[m.key]"
                  placeholder="选择监控项" :loading="itemsLoading[m.key]"
                  @change="val => handleItemChange(val, m.field)">
                  <a-select-option v-for="item in itemLists[m.key]" :key="item.itemid" :value="item.itemid" :label="item.name">
                    {{ item.name }}
                  </a-select-option>
                </a-select>
              </a-form-model-item>
            </a-col>
          </a-row>

          <a-form-model-item label="ICMP模板">
            <a-select v-model="form.ping_template_id" show-search option-label-prop="label" option-filter-prop="label"
              placeholder="选择 ICMP 模板（可选）" :loading="templatesLoading" allow-clear>
              <a-select-option v-for="tpl in templateList" :key="tpl.templateid" :value="tpl.templateid" :label="tpl.name">
                {{ tpl.name }}
              </a-select-option>
            </a-select>
          </a-form-model-item>

          <a-divider orientation="left" class="binding-form__divider">自动化配置</a-divider>

          <a-form-model-item label="自动初始化">
            <a-switch v-model="autoInitSwitch" @change="val => form.auto_init = val ? 1 : 0" />
            <span style="margin-left: 8px; color: #888; font-size: 12px;">开启后按 Cron 表达式定时执行</span>
          </a-form-model-item>

          <a-form-model-item label="Cron 表达式" v-if="autoInitSwitch">
            <a-input v-model="form.init_cron" placeholder="0 0 2 * * * （秒 分 时 日 月 周）" />
            <div style="font-size: 12px; color: #aaa; margin-top: 2px;">格式：秒 分 时 日 月 周，示例每天凌晨2点：0 0 2 * * *</div>
          </a-form-model-item>

          <a-form-model-item label="新主机自动初始化" v-if="autoInitSwitch">
            <a-switch v-model="initOnNewHostSwitch" @change="val => form.init_on_new_host = val ? 1 : 0" />
            <span style="margin-left: 8px; color: #888; font-size: 12px;">主机组新增主机时自动执行</span>
          </a-form-model-item>

          <a-form-model-item label="最大重试次数">
            <a-input-number v-model="form.max_retry" :min="0" :max="10" style="width: 100px;" />
          </a-form-model-item>
        </a-form-model>
      </a-modal>

      <!-- 执行历史 Modal -->
      <a-modal
        title="初始化执行历史"
        :visible="historyVisible"
        width="900px"
        :footer="null"
        @cancel="historyVisible = false"
      >
        <a-table
          :loading="historyLoading"
          :columns="historyColumns"
          :data-source="historyList"
          :pagination="historyPagination"
          rowKey="id"
          @change="handleHistoryPageChange"
        >
          <span slot="exec_type" slot-scope="text">
            <a-tag :color="execTypeColor(text)">{{ execTypeLabel(text) }}</a-tag>
          </span>
          <span slot="status" slot-scope="text">
            <a-tag :color="historyStatusColor(text)">{{ text }}</a-tag>
          </span>
          <span slot="start_time" slot-scope="text">{{ formatTime(text) }}</span>
          <span slot="duration" slot-scope="text">{{ text ? text + 's' : '-' }}</span>
        </a-table>
      </a-modal>
    </div>
  </page-layout>
</template>

<script>
import PageLayout from "@/layouts/PageLayout";
import {
  getAssetTypes, getSystemBindings, createSystemBinding, updateSystemBinding,
  deleteSystemBinding, initSystemBinding, getSystemBindingHistory,
  hostgroupList, templateList, templateGetItemList,
} from "@/services/admin";
import { listZabbixInstance } from "@/services/zabbix";

const METRIC_DEFS = [
  { key: 'uptime',             field: 'uptime_id',             label: '在线时长' },
  { key: 'cpu_core',           field: 'cpu_core',              label: 'CPU核心数' },
  { key: 'cpu_utilization',    field: 'cpu_utilization_id',    label: 'CPU使用率' },
  { key: 'memory_utilization', field: 'memory_utilization_id', label: '内存使用率' },
  { key: 'memory_used',        field: 'memory_used_id',        label: '已用内存' },
  { key: 'memory_total',       field: 'memory_total_id',       label: '总内存' },
  { key: 'model',              field: 'model',                 label: '型号' },
];

function emptyItems() { return METRIC_DEFS.reduce((a, m) => { a[m.key] = undefined; return a; }, {}); }
function emptyLists() { return METRIC_DEFS.reduce((a, m) => { a[m.key] = []; return a; }, {}); }
function emptyLoading() { return METRIC_DEFS.reduce((a, m) => { a[m.key] = false; return a; }, {}); }

export default {
  name: 'AssetBinding',
  components: { PageLayout },
  props: {
    embedded: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      loading: false,
      dataSource: [],
      assetTypes: [],
      instanceList: [],
      hostGroups: [],
      templateList: [],
      groupNameMapByZid: {},
      groupsLoading: false,
      templatesLoading: false,
      selectedGroups: [],
      selectedItems: emptyItems(),
      itemLists: emptyLists(),
      itemsLoading: emptyLoading(),
      metricDefs: METRIC_DEFS,
      autoInitSwitch: true,
      initOnNewHostSwitch: true,
      modalVisible: false,
      modalLoading: false,
      isEdit: false,
      isCopy: false,
      editId: null,
      form: this.emptyForm(),
      rules: {
        zid:       [{ required: true, message: '请选择 Zabbix 实例', trigger: 'change' }],
        type_code: [{ required: true, message: '请选择资产类型', trigger: 'change' }],
        group_id:  [{ required: true, message: '请选择主机组', trigger: 'change' }],
      },
      columns: [
        { title: '名称',       dataIndex: 'name',            key: 'name', scopedSlots: { customRender: 'name' }, width: 220 },
        { title: '资产类型',   key: 'asset_type',            scopedSlots: { customRender: 'asset_type' }, width: 300 },
        { title: 'Zabbix实例', key: 'zabbix_instance',       scopedSlots: { customRender: 'zabbix_instance' }, width: 180 },
        { title: '主机组',     dataIndex: 'group_id',        key: 'group_id', scopedSlots: { customRender: 'group_id' }, ellipsis: true, width: 260 },
        { title: '自动初始化', key: 'auto_init',             scopedSlots: { customRender: 'auto_init' }, width: 180 },
        { title: '状态',       key: 'status',                scopedSlots: { customRender: 'status' }, width: 120 },
        { title: '最近成功',   dataIndex: 'last_success_at', key: 'last_success_at', scopedSlots: { customRender: 'last_success_at' }, width: 190 },
        { title: '操作',       key: 'action',                width: 320, scopedSlots: { customRender: 'action' }, fixed: 'right' },
      ],
      historyVisible: false,
      historyLoading: false,
      historyList: [],
      currentSystemId: null,
      historyPagination: { current: 1, pageSize: 20, total: 0, showTotal: t => `共 ${t} 条` },
      historyColumns: [
        { title: '类型',     dataIndex: 'exec_type',     key: 'exec_type',     width: 80,  scopedSlots: { customRender: 'exec_type' } },
        { title: '开始时间', dataIndex: 'start_time',    key: 'start_time',    width: 170, scopedSlots: { customRender: 'start_time' } },
        { title: '耗时',     dataIndex: 'duration',      key: 'duration',      width: 70,  scopedSlots: { customRender: 'duration' } },
        { title: '状态',     dataIndex: 'status',        key: 'status',        width: 80,  scopedSlots: { customRender: 'status' } },
        { title: '影响主机', dataIndex: 'affected_hosts', key: 'affected_hosts', width: 90 },
        { title: '错误信息', dataIndex: 'error_message', key: 'error_message', ellipsis: true },
      ],
    };
  },
  computed: {
    modalTitle() {
      if (this.isEdit) return '编辑绑定配置';
      if (this.isCopy) return '复制绑定配置';
      return '新建绑定配置';
    },
  },
  mounted() {
    this.loadAssetTypes();
    this.loadInstances();
    this.loadData();
  },
  methods: {
    emptyForm() {
      return {
        name: '', zid: undefined, type_code: undefined, group_id: '',
        cpu_core: '', cpu_utilization_id: '', memory_utilization_id: '',
        memory_used_id: '', memory_total_id: '', uptime_id: '', model: '',
        ping_template_id: '', auto_init: 1, init_cron: '0 0 2 * * *',
        init_on_new_host: 1, max_retry: 3,
      };
    },
    async loadAssetTypes() {
      try {
        const res = await getAssetTypes();
        const biz = (res && res.data) ? res.data : res;
        if (biz && biz.code === 200) this.assetTypes = biz.data || [];
      } catch (e) { console.error(e); }
    },
    async loadInstances() {
      try {
        const res = await listZabbixInstance();
        const biz = (res && res.data) ? res.data : res;
        if (biz && biz.code === 200) {
          const list = biz.data || [];
          this.instanceList = list.map(item => ({
            ...item,
            instance: String(item.id || item.instance || ''),
            name: item.name || item.host || String(item.id || item.instance || '-'),
          }));
        }
      } catch (e) { console.error(e); }
    },
    async loadData() {
      this.loading = true;
      try {
        const res = await getSystemBindings();
        const biz = (res && res.data) ? res.data : res;
        if (biz && biz.code === 200) {
          const d = biz.data;
          this.dataSource = Array.isArray(d) ? d : (d && Array.isArray(d.items) ? d.items : []);
          await this.loadGroupNamesForRows(this.dataSource);
        } else { this.dataSource = []; }
      } catch (e) {
        this.$message.error('加载绑定配置失败');
        this.dataSource = [];
      } finally { this.loading = false; }
    },
    async loadGroupNamesForRows(rows) {
      const zidList = [...new Set(
        (rows || [])
          .filter(row => row && row.group_id && row.zid !== undefined && row.zid !== null && String(row.zid) !== '' && String(row.zid) !== '0')
          .map(row => String(row.zid))
      )];
      const uncachedZids = zidList.filter(zid => !this.groupNameMapByZid[zid]);
      if (uncachedZids.length === 0) return;
      try {
        const results = await Promise.all(uncachedZids.map(zid => hostgroupList(zid)));
        const nextMap = { ...this.groupNameMapByZid };
        uncachedZids.forEach((zid, index) => {
          const res = results[index];
          const groups = res && res.data && res.data.code === 200 ? (res.data.data || []) : [];
          nextMap[zid] = groups.reduce((acc, group) => {
            const groupId = String(group.groupid || '');
            if (groupId) acc[groupId] = group.name || groupId;
            return acc;
          }, {});
        });
        this.groupNameMapByZid = nextMap;
      } catch (e) {
        console.error(e);
      }
    },
    async handleInstanceChange(zid) {
      if (!zid) return;
      this.hostGroups = [];
      this.templateList = [];
      this.selectedGroups = [];
      this.form.group_id = '';
      this.selectedItems = emptyItems();
      this.itemLists = emptyLists();
      this.groupsLoading = true;
      this.templatesLoading = true;
      try {
        const [gRes, tRes] = await Promise.all([hostgroupList(zid), templateList(zid)]);
        if (gRes.data && gRes.data.code === 200) {
          const groups = gRes.data.data || [];
          this.hostGroups = groups.map(group => ({
            ...group,
            groupid: String(group.groupid || ''),
            name: group.name || String(group.groupid || '-'),
          }));
        }
        if (tRes.data && tRes.data.code === 200) {
          const templates = tRes.data.data || [];
          this.templateList = templates.map(template => ({
            ...template,
            templateid: String(template.templateid || ''),
            name: template.name || template.host || String(template.templateid || '-'),
          }));
        }
      } catch (e) { this.$message.error('加载主机组或模板失败'); }
      finally { this.groupsLoading = false; this.templatesLoading = false; }
    },
    updateGroupId() { this.form.group_id = this.selectedGroups.join(','); },
    async handleTemplateChange(templateId, metricKey) {
      if (!this.form.zid) { this.$message.warning('请先选择 Zabbix 实例'); return; }
      this.$set(this.itemsLoading, metricKey, true);
      try {
        const res = await templateGetItemList(templateId, this.form.zid);
        if (res.data && res.data.code === 200) {
          const items = res.data.data || [];
          const list = (items.length > 0 && items[0].items) ? items[0].items : items;
          this.$set(this.itemLists, metricKey, list.map(item => ({
            ...item,
            itemid: String(item.itemid || ''),
            name: item.name || item.key_ || String(item.itemid || '-'),
          })));
        }
      } catch (e) { this.$message.error('加载监控项失败'); }
      finally { this.$set(this.itemsLoading, metricKey, false); }
    },
    handleItemChange(itemId, formField) { this.form[formField] = itemId ? String(itemId) : ''; },
    getDefaultInstanceId() {
      return this.instanceList.length > 0 ? String(this.instanceList[0].instance) : undefined;
    },
    resolveInitialZid(zid) {
      const normalized = zid !== undefined && zid !== null ? String(zid) : '';
      if (normalized && normalized !== '0') return normalized;
      return this.getDefaultInstanceId();
    },
    getAssetTypeName(typeCode) {
      const at = this.assetTypes.find(t => t.type_code === typeCode);
      return at ? at.name : (typeCode || '-');
    },
    getAssetTypeIcon(typeCode) {
      const at = this.assetTypes.find(t => t.type_code === typeCode);
      return (at && at.icon) || 'folder';
    },
    getInstanceName(zid) {
      const inst = this.instanceList.find(i => String(i.instance) === String(zid));
      if (inst) return inst.name;
      return zid && String(zid) !== '0' ? zid : '-';
    },
    formatGroupNames(record) {
      if (!record || !record.group_id) return '-';
      const zid = record.zid !== undefined && record.zid !== null ? String(record.zid) : '';
      const nameMap = this.groupNameMapByZid[zid] || {};
      const groups = String(record.group_id)
        .split(',')
        .filter(Boolean)
        .map(groupId => nameMap[groupId] || groupId);
      if (groups.length <= 2) return groups.join(' , ');
      return `${groups.slice(0, 2).join(' , ')} 等 ${groups.length} 个主机组`;
    },
    getRowClassName(record) {
      if (record.status === 2) return 'row-failed';
      if (record.status === 1) return 'row-success';
      return '';
    },
    resetModal() {
      this.form = this.emptyForm();
      this.selectedGroups = [];
      this.hostGroups = [];
      this.templateList = [];
      this.selectedItems = emptyItems();
      this.itemLists = emptyLists();
      this.itemsLoading = emptyLoading();
      // 新建时默认开启自动初始化（编辑时由 handleEdit 按记录覆盖）
      this.autoInitSwitch = true;
      this.initOnNewHostSwitch = true;
    },
    async handleAdd() {
      this.isEdit = false;
      this.isCopy = false;
      this.editId = null;
      this.resetModal();
      const defaultZid = this.getDefaultInstanceId();
      if (defaultZid) {
        this.form.zid = defaultZid;
        await this.handleInstanceChange(defaultZid);
      }
      this.modalVisible = true;
      this.$nextTick(() => { this.$refs.form && this.$refs.form.clearValidate(); });
    },
    async handleEdit(record) {
      this.isEdit = true;
      this.isCopy = false;
      this.editId = record.id;
      this.resetModal();
      const initialZid = this.resolveInitialZid(record.zid);
      this.form = {
        name:                record.name || '',
        zid:                 initialZid,
        type_code:           record.type_code || undefined,
        group_id:            record.group_id || '',
        cpu_core:            record.cpu_core || '',
        cpu_utilization_id:  record.cpu_utilization_id || '',
        memory_utilization_id: record.memory_utilization_id || '',
        memory_used_id:      record.memory_used_id || '',
        memory_total_id:     record.memory_total_id || '',
        uptime_id:           record.uptime_id || '',
        model:               record.model || '',
        ping_template_id:    record.ping_template_id ? String(record.ping_template_id) : '',
        auto_init:           record.auto_init || 0,
        init_cron:           record.init_cron || '0 0 2 * * *',
        init_on_new_host:    record.init_on_new_host || 0,
        max_retry:           record.max_retry !== undefined ? record.max_retry : 3,
      };
      this.autoInitSwitch = record.auto_init === 1;
      this.initOnNewHostSwitch = record.init_on_new_host === 1;
      this.modalVisible = true;
      this.$nextTick(() => { this.$refs.form && this.$refs.form.clearValidate(); });
      if (initialZid) {
        await this.handleInstanceChange(initialZid);
        // handleInstanceChange 会清空 selectedGroups 和 form.group_id，这里恢复并同步回填 group_id
        if (record.group_id) {
          this.selectedGroups = record.group_id.split(',').filter(Boolean).map(String);
          this.updateGroupId();
        }
        if (record.ping_template_id) this.form.ping_template_id = record.ping_template_id;
      }
    },
    async handleCopy(record) {
      this.isEdit = false;
      this.isCopy = true;
      this.editId = null;
      this.resetModal();
      const initialZid = this.resolveInitialZid(record.zid);
      this.form = {
        name:                record.name || '',
        zid:                 initialZid,
        type_code:           record.type_code || undefined,
        group_id:            record.group_id || '',
        cpu_core:            record.cpu_core || '',
        cpu_utilization_id:  record.cpu_utilization_id || '',
        memory_utilization_id: record.memory_utilization_id || '',
        memory_used_id:      record.memory_used_id || '',
        memory_total_id:     record.memory_total_id || '',
        uptime_id:           record.uptime_id || '',
        model:               record.model || '',
        ping_template_id:    record.ping_template_id ? String(record.ping_template_id) : '',
        auto_init:           record.auto_init || 0,
        init_cron:           record.init_cron || '0 0 2 * * *',
        init_on_new_host:    record.init_on_new_host || 0,
        max_retry:           record.max_retry !== undefined ? record.max_retry : 3,
      };
      this.autoInitSwitch = record.auto_init === 1;
      this.initOnNewHostSwitch = record.init_on_new_host === 1;
      this.modalVisible = true;
      this.$nextTick(() => { this.$refs.form && this.$refs.form.clearValidate(); });
      if (initialZid) {
        await this.handleInstanceChange(initialZid);
        // handleInstanceChange 会清空 selectedGroups 和 form.group_id，这里恢复并同步回填 group_id
        if (record.group_id) {
          this.selectedGroups = record.group_id.split(',').filter(Boolean).map(String);
          this.updateGroupId();
        }
        if (record.ping_template_id) this.form.ping_template_id = String(record.ping_template_id);
      }
    },
    handleCancel() { this.modalVisible = false; },
    handleSubmit() {
      this.$refs.form.validate(async (valid) => {
        if (!valid) return;
        this.modalLoading = true;
        try {
          const action = this.isEdit
            ? updateSystemBinding(this.editId, this.form)
            : createSystemBinding(this.form);
          const res = await action;
          const biz = (res && res.data) ? res.data : res;
          if (biz && biz.code === 200) {
            this.$message.success(this.isEdit ? '更新成功' : '创建成功');
            this.modalVisible = false;
            this.loadData();
          } else {
            this.$message.error((biz && biz.message) || '操作失败');
          }
        } catch (e) { this.$message.error('操作失败'); }
        finally { this.modalLoading = false; }
      });
    },
    handleInit(record) {
      this.$confirm({
        title: '确认立即初始化？',
        content: `将对 ${this.getAssetTypeName(record.type_code)} 的主机组执行批量 inventory 写入操作。`,
        onOk: async () => {
          try {
            const res = await initSystemBinding(record.id, record.zid);
            const biz = (res && res.data) ? res.data : res;
            if (biz && biz.code === 200) {
              this.$message.success('初始化成功');
              this.loadData();
            } else {
              this.$message.error((biz && biz.message) || '初始化失败');
            }
          } catch (e) { this.$message.error('初始化失败'); }
        },
      });
    },
    async handleDelete(record) {
      try {
        const res = await deleteSystemBinding(record.id);
        const biz = (res && res.data) ? res.data : res;
        if (biz && biz.code === 200) {
          this.$message.success('删除成功');
          await this.loadData();
        } else { this.$message.error((biz && biz.message) || '删除失败'); }
      } catch (e) { this.$message.error('删除失败'); }
    },
    showHistory(record) {
      this.currentSystemId = record.id;
      this.historyPagination.current = 1;
      this.historyVisible = true;
      this.fetchHistory();
    },
    async fetchHistory() {
      this.historyLoading = true;
      try {
        const res = await getSystemBindingHistory(this.currentSystemId, {
          page: this.historyPagination.current,
          limit: this.historyPagination.pageSize,
        });
        const biz = (res && res.data) ? res.data : res;
        if (biz && biz.code === 200) {
          this.historyList = (biz.data && biz.data.items) ? biz.data.items : [];
          this.historyPagination.total = (biz.data && biz.data.total) ? biz.data.total : 0;
        }
      } catch (e) { this.$message.error('加载历史失败'); }
      finally { this.historyLoading = false; }
    },
    handleHistoryPageChange(pagination) {
      this.historyPagination.current = pagination.current;
      this.historyPagination.pageSize = pagination.pageSize;
      this.fetchHistory();
    },
    formatTime(t) { return t ? new Date(t).toLocaleString('zh-CN') : '-'; },
    execTypeLabel(t) { return { manual: '手动', auto: '自动', retry: '重试' }[t] || t; },
    execTypeColor(t) { return { manual: 'blue', auto: 'green', retry: 'orange' }[t] || 'default'; },
    historyStatusColor(t) { return { success: 'green', failed: 'red', running: 'orange' }[t] || 'default'; },
  },
};
</script>

<style lang="less" scoped>
.asset-binding-page {
  background: #f5f7fb;
  min-height: 100%;
}

.table-card {
  border-radius: 14px;
  box-shadow: 0 10px 30px rgba(31, 35, 41, 0.04);
  margin-bottom: 20px;
}

.table-card__title-wrap {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.table-card__title {
  font-size: 18px;
  font-weight: 600;
  color: #1f2329;
}

.table-card__subtitle {
  color: #667085;
  font-size: 13px;
}

.table-card__actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.binding-name-cell,
.asset-type-cell,
.instance-cell,
.status-cell,
.auto-init-cell,
.last-success-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.binding-name-cell {
  flex-wrap: nowrap;
}

.binding-name-icon,
.asset-type-icon,
.asset-type-option-icon {
  color: #1890ff;
}

.binding-name {
  font-weight: 600;
  color: #1f2329;
}

.asset-type-cell {
  flex-wrap: nowrap;
  white-space: nowrap;
}

.instance-cell,
.last-success-cell {
  color: #475467;
}

.group-cell {
  color: #344054;
  line-height: 1.5;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.status-error-icon {
  color: #ff4d4f;
  cursor: pointer;
}

.auto-init-cell {
  flex-direction: row;
  align-items: center;
  gap: 6px;
  flex-wrap: nowrap;
  white-space: nowrap;
}

.auto-init-cron {
  font-size: 12px;
  color: #667085;
  white-space: nowrap;
}

.action-cell {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.binding-form__grid {
  margin-bottom: 4px;
}

.binding-form__divider {
  margin: 8px 0 14px;
  font-size: 13px;
}

.binding-form__hint {
  margin: -8px 0 10px 24px;
  color: #999;
  font-size: 12px;
}

.binding-form__metric-row {
  margin-bottom: 4px;
}

/deep/ .ant-card-head {
  border-bottom: 1px solid #f0f2f5;
}

/deep/ .ant-table-thead > tr > th {
  background: #fafbfc;
  color: #344054;
  font-weight: 600;
}

/deep/ .ant-table-tbody > tr > td {
  vertical-align: top;
  padding-top: 18px;
  padding-bottom: 18px;
}

/deep/ .ant-table-tbody > tr.row-failed > td {
  background: #fff7f7;
}

/deep/ .ant-table-tbody > tr.row-success > td {
  background: #fcfffc;
}

/deep/ .asset-binding-modal .ant-modal {
  max-width: 880px;
}

/deep/ .asset-binding-modal .ant-modal-header {
  padding: 14px 20px;
}

/deep/ .asset-binding-modal .ant-modal-footer {
  padding: 10px 20px 14px;
}

/deep/ .binding-form .ant-form-item {
  margin-bottom: 12px;
}

/deep/ .binding-form .ant-form-item-label > label {
  color: #344054;
}

/deep/ .binding-form .ant-divider-horizontal.ant-divider-with-text-left::before,
/deep/ .binding-form .ant-divider-horizontal.ant-divider-with-text-left::after {
  top: 50%;
}

@media (max-width: 992px) {
  .table-card__actions {
    flex-direction: column;
    align-items: flex-start;
  }

  .binding-form__hint {
    margin-left: 0;
  }

  /deep/ .asset-binding-modal .ant-modal {
    max-width: calc(100vw - 24px);
  }
}
</style>
