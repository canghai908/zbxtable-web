<template>
  <page-layout :noTitle="true">
    <!-- 顶部健康与巡检概览 KPI -->
    <a-row :gutter="16" style="margin-bottom: 16px;">
      <a-col :xs="24" :sm="12" :md="6">
        <a-card :bordered="false" class="inspect-kpi-card">
          <div class="kpi-label">最新平均健康分</div>
          <div class="kpi-main">
            <span class="kpi-score" :style="{ color: gradeColor(overview.latest_grade) }">
              {{ overview.total_reports > 0 ? overview.latest_avg_score : '--' }}
            </span>
            <span v-if="overview.total_reports > 0" class="kpi-unit">分</span>
            <a-tag v-if="overview.total_reports > 0" :color="gradeTagColor(overview.latest_grade)" style="margin-left: 8px;">
              {{ gradeLabel(overview.latest_grade) }}
            </a-tag>
          </div>
          <div class="kpi-sub">
            累计报告 {{ overview.total_reports || 0 }} 份（优 {{ (overview.grade_counts && overview.grade_counts.excellent) || 0 }} / 良 {{ (overview.grade_counts && overview.grade_counts.good) || 0 }} / 警 {{ (overview.grade_counts && overview.grade_counts.warning) || 0 }} / 危 {{ (overview.grade_counts && overview.grade_counts.critical) || 0 }}）
          </div>
        </a-card>
      </a-col>
      <a-col :xs="24" :sm="12" :md="6">
        <a-card :bordered="false" class="inspect-kpi-card">
          <div class="kpi-label">巡检任务配置</div>
          <div class="kpi-main">
            <span class="kpi-score">{{ overview.enabled_tasks || 0 }}</span>
            <span class="kpi-unit">/ {{ overview.total_tasks || 0 }} 已启用</span>
          </div>
          <div class="kpi-sub">
            支持每天、每周或自定义 Cron 定时巡检与多渠道自动推送
          </div>
        </a-card>
      </a-col>
      <a-col :xs="24" :sm="12" :md="6">
        <a-card :bordered="false" class="inspect-kpi-card">
          <div class="kpi-label">最近巡检设备状态</div>
          <div class="kpi-main">
            <span class="kpi-score" style="color: #52c41a;">{{ latestCompletedReport ? latestCompletedReport.available_hosts : '--' }}</span>
            <span class="kpi-unit">/ {{ latestCompletedReport ? latestCompletedReport.total_hosts : '--' }} 在线</span>
            <a-tag v-if="latestCompletedReport && latestCompletedReport.unavailable_hosts > 0" color="red" style="margin-left: 8px;">
              失联 {{ latestCompletedReport.unavailable_hosts }}
            </a-tag>
          </div>
          <div class="kpi-sub">
            {{ latestCompletedReport ? `最近报告：${latestCompletedReport.task_name}` : '尚未生成巡检报告，可创建任务后立即巡检' }}
          </div>
        </a-card>
      </a-col>
      <a-col :xs="24" :sm="12" :md="6">
        <a-card :bordered="false" class="inspect-kpi-card">
          <div class="kpi-label">最近异常与高危风险</div>
          <div class="kpi-main">
            <span class="kpi-score" :style="{ color: (latestCompletedReport && latestCompletedReport.abnormal_hosts > 0) ? '#fa8c16' : '#1f2937' }">
              {{ latestCompletedReport ? latestCompletedReport.abnormal_hosts : '--' }}
            </span>
            <span class="kpi-unit">台异常设备</span>
            <a-tag v-if="latestCompletedReport && latestCompletedReport.critical_alarms > 0" color="red" style="margin-left: 8px;">
              高危告警 {{ latestCompletedReport.critical_alarms }}
            </a-tag>
          </div>
          <div class="kpi-sub">
            {{ latestCompletedReport ? `CPU超标 ${latestCompletedReport.high_cpu_hosts} | 内存超标 ${latestCompletedReport.high_mem_hosts} | 磁盘超标 ${latestCompletedReport.high_disk_hosts}` : '等待首次巡检采集资源水位与未恢复告警' }}
          </div>
        </a-card>
      </a-col>
    </a-row>

    <a-card :bordered="false">
      <a-tabs v-model="activeTab" @change="handleTabChange">
        <!-- Tab 1: 巡检任务管理 -->
        <a-tab-pane key="tasks" tab="巡检任务管理">
          <a-form-model class="home-search" layout="inline" :colon="false" style="margin-bottom: 12px;">
            <a-form-model-item label="任务名称">
              <a-input v-model.trim="taskQuery.name" placeholder="输入巡检任务名称" allowClear />
            </a-form-model-item>
            <a-form-model-item label="状态">
              <a-select v-model="taskQuery.status" style="width: 120px" allowClear placeholder="全部">
                <a-select-option value="1">已启用</a-select-option>
                <a-select-option value="0">已停用</a-select-option>
              </a-select>
            </a-form-model-item>
            <a-form-model-item>
              <a-button type="primary" @click="searchTasks">查询</a-button>
              <a-button style="margin-left: 8px;" @click="resetTaskQuery">重置</a-button>
              <a-button style="margin-left: 8px;" icon="reload" @click="refreshAll">刷新</a-button>
              <a-button style="margin-left: 8px;" type="primary" icon="plus" @click="openCreateTask">新建巡检任务</a-button>
            </a-form-model-item>
          </a-form-model>

          <a-table
            :loading="taskLoading"
            :columns="taskColumns"
            :data-source="taskList"
            :pagination="taskPagination"
            @change="handleTaskTableChange"
            :rowKey="record => record.id"
            :scroll="{ x: 1180 }"
          >
            <template slot="scope_col" slot-scope="record">
              <div><a-tag :color="themeColor">{{ formatInstanceNames(record.z_ids) }}</a-tag></div>
              <div style="margin-top: 4px; color: rgba(0,0,0,.65); font-size: 12px;">类型：{{ formatHostTypeNames(record.host_types) }}</div>
            </template>

            <template slot="schedule_col" slot-scope="record">
              <a-tag v-if="record.inspect_mode === 'manual'">手动触发</a-tag>
              <div v-else>
                <a-tag color="blue">{{ cycleLabel(record.cycle) }}</a-tag>
                <div style="font-size: 12px; color: rgba(0,0,0,.55); margin-top: 2px;">{{ record.cron_expr }}</div>
              </div>
            </template>

            <template slot="threshold_col" slot-scope="record">
              <div style="font-size: 12px;">CPU ≥ {{ record.cpu_threshold }}%</div>
              <div style="font-size: 12px;">内存 ≥ {{ record.mem_threshold }}% | 磁盘 ≥ {{ record.disk_threshold }}%</div>
            </template>

            <template slot="notify_col" slot-scope="record">
              <span>{{ formatChannelNames(record.notify_channels) }}</span>
            </template>

            <template slot="last_score_col" slot-scope="record">
              <a v-if="record.last_report_id > 0" @click="openReportDetail(record.last_report_id)" style="cursor: pointer;">
                <a-tag :color="gradeTagColor(record.last_grade)" style="font-weight: 600;">
                  {{ record.last_score }} 分 ({{ gradeLabel(record.last_grade) }})
                </a-tag>
              </a>
              <span v-else style="color: rgba(0,0,0,.45);">--</span>
            </template>

            <template slot="exec_status_col" slot-scope="record">
              <a-badge v-if="record.exec_status === 1" status="processing" text="巡检中" />
              <a-badge v-else-if="record.exec_status === 2" status="success" text="已完成" />
              <a-badge v-else-if="record.exec_status === 3" status="error" text="失败" />
              <a-badge v-else status="default" text="未运行" />
              <div v-if="record.last_run_at" style="font-size: 11px; color: rgba(0,0,0,.45); margin-top: 2px;">
                {{ formatDateTime(record.last_run_at) }}
              </div>
            </template>

            <template slot="status_col" slot-scope="record">
              <a-switch
                :checked="record.status === '1'"
                checked-children="启用"
                un-checked-children="停用"
                @change="toggleTaskStatus(record)"
              />
            </template>

            <template slot="task_op_col" slot-scope="record">
              <a-button
                type="link"
                size="small"
                class="op-btn"
                :loading="runningTaskId === record.id || record.exec_status === 1"
                @click="runTaskNow(record)"
              >立即巡检</a-button>
              <a-button
                v-if="record.last_report_id > 0"
                type="link"
                size="small"
                class="op-btn"
                @click="openReportDetail(record.last_report_id)"
              >最新报告</a-button>
              <a-button type="link" size="small" class="op-btn" @click="viewTaskReports(record)">历史</a-button>
              <a-button type="link" size="small" class="op-btn" @click="openEditTask(record)">编辑</a-button>
              <a-popconfirm title="确定删除该巡检任务及其关联历史报告吗？" ok-text="确定" cancel-text="取消" @confirm="removeTask(record)">
                <a-button type="link" size="small" class="op-btn" style="color: #ff4d4f;">删除</a-button>
              </a-popconfirm>
            </template>
          </a-table>
        </a-tab-pane>

        <!-- Tab 2: 巡检报告与健康评分记录 -->
        <a-tab-pane key="reports" tab="巡检报告与健康评分">
          <a-form-model class="home-search" layout="inline" :colon="false" style="margin-bottom: 12px;">
            <a-form-model-item label="所属任务">
              <a-select v-model="reportQuery.task_id" style="width: 200px" allowClear placeholder="全部任务">
                <a-select-option v-for="t in allTaskOptions" :key="t.id" :value="String(t.id)">{{ t.name }}</a-select-option>
              </a-select>
            </a-form-model-item>
            <a-form-model-item label="健康等级">
              <a-select v-model="reportQuery.health_grade" style="width: 130px" allowClear placeholder="全部等级">
                <a-select-option value="excellent">优秀 (90-100)</a-select-option>
                <a-select-option value="good">良好 (75-89)</a-select-option>
                <a-select-option value="warning">亚健康 (60-74)</a-select-option>
                <a-select-option value="critical">高危 (&lt;60)</a-select-option>
              </a-select>
            </a-form-model-item>
            <a-form-model-item>
              <a-button type="primary" @click="searchReports">查询</a-button>
              <a-button style="margin-left: 8px;" @click="resetReportQuery">重置</a-button>
              <a-button style="margin-left: 8px;" icon="reload" @click="loadReports">刷新</a-button>
            </a-form-model-item>
          </a-form-model>

          <a-table
            :loading="reportLoading"
            :columns="reportColumns"
            :data-source="reportList"
            :pagination="reportPagination"
            @change="handleReportTableChange"
            :rowKey="record => record.id"
            :scroll="{ x: 1180 }"
          >
            <template slot="score_col" slot-scope="record">
              <a-tag v-if="record.status === 2" :color="gradeTagColor(record.health_grade)" style="font-weight: 600;">
                {{ record.health_score }} 分 · {{ gradeLabel(record.health_grade) }}
              </a-tag>
              <a-badge v-else-if="record.status === 1" status="processing" text="巡检中" />
              <a-badge v-else status="error" :text="record.error_msg || '失败'" />
            </template>

            <template slot="hosts_stat_col" slot-scope="record">
              <span>总 {{ record.total_hosts }}</span>
              <span style="margin-left: 6px; color: #52c41a;">在线 {{ record.available_hosts }}</span>
              <span v-if="record.unavailable_hosts > 0" style="margin-left: 6px; color: #f5222f;">失联 {{ record.unavailable_hosts }}</span>
              <span v-if="record.abnormal_hosts > 0" style="margin-left: 6px; color: #fa8c16;">异常 {{ record.abnormal_hosts }}</span>
            </template>

            <template slot="threshold_stat_col" slot-scope="record">
              <a-tag :color="record.high_cpu_hosts > 0 ? 'volcano' : undefined">CPU {{ record.high_cpu_hosts }}</a-tag>
              <a-tag :color="record.high_mem_hosts > 0 ? 'orange' : undefined">内存 {{ record.high_mem_hosts }}</a-tag>
              <a-tag :color="record.high_disk_hosts > 0 ? 'red' : undefined">磁盘 {{ record.high_disk_hosts }}</a-tag>
            </template>

            <template slot="alarms_stat_col" slot-scope="record">
              <span>{{ record.active_alarms }}</span>
              <a-tag v-if="record.critical_alarms > 0" color="red" style="margin-left: 6px;">高危 {{ record.critical_alarms }}</a-tag>
            </template>

            <template slot="time_col" slot-scope="record">
              <div>{{ formatDateTime(record.start_time) }}</div>
              <div style="font-size: 12px; color: rgba(0,0,0,.45);">耗时 {{ record.total_time || 0 }}s</div>
            </template>

            <template slot="download_col" slot-scope="record">
              <a v-if="record.excel_file" :href="downloadUrl(record.excel_file)" :download="record.excel_file" class="dl-link">Excel</a>
              <a v-if="record.html_file" :href="downloadUrl(record.html_file)" target="_blank" rel="noopener" class="dl-link">HTML</a>
              <a v-if="record.pdf_file" :href="downloadUrl(record.pdf_file)" :download="record.pdf_file" class="dl-link">PDF</a>
              <a v-if="record.files" :href="downloadUrl(record.files)" :download="record.files" class="dl-link">ZIP</a>
              <span v-if="!record.excel_file && !record.html_file && !record.pdf_file && !record.files">--</span>
            </template>

            <template slot="report_op_col" slot-scope="record">
              <a-button type="link" size="small" class="op-btn" :disabled="record.status === 1" @click="openReportDetail(record.id)">查看健康报告</a-button>
              <a-popconfirm title="确定要删除该巡检报告及本地文件吗？" ok-text="确定" cancel-text="取消" @confirm="removeReport(record)">
                <a-button type="link" size="small" class="op-btn" style="color: #ff4d4f;">删除</a-button>
              </a-popconfirm>
            </template>
          </a-table>
        </a-tab-pane>
      </a-tabs>
    </a-card>

    <!-- 新建/编辑巡检任务弹窗（紧凑多列布局） -->
    <a-modal
      wrapClassName="inspect-task-modal"
      :title="editingTaskId ? '编辑巡检任务' : '新建巡检任务'"
      :visible="taskModalVisible"
      :confirmLoading="taskModalLoading"
      :bodyStyle="{ padding: '14px 18px', maxHeight: '76vh', overflowY: 'auto' }"
      width="860px"
      @ok="submitTask"
      @cancel="taskModalVisible = false"
    >
      <a-form-model ref="taskForm" :model="taskForm" :rules="taskFormRules" class="compact-inspect-form">
        <a-card title="基础调度配置" size="small" :bordered="false">
          <a-row :gutter="12">
            <a-col :xs="24" :sm="10">
              <a-form-model-item label="任务名称" prop="name" :label-col="{ span: 7 }" :wrapper-col="{ span: 17 }">
                <a-input v-model.trim="taskForm.name" placeholder="例如：核心生产每日巡检" />
              </a-form-model-item>
            </a-col>
            <a-col :xs="24" :sm="8">
              <a-form-model-item label="巡检模式" :label-col="{ span: 8 }" :wrapper-col="{ span: 16 }">
                <a-select v-model="taskForm.inspect_mode" @change="handleInspectModeChange">
                  <a-select-option value="scheduled">定时自动巡检</a-select-option>
                  <a-select-option value="manual">仅手动触发</a-select-option>
                </a-select>
              </a-form-model-item>
            </a-col>
            <a-col :xs="24" :sm="6">
              <a-form-model-item label="状态" :label-col="{ span: 9 }" :wrapper-col="{ span: 15 }">
                <a-switch v-model="taskForm.status" checked-children="启用" un-checked-children="停用" />
              </a-form-model-item>
            </a-col>
          </a-row>

          <a-row v-if="taskForm.inspect_mode === 'scheduled'" :gutter="12" style="margin-top: 6px;">
            <a-col :xs="24" :sm="10">
              <a-form-model-item label="执行周期" :label-col="{ span: 7 }" :wrapper-col="{ span: 17 }">
                <a-select v-model="taskForm.cycle" @change="handleCycleChange">
                  <a-select-option value="day">每天自动巡检（默认 08:00）</a-select-option>
                  <a-select-option value="week">每周自动巡检（默认周一 08:00）</a-select-option>
                  <a-select-option value="custom">自定义 Cron 表达式</a-select-option>
                </a-select>
              </a-form-model-item>
            </a-col>
            <a-col :xs="24" :sm="14">
              <a-form-model-item :label-col="{ span: 6 }" :wrapper-col="{ span: 18 }">
                <span slot="label">
                  Cron 表达式
                  <a-tooltip title="格式：秒 分 时 日 月 周，例如 0 0 8 * * * 表示每天早 8 点执行">
                    <a-icon type="question-circle-o" style="margin-left: 2px; color: rgba(0,0,0,.45);" />
                  </a-tooltip>
                </span>
                <a-input v-model.trim="taskForm.cron_expr" placeholder="例如：0 0 8 * * *" />
              </a-form-model-item>
            </a-col>
          </a-row>
        </a-card>

        <a-card title="巡检目标范围与健康阈值" size="small" :bordered="false" style="margin-top: 8px;">
          <a-row :gutter="12">
            <a-col :xs="24" :sm="12">
              <a-form-model-item label="Zabbix 实例" :label-col="{ span: 6 }" :wrapper-col="{ span: 18 }">
                <a-select v-model="taskForm.z_ids" mode="multiple" placeholder="留空表示全部已启用实例" allowClear>
                  <a-select-option v-for="inst in instanceList" :key="inst.id" :value="String(inst.id)">{{ inst.name }}</a-select-option>
                </a-select>
              </a-form-model-item>
            </a-col>
            <a-col :xs="24" :sm="12">
              <a-form-model-item label="设备类型" :label-col="{ span: 6 }" :wrapper-col="{ span: 18 }">
                <a-select v-model="taskForm.host_types" mode="multiple" placeholder="留空表示全部设备类型" allowClear>
                  <a-select-option v-for="at in assetTypeList" :key="at.type_code" :value="at.type_code">{{ at.name }} ({{ at.type_code }})</a-select-option>
                </a-select>
              </a-form-model-item>
            </a-col>
          </a-row>

          <a-row :gutter="12" style="margin-top: 6px;">
            <a-col :xs="24" :sm="8">
              <a-form-model-item label="CPU 阈值(%)" :label-col="{ span: 9 }" :wrapper-col="{ span: 15 }">
                <a-input-number v-model="taskForm.cpu_threshold" :min="1" :max="100" style="width: 100%" />
              </a-form-model-item>
            </a-col>
            <a-col :xs="24" :sm="8">
              <a-form-model-item label="内存 阈值(%)" :label-col="{ span: 9 }" :wrapper-col="{ span: 15 }">
                <a-input-number v-model="taskForm.mem_threshold" :min="1" :max="100" style="width: 100%" />
              </a-form-model-item>
            </a-col>
            <a-col :xs="24" :sm="8">
              <a-form-model-item label="磁盘 阈值(%)" :label-col="{ span: 9 }" :wrapper-col="{ span: 15 }">
                <a-input-number v-model="taskForm.disk_threshold" :min="1" :max="100" style="width: 100%" />
              </a-form-model-item>
            </a-col>
          </a-row>
        </a-card>

        <a-card title="巡检结果推送配置" size="small" :bordered="false" style="margin-top: 8px;">
          <a-form-model-item label="推送渠道" :label-col="{ span: 3 }" :wrapper-col="{ span: 21 }">
            <a-checkbox-group v-model="taskForm.notify_channels" :options="channelOptions" />
          </a-form-model-item>
          <a-row :gutter="12" style="margin-top: 6px;">
            <a-col :xs="24" :sm="12">
              <a-form-model-item label="通知用户" :label-col="{ span: 6 }" :wrapper-col="{ span: 18 }">
                <a-select v-model="taskForm.notify_user_ids" mode="multiple" placeholder="选择接收报告的用户" allowClear optionFilterProp="children">
                  <a-select-option v-for="u in userList" :key="u.id" :value="String(u.id)">{{ u.username }}</a-select-option>
                </a-select>
              </a-form-model-item>
            </a-col>
            <a-col :xs="24" :sm="12">
              <a-form-model-item label="通知用户组" :label-col="{ span: 6 }" :wrapper-col="{ span: 18 }">
                <a-select v-model="taskForm.notify_group_ids" mode="multiple" placeholder="选择接收报告的用户组" allowClear optionFilterProp="children">
                  <a-select-option v-for="g in groupList" :key="g.id" :value="String(g.id)">{{ g.name }}</a-select-option>
                </a-select>
              </a-form-model-item>
            </a-col>
          </a-row>
          <a-row :gutter="12" style="margin-top: 6px;">
            <a-col :xs="24" :sm="12">
              <a-form-model-item label="额外邮箱" :label-col="{ span: 6 }" :wrapper-col="{ span: 18 }">
                <a-input v-model.trim="taskForm.notify_emails" placeholder="多个邮箱用英文逗号分隔" />
              </a-form-model-item>
            </a-col>
            <a-col :xs="24" :sm="12">
              <a-form-model-item label="任务备注" :label-col="{ span: 6 }" :wrapper-col="{ span: 18 }">
                <a-input v-model.trim="taskForm.desc" placeholder="可选说明" />
              </a-form-model-item>
            </a-col>
          </a-row>
        </a-card>
      </a-form-model>
    </a-modal>

    <!-- 健康评分报告详情弹窗 -->
    <a-modal
      :title="detailModalTitle"
      :visible="detailModalVisible"
      :footer="null"
      :bodyStyle="{ padding: '16px 20px', maxHeight: '82vh', overflowY: 'auto' }"
      width="1240px"
      @cancel="detailModalVisible = false"
    >
      <a-spin :spinning="detailLoading">
        <div v-if="reportDetail">
          <!-- 顶部健康分仪表盘与四维得分 -->
          <a-card size="small" :bordered="false" class="score-banner-card">
            <a-row :gutter="16" type="flex" align="middle">
              <a-col :xs="24" :md="6" style="text-align: center;">
                <a-progress
                  type="dashboard"
                  :percent="reportDetail.health_score"
                  :width="124"
                  :strokeColor="gradeColor(reportDetail.health_grade)"
                  :format="p => `${p} 分`"
                />
                <div>
                  <a-tag :color="gradeTagColor(reportDetail.health_grade)" style="font-size: 13px; padding: 2px 10px;">
                    健康等级：{{ gradeLabel(reportDetail.health_grade) }}
                  </a-tag>
                </div>
                <div style="margin-top: 8px; font-size: 12px; color: rgba(0,0,0,.55);">
                  耗时 {{ reportDetail.total_time || 0 }}s · {{ formatDateTime(reportDetail.start_time) }}
                </div>
              </a-col>

              <a-col :xs="24" :md="18">
                <a-row :gutter="12">
                  <a-col :xs="12" :sm="6">
                    <div class="dim-card">
                      <div class="dim-title">可用性健康度</div>
                      <div class="dim-score">{{ breakdown.availability_score }} / {{ breakdown.availability_max }}</div>
                      <a-progress :percent="Math.round((breakdown.availability_score / (breakdown.availability_max || 35)) * 100)" :show-info="false" size="small" strokeColor="#52c41a" />
                      <div class="dim-sub">在线 {{ reportDetail.available_hosts }} / 失联 {{ reportDetail.unavailable_hosts }}</div>
                    </div>
                  </a-col>
                  <a-col :xs="12" :sm="6">
                    <div class="dim-card">
                      <div class="dim-title">资源水位健康度</div>
                      <div class="dim-score">{{ breakdown.resource_score }} / {{ breakdown.resource_max }}</div>
                      <a-progress :percent="Math.round((breakdown.resource_score / (breakdown.resource_max || 30)) * 100)" :show-info="false" size="small" strokeColor="#1890ff" />
                      <div class="dim-sub">CPU {{ reportDetail.high_cpu_hosts }} | 内存 {{ reportDetail.high_mem_hosts }} | 盘 {{ reportDetail.high_disk_hosts }}</div>
                    </div>
                  </a-col>
                  <a-col :xs="12" :sm="6">
                    <div class="dim-card">
                      <div class="dim-title">告警风险健康度</div>
                      <div class="dim-score">{{ breakdown.alarm_score }} / {{ breakdown.alarm_max }}</div>
                      <a-progress :percent="Math.round((breakdown.alarm_score / (breakdown.alarm_max || 25)) * 100)" :show-info="false" size="small" strokeColor="#fa8c16" />
                      <div class="dim-sub">活跃 {{ reportDetail.active_alarms }} / 高危 {{ reportDetail.critical_alarms }}</div>
                    </div>
                  </a-col>
                  <a-col :xs="12" :sm="6">
                    <div class="dim-card">
                      <div class="dim-title">集群稳定度</div>
                      <div class="dim-score">{{ breakdown.stability_score }} / {{ breakdown.stability_max }}</div>
                      <a-progress :percent="Math.round((breakdown.stability_score / (breakdown.stability_max || 10)) * 100)" :show-info="false" size="small" strokeColor="#722ed1" />
                      <div class="dim-sub">异常 {{ reportDetail.abnormal_hosts }} / 共 {{ reportDetail.total_hosts }} 台</div>
                    </div>
                  </a-col>
                </a-row>

                <!-- 报告导出与下载 -->
                <div style="margin-top: 12px; display: flex; flex-wrap: wrap; gap: 8px; align-items: center;">
                  <span style="font-size: 12px; color: rgba(0,0,0,.6);">报告下载：</span>
                  <a v-if="reportDetail.excel_file" :href="downloadUrl(reportDetail.excel_file)" :download="reportDetail.excel_file">
                    <a-button size="small" icon="file-excel">下载 Excel 巡检表</a-button>
                  </a>
                  <a v-if="reportDetail.html_file" :href="downloadUrl(reportDetail.html_file)" target="_blank" rel="noopener">
                    <a-button size="small" icon="global">打开 HTML 报告</a-button>
                  </a>
                  <a v-if="reportDetail.pdf_file" :href="downloadUrl(reportDetail.pdf_file)" :download="reportDetail.pdf_file">
                    <a-button size="small" icon="file-pdf">下载 PDF</a-button>
                  </a>
                  <a v-if="reportDetail.files" :href="downloadUrl(reportDetail.files)" :download="reportDetail.files">
                    <a-button size="small" type="primary" ghost icon="download">下载完整归档 (ZIP)</a-button>
                  </a>
                </div>
              </a-col>
            </a-row>
          </a-card>

          <!-- 巡检结论与建议 -->
          <a-alert
            :type="reportDetail.health_grade === 'critical' ? 'error' : (reportDetail.health_grade === 'warning' ? 'warning' : 'success')"
            show-icon
            style="margin: 12px 0;"
          >
            <template slot="message">巡检结论与处置建议</template>
            <template slot="description">
              <ul style="margin: 4px 0 0 18px; padding: 0;">
                <li v-for="(rec, idx) in (summary.recommendations || [])" :key="idx">{{ rec }}</li>
              </ul>
            </template>
          </a-alert>

          <!-- 报告明细标签页 -->
          <a-tabs v-model="detailTab" size="small">
            <a-tab-pane key="hosts" :tab="`主机巡检明细 (${(reportDetail.hosts || []).length})`">
              <div style="margin-bottom: 10px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 8px;">
                <div>
                  <a-switch v-model="onlyAbnormalHosts" size="small" />
                  <span style="margin-left: 6px; font-size: 13px;">仅显示异常主机</span>
                </div>
                <a-input-search v-model.trim="hostFilterKeyword" placeholder="搜索主机名 / IP / 实例 / 异常描述" style="width: 280px;" allowClear />
              </div>

              <a-table
                size="small"
                :columns="detailHostColumns"
                :data-source="filteredDetailHosts"
                :pagination="{ pageSize: 10, showTotal: total => `共 ${total} 台` }"
                :rowKey="(record, idx) => `${record.zid}-${record.host_id || idx}`"
                :scroll="{ x: 1200 }"
              >
                <template slot="host_avail" slot-scope="record">
                  <a-tag v-if="record.available === '1'" color="green">正常</a-tag>
                  <a-tag v-else-if="record.available === '2'" color="red">失联</a-tag>
                  <a-tag v-else>未知</a-tag>
                </template>
                <template slot="host_cpu" slot-scope="record">
                  <span v-if="!record.has_cpu">--</span>
                  <span v-else :class="{ 'metric-alert': record.cpu_high }">{{ record.cpu_pct.toFixed(1) }}%</span>
                </template>
                <template slot="host_mem" slot-scope="record">
                  <span v-if="!record.has_mem">--</span>
                  <span v-else :class="{ 'metric-alert': record.mem_high }">{{ record.mem_pct.toFixed(1) }}%</span>
                </template>
                <template slot="host_disk" slot-scope="record">
                  <span v-if="!record.has_disk">--</span>
                  <span v-else :class="{ 'metric-alert': record.disk_high }">
                    {{ record.disk_pct.toFixed(1) }}%
                    <span v-if="record.disk_mount" style="font-size: 11px; color: rgba(0,0,0,.45);">({{ record.disk_mount }})</span>
                  </span>
                </template>
                <template slot="host_alarms" slot-scope="record">
                  <span>{{ record.active_alarms }}</span>
                  <a-tag v-if="record.critical_alarms > 0" color="red" style="margin-left: 4px;">{{ record.critical_alarms }}</a-tag>
                </template>
                <template slot="host_status" slot-scope="record">
                  <a-tag :color="hostStatusTagColor(record.status)">{{ hostStatusLabel(record.status) }} ({{ record.host_score }})</a-tag>
                </template>
                <template slot="host_issues" slot-scope="record">
                  <div v-if="record.issues && record.issues.length" class="issue-tag-wrap">
                    <a-tag v-for="(iss, idx) in record.issues" :key="idx" color="red" class="issue-tag-item">{{ iss }}</a-tag>
                  </div>
                  <span v-else style="color: #52c41a;">运行正常</span>
                </template>
              </a-table>
            </a-tab-pane>

            <a-tab-pane key="alarms" :tab="`未恢复告警明细 (${(summary.top_alarms || []).length})`">
              <a-table
                size="small"
                :columns="detailAlarmColumns"
                :data-source="summary.top_alarms || []"
                :pagination="{ pageSize: 10, showTotal: total => `共 ${total} 条` }"
                :rowKey="(record, idx) => `${record.zid}-${record.eventid || idx}-${record.message}`"
                :scroll="{ x: 940 }"
              >
                <template slot="alarm_level" slot-scope="record">
                  <a-tag :color="record.severity_num >= 4 ? 'red' : (record.severity_num >= 2 ? 'orange' : 'blue')">{{ record.level }}</a-tag>
                </template>
                <template slot="alarm_ack" slot-scope="record">
                  <a-tag :color="record.acknowledged ? 'green' : undefined">{{ record.acknowledged ? '已确认' : '未确认' }}</a-tag>
                </template>
              </a-table>
            </a-tab-pane>

            <a-tab-pane key="stats" tab="实例与设备分类分布">
              <a-row :gutter="16">
                <a-col :xs="24" :md="14">
                  <h4 style="margin-bottom: 8px;">实例健康统计</h4>
                  <a-table
                    size="small"
                    :columns="instanceStatColumns"
                    :data-source="summary.instance_stats || []"
                    :pagination="false"
                    :rowKey="r => r.zid"
                  >
                    <template slot="inst_reach" slot-scope="record">
                      <a-tag v-if="record.reachable" color="green">正常</a-tag>
                      <a-tooltip v-else :title="record.error || '连接失败'">
                        <a-tag color="red">异常</a-tag>
                      </a-tooltip>
                    </template>
                  </a-table>
                </a-col>
                <a-col :xs="24" :md="10">
                  <h4 style="margin-bottom: 8px;">设备分类统计</h4>
                  <a-table
                    size="small"
                    :columns="typeStatColumns"
                    :data-source="summary.type_stats || []"
                    :pagination="false"
                    :rowKey="r => r.type_code"
                  />
                </a-col>
              </a-row>
            </a-tab-pane>
          </a-tabs>
        </div>
      </a-spin>
    </a-modal>
  </page-layout>
</template>

<script>
import PageLayout from "@/layouts/PageLayout";
import themeMixin from "@/mixins/themeMixin";
import { listZabbixInstance } from "@/services/zabbix";
import {
  getAssetTypes,
  userList,
  groupList,
  inspectionOverview,
  inspectionTaskList,
  inspectionTaskCreate,
  inspectionTaskUpdate,
  inspectionTaskStatusPut,
  inspectionTaskDelete,
  inspectionTaskRun,
  inspectionReportList,
  inspectionReportDetail,
  inspectionReportDelete,
} from "@/services/admin";

function defaultTaskForm() {
  return {
    name: "",
    inspect_mode: "scheduled",
    cycle: "day",
    cron_expr: "0 0 8 * * *",
    z_ids: [],
    host_types: [],
    group_ids: "",
    cpu_threshold: 80,
    mem_threshold: 80,
    disk_threshold: 85,
    notify_channels: ["mail"],
    notify_user_ids: [],
    notify_group_ids: [],
    notify_emails: "",
    status: true,
    desc: "",
  };
}

export default {
  name: "InspectionCenter",
  mixins: [themeMixin],
  components: { PageLayout },
  data() {
    return {
      activeTab: "tasks",
      overview: {
        total_tasks: 0,
        enabled_tasks: 0,
        total_reports: 0,
        latest_avg_score: 0,
        latest_grade: "",
        grade_counts: { excellent: 0, good: 0, warning: 0, critical: 0 },
        recent_reports: [],
      },
      // 基础下拉数据
      instanceList: [],
      assetTypeList: [],
      userList: [],
      groupList: [],
      allTaskOptions: [],
      channelOptions: [
        { value: "mail", label: "邮件" },
        { value: "wechat", label: "企业微信" },
        { value: "wechat_robot", label: "企微机器人" },
        { value: "dingtalk_robot", label: "钉钉机器人" },
        { value: "feishu_robot", label: "飞书机器人" },
        { value: "webhook", label: "自定义Webhook" },
      ],
      // 任务列表
      taskLoading: false,
      runningTaskId: null,
      taskList: [],
      taskQuery: { name: "", status: undefined, page: 1, pageSize: 10 },
      taskPagination: {
        total: 0,
        current: 1,
        pageSize: 10,
        showSizeChanger: true,
        showQuickJumper: true,
        pageSizeOptions: ["10", "20", "50"],
        showTotal: total => `共 ${total} 条`,
      },
      taskColumns: [
        { title: "ID", dataIndex: "id", width: 64 },
        { title: "任务名称", dataIndex: "name", width: 170 },
        { title: "巡检范围", key: "scope_col", width: 210, scopedSlots: { customRender: "scope_col" } },
        { title: "调度周期", key: "schedule_col", width: 150, scopedSlots: { customRender: "schedule_col" } },
        { title: "水位阈值", key: "threshold_col", width: 175, scopedSlots: { customRender: "threshold_col" } },
        { title: "推送渠道", key: "notify_col", width: 150, scopedSlots: { customRender: "notify_col" } },
        { title: "最近健康评分", key: "last_score_col", width: 135, scopedSlots: { customRender: "last_score_col" } },
        { title: "最近执行", key: "exec_status_col", width: 150, scopedSlots: { customRender: "exec_status_col" } },
        { title: "状态", key: "status_col", width: 90, scopedSlots: { customRender: "status_col" } },
        { title: "操作", key: "task_op_col", width: 250, align: "center", scopedSlots: { customRender: "task_op_col" } },
      ],
      // 报告列表
      reportLoading: false,
      reportList: [],
      reportQuery: { task_id: undefined, health_grade: undefined, page: 1, pageSize: 10 },
      reportPagination: {
        total: 0,
        current: 1,
        pageSize: 10,
        showSizeChanger: true,
        showQuickJumper: true,
        pageSizeOptions: ["10", "20", "50"],
        showTotal: total => `共 ${total} 条`,
      },
      reportColumns: [
        { title: "报告ID", dataIndex: "id", width: 76 },
        { title: "巡检任务", dataIndex: "task_name", width: 160 },
        { title: "触发", dataIndex: "trigger_type", width: 76, customRender: v => (v === "scheduled" ? "定时" : "手动") },
        { title: "健康评分", key: "score_col", width: 150, scopedSlots: { customRender: "score_col" } },
        { title: "设备状态统计", key: "hosts_stat_col", width: 220, scopedSlots: { customRender: "hosts_stat_col" } },
        { title: "资源超标", key: "threshold_stat_col", width: 195, scopedSlots: { customRender: "threshold_stat_col" } },
        { title: "活跃告警", key: "alarms_stat_col", width: 110, scopedSlots: { customRender: "alarms_stat_col" } },
        { title: "巡检时间", key: "time_col", width: 155, scopedSlots: { customRender: "time_col" } },
        { title: "报告导出", key: "download_col", width: 165, scopedSlots: { customRender: "download_col" } },
        { title: "操作", key: "report_op_col", width: 155, align: "center", scopedSlots: { customRender: "report_op_col" } },
      ],
      // 任务弹窗
      taskModalVisible: false,
      taskModalLoading: false,
      editingTaskId: null,
      taskForm: defaultTaskForm(),
      taskFormRules: {
        name: [{ required: true, message: "请输入巡检任务名称", trigger: "blur" }],
      },
      // 报告详情弹窗
      detailModalVisible: false,
      detailLoading: false,
      reportDetail: null,
      detailTab: "hosts",
      onlyAbnormalHosts: false,
      hostFilterKeyword: "",
      detailHostColumns: [
        { title: "实例", dataIndex: "instance_name", width: 95 },
        { title: "主机名", dataIndex: "name", width: 145 },
        { title: "IP地址", dataIndex: "ip", width: 132 },
        { title: "设备类型", dataIndex: "type_name", width: 85 },
        { title: "采集", key: "host_avail", width: 64, scopedSlots: { customRender: "host_avail" } },
        { title: "CPU", key: "host_cpu", width: 66, scopedSlots: { customRender: "host_cpu" } },
        { title: "内存", key: "host_mem", width: 66, scopedSlots: { customRender: "host_mem" } },
        { title: "最大磁盘", key: "host_disk", width: 118, scopedSlots: { customRender: "host_disk" } },
        { title: "告警(高危)", key: "host_alarms", width: 82, scopedSlots: { customRender: "host_alarms" } },
        { title: "状态与得分", key: "host_status", width: 106, scopedSlots: { customRender: "host_status" } },
        { title: "异常明细", key: "host_issues", width: 240, scopedSlots: { customRender: "host_issues" } },
      ],
      detailAlarmColumns: [
        { title: "实例", dataIndex: "instance_name", width: 110 },
        { title: "主机", dataIndex: "hostname", width: 145 },
        { title: "IP", dataIndex: "host_ip", width: 132 },
        { title: "级别", key: "alarm_level", width: 85, scopedSlots: { customRender: "alarm_level" } },
        { title: "告警内容", dataIndex: "message" },
        { title: "发生时间", dataIndex: "occur_time", width: 155 },
        { title: "确认", key: "alarm_ack", width: 85, scopedSlots: { customRender: "alarm_ack" } },
      ],
      instanceStatColumns: [
        { title: "实例名称", dataIndex: "instance_name" },
        { title: "状态", key: "inst_reach", width: 65, scopedSlots: { customRender: "inst_reach" } },
        { title: "主机", dataIndex: "total_hosts", width: 60 },
        { title: "在线", dataIndex: "available_hosts", width: 60 },
        { title: "失联", dataIndex: "unavailable_hosts", width: 60 },
        { title: "异常", dataIndex: "abnormal_hosts", width: 60 },
        { title: "均分", dataIndex: "avg_score", width: 60 },
      ],
      typeStatColumns: [
        { title: "设备类型", dataIndex: "type_name" },
        { title: "总数", dataIndex: "total_hosts", width: 65 },
        { title: "在线", dataIndex: "available_hosts", width: 65 },
        { title: "异常", dataIndex: "abnormal_hosts", width: 65 },
      ],
      pollTimer: null,
    };
  },
  computed: {
    latestCompletedReport() {
      const list = (this.overview && this.overview.recent_reports) || [];
      return list.find(r => r && r.status === 2) || null;
    },
    detailModalTitle() {
      if (!this.reportDetail) return "巡检健康评分报告";
      return `巡检健康评分报告 #${this.reportDetail.id} - ${this.reportDetail.task_name}`;
    },
    summary() {
      return (this.reportDetail && this.reportDetail.summary) || {};
    },
    breakdown() {
      return this.summary.score_breakdown || {
        availability_score: 0, availability_max: 35,
        resource_score: 0, resource_max: 30,
        alarm_score: 0, alarm_max: 25,
        stability_score: 0, stability_max: 10,
      };
    },
    filteredDetailHosts() {
      const hosts = (this.reportDetail && this.reportDetail.hosts) || [];
      const kw = (this.hostFilterKeyword || "").toLowerCase();
      return hosts.filter(h => {
        if (this.onlyAbnormalHosts && h.status === "normal") {
          return false;
        }
        if (!kw) return true;
        const haystack = [
          h.instance_name,
          h.name,
          h.host,
          h.ip,
          h.type_name,
          (h.issues || []).join(" "),
        ].join(" ").toLowerCase();
        return haystack.includes(kw);
      });
    },
  },
  created() {
    this.loadDictionaries();
    this.refreshAll();
  },
  beforeDestroy() {
    this.stopPolling();
  },
  methods: {
    downloadUrl(filename) {
      return `/download/${encodeURIComponent(filename)}`;
    },
    formatDateTime(val) {
      if (!val) return "--";
      const d = new Date(val);
      if (Number.isNaN(d.getTime())) return String(val);
      const pad = n => String(n).padStart(2, "0");
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
    },
    gradeLabel(grade) {
      const map = { excellent: "优秀", good: "良好", warning: "亚健康", critical: "高危" };
      return map[grade] || "未评估";
    },
    gradeColor(grade) {
      const map = { excellent: "#52c41a", good: "#1890ff", warning: "#fa8c16", critical: "#f5222f" };
      return map[grade] || "#8c8c8c";
    },
    gradeTagColor(grade) {
      const map = { excellent: "green", good: "blue", warning: "orange", critical: "red" };
      return map[grade];
    },
    hostStatusLabel(status) {
      const map = { normal: "正常", warning: "亚健康", critical: "严重", offline: "失联" };
      return map[status] || status;
    },
    hostStatusTagColor(status) {
      const map = { normal: "green", warning: "orange", critical: "red", offline: "magenta" };
      return map[status];
    },
    cycleLabel(cycle) {
      const map = { day: "每天", week: "每周", custom: "自定义" };
      return map[cycle] || cycle || "每天";
    },
    formatInstanceNames(zids) {
      if (!zids || String(zids).trim() === "*" || String(zids).trim() === "") {
        return "全部已启用实例";
      }
      return String(zids).split(",").map(s => s.trim()).filter(Boolean).map(id => {
        const hit = this.instanceList.find(item => String(item.id) === String(id));
        return hit ? hit.name : `实例#${id}`;
      }).join("、");
    },
    formatHostTypeNames(types) {
      if (!types || String(types).trim() === "*" || String(types).trim() === "") {
        return "全部设备类型";
      }
      return String(types).split(",").map(s => s.trim()).filter(Boolean).map(code => {
        const hit = this.assetTypeList.find(item => String(item.type_code) === String(code));
        return hit ? hit.name : code;
      }).join("、");
    },
    formatChannelNames(raw) {
      if (!raw) return "不推送";
      const labels = {};
      this.channelOptions.forEach(opt => { labels[opt.value] = opt.label; });
      const parts = String(raw).split(",").map(s => s.trim()).filter(Boolean);
      return parts.length ? parts.map(p => labels[p] || p).join("、") : "不推送";
    },
    async loadDictionaries() {
      try {
        const [instResp, typeResp, userResp, groupResp] = await Promise.all([
          listZabbixInstance().catch(() => null),
          getAssetTypes().catch(() => null),
          userList({ page: 1, limit: 1000 }).catch(() => null),
          groupList({ page: 1, limit: 1000 }).catch(() => null),
        ]);
        if (instResp && instResp.data && instResp.data.code === 200) {
          this.instanceList = instResp.data.data || [];
        }
        if (typeResp && typeResp.data && typeResp.data.code === 200) {
          this.assetTypeList = typeResp.data.data || [];
        }
        if (userResp && userResp.data && userResp.data.code === 200) {
          this.userList = (userResp.data.data && userResp.data.data.items) || [];
        }
        if (groupResp && groupResp.data && groupResp.data.code === 200) {
          this.groupList = (groupResp.data.data && groupResp.data.data.items) || [];
        }
      } catch (e) {
        // ignore optional dict load error for non-admin
      }
    },
    refreshAll() {
      this.loadOverview();
      this.loadTasks();
      this.loadReports();
    },
    handleTabChange(key) {
      if (key === "reports") {
        this.loadReports();
      } else {
        this.loadTasks();
      }
    },
    loadOverview() {
      inspectionOverview().then(resp => {
        const res = resp.data;
        if (res && res.code === 200 && res.data) {
          this.overview = res.data;
        }
      });
    },
    searchTasks() {
      this.taskQuery.page = 1;
      this.loadTasks();
    },
    resetTaskQuery() {
      this.taskQuery = { name: "", status: undefined, page: 1, pageSize: 10 };
      this.loadTasks();
    },
    handleTaskTableChange(pagination) {
      this.taskQuery.page = pagination.current;
      this.taskQuery.pageSize = pagination.pageSize;
      this.loadTasks();
    },
    loadTasks() {
      this.taskLoading = true;
      inspectionTaskList({
        page: this.taskQuery.page,
        limit: this.taskQuery.pageSize,
        name: this.taskQuery.name,
        status: this.taskQuery.status,
      }).then(resp => {
        const res = resp.data;
        if (res && res.code === 200 && res.data) {
          this.taskList = res.data.items || [];
          this.taskPagination.total = res.data.total || 0;
          this.taskPagination.current = this.taskQuery.page;
          this.taskPagination.pageSize = this.taskQuery.pageSize;
          if (!this.taskQuery.name && !this.taskQuery.status) {
            this.allTaskOptions = this.taskList;
          }
          const anyRunning = this.taskList.some(t => t.exec_status === 1);
          if (anyRunning) {
            this.startPolling();
          } else {
            this.stopPolling();
          }
        }
      }).finally(() => {
        this.taskLoading = false;
      });
    },
    searchReports() {
      this.reportQuery.page = 1;
      this.loadReports();
    },
    resetReportQuery() {
      this.reportQuery = { task_id: undefined, health_grade: undefined, page: 1, pageSize: 10 };
      this.loadReports();
    },
    handleReportTableChange(pagination) {
      this.reportQuery.page = pagination.current;
      this.reportQuery.pageSize = pagination.pageSize;
      this.loadReports();
    },
    loadReports() {
      this.reportLoading = true;
      inspectionReportList({
        page: this.reportQuery.page,
        limit: this.reportQuery.pageSize,
        task_id: this.reportQuery.task_id,
        health_grade: this.reportQuery.health_grade,
      }).then(resp => {
        const res = resp.data;
        if (res && res.code === 200 && res.data) {
          this.reportList = res.data.items || [];
          this.reportPagination.total = res.data.total || 0;
          this.reportPagination.current = this.reportQuery.page;
          this.reportPagination.pageSize = this.reportQuery.pageSize;
        }
      }).finally(() => {
        this.reportLoading = false;
      });
    },
    viewTaskReports(record) {
      this.reportQuery.task_id = String(record.id);
      this.reportQuery.page = 1;
      this.activeTab = "reports";
      this.loadReports();
    },
    openCreateTask() {
      this.editingTaskId = null;
      this.taskForm = defaultTaskForm();
      this.taskModalVisible = true;
      this.$nextTick(() => {
        if (this.$refs.taskForm) this.$refs.taskForm.clearValidate();
      });
    },
    openEditTask(record) {
      this.editingTaskId = record.id;
      const splitList = raw => {
        if (!raw || String(raw).trim() === "*") return [];
        return String(raw).split(",").map(s => s.trim()).filter(Boolean);
      };
      this.taskForm = {
        name: record.name || "",
        inspect_mode: record.inspect_mode || "scheduled",
        cycle: record.cycle || "day",
        cron_expr: record.cron_expr || "0 0 8 * * *",
        z_ids: splitList(record.z_ids),
        host_types: splitList(record.host_types),
        group_ids: record.group_ids || "",
        cpu_threshold: record.cpu_threshold || 80,
        mem_threshold: record.mem_threshold || 80,
        disk_threshold: record.disk_threshold || 85,
        notify_channels: splitList(record.notify_channels),
        notify_user_ids: splitList(record.notify_user_ids),
        notify_group_ids: splitList(record.notify_group_ids),
        notify_emails: record.notify_emails || "",
        status: record.status === "1",
        desc: record.desc || "",
      };
      this.taskModalVisible = true;
      this.$nextTick(() => {
        if (this.$refs.taskForm) this.$refs.taskForm.clearValidate();
      });
    },
    handleInspectModeChange(mode) {
      if (mode === "scheduled" && !this.taskForm.cron_expr) {
        this.taskForm.cron_expr = this.taskForm.cycle === "week" ? "0 0 8 * * 1" : "0 0 8 * * *";
      }
    },
    handleCycleChange(cycle) {
      if (cycle === "day") {
        this.taskForm.cron_expr = "0 0 8 * * *";
      } else if (cycle === "week") {
        this.taskForm.cron_expr = "0 0 8 * * 1";
      }
    },
    submitTask() {
      this.$refs.taskForm.validate(valid => {
        if (!valid) return;
        this.taskModalLoading = true;
        const payload = {
          name: this.taskForm.name,
          inspect_mode: this.taskForm.inspect_mode,
          cycle: this.taskForm.cycle,
          cron_expr: this.taskForm.cron_expr,
          z_ids: this.taskForm.z_ids && this.taskForm.z_ids.length ? this.taskForm.z_ids.join(",") : "*",
          host_types: this.taskForm.host_types && this.taskForm.host_types.length ? this.taskForm.host_types.join(",") : "*",
          group_ids: this.taskForm.group_ids || "",
          cpu_threshold: Number(this.taskForm.cpu_threshold) || 80,
          mem_threshold: Number(this.taskForm.mem_threshold) || 80,
          disk_threshold: Number(this.taskForm.disk_threshold) || 85,
          notify_channels: (this.taskForm.notify_channels || []).join(","),
          notify_user_ids: (this.taskForm.notify_user_ids || []).join(","),
          notify_group_ids: (this.taskForm.notify_group_ids || []).join(","),
          notify_emails: this.taskForm.notify_emails || "",
          status: this.taskForm.status ? "1" : "0",
          desc: this.taskForm.desc || "",
        };
        const req = this.editingTaskId
          ? inspectionTaskUpdate(this.editingTaskId, payload)
          : inspectionTaskCreate(payload);
        req.then(resp => {
          const res = resp.data;
          if (res && res.code === 200) {
            this.$message.success(this.editingTaskId ? "巡检任务更新成功" : "巡检任务创建成功");
            this.taskModalVisible = false;
            this.refreshAll();
          } else {
            this.$message.error((res && res.message) || "保存失败");
          }
        }).finally(() => {
          this.taskModalLoading = false;
        });
      });
    },
    toggleTaskStatus(record) {
      const nextStatus = record.status === "1" ? "0" : "1";
      inspectionTaskStatusPut(record.id, { status: nextStatus }).then(resp => {
        const res = resp.data;
        if (res && res.code === 200) {
          this.$message.success(nextStatus === "1" ? "任务已启用" : "任务已停用");
          this.loadOverview();
          this.loadTasks();
        } else {
          this.$message.error((res && res.message) || "操作失败");
        }
      });
    },
    removeTask(record) {
      inspectionTaskDelete(record.id).then(resp => {
        const res = resp.data;
        if (res && res.code === 200) {
          this.$message.success("删除成功");
          this.refreshAll();
        } else {
          this.$message.error((res && res.message) || "删除失败");
        }
      });
    },
    runTaskNow(record) {
      this.runningTaskId = record.id;
      inspectionTaskRun(record.id).then(resp => {
        const res = resp.data;
        if (res && res.code === 200 && res.data) {
          const r = res.data;
          if (r.status === 2) {
            this.$message.success(`巡检完成！综合健康评分：${r.health_score} 分（${this.gradeLabel(r.health_grade)}）`);
            this.refreshAll();
            this.openReportDetail(r.id);
          } else {
            this.$message.info("巡检任务正在后台执行，完成后将自动刷新结果");
            this.loadTasks();
            this.startPolling();
          }
        } else {
          this.$message.error((res && res.message) || "触发巡检失败");
        }
      }).finally(() => {
        this.runningTaskId = null;
      });
    },
    startPolling() {
      if (this.pollTimer) return;
      this.pollTimer = setInterval(() => {
        this.loadTasks();
        this.loadOverview();
        if (this.activeTab === "reports") {
          this.loadReports();
        }
      }, 3000);
    },
    stopPolling() {
      if (this.pollTimer) {
        clearInterval(this.pollTimer);
        this.pollTimer = null;
      }
    },
    openReportDetail(reportId) {
      this.detailModalVisible = true;
      this.detailLoading = true;
      this.detailTab = "hosts";
      this.onlyAbnormalHosts = false;
      this.hostFilterKeyword = "";
      inspectionReportDetail(reportId).then(resp => {
        const res = resp.data;
        if (res && res.code === 200 && res.data) {
          this.reportDetail = res.data;
        } else {
          this.$message.error((res && res.message) || "加载巡检报告失败");
        }
      }).finally(() => {
        this.detailLoading = false;
      });
    },
    removeReport(record) {
      inspectionReportDelete(record.id).then(resp => {
        const res = resp.data;
        if (res && res.code === 200) {
          this.$message.success("删除成功");
          this.loadOverview();
          this.loadReports();
          this.loadTasks();
        } else {
          this.$message.error((res && res.message) || "删除失败");
        }
      });
    },
  },
};
</script>

<style lang="less" scoped>
.inspect-kpi-card {
  height: 100%;
  border-radius: 6px;
}
.kpi-label {
  font-size: 13px;
  color: rgba(0, 0, 0, 0.55);
  margin-bottom: 6px;
}
.kpi-main {
  display: flex;
  align-items: baseline;
  margin-bottom: 6px;
}
.kpi-score {
  font-size: 28px;
  font-weight: 600;
  line-height: 1.2;
}
.kpi-unit {
  font-size: 13px;
  color: rgba(0, 0, 0, 0.55);
  margin-left: 4px;
}
.kpi-sub {
  font-size: 12px;
  color: rgba(0, 0, 0, 0.48);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.op-btn {
  padding: 0 4px;
}
.dl-link {
  margin-right: 8px;
}
.compact-inspect-form {
  /deep/ .ant-form-item {
    margin-bottom: 6px;
  }
  /deep/ .ant-card-head {
    min-height: 36px;
    padding: 0 12px;
  }
  /deep/ .ant-card-head-title {
    padding: 8px 0;
    font-size: 13px;
  }
  /deep/ .ant-card-body {
    padding: 10px 12px;
  }
}
.score-banner-card {
  background: #fafafa;
  border-radius: 6px;
}
.dim-card {
  background: #fff;
  border: 1px solid #f0f0f0;
  border-radius: 6px;
  padding: 10px 12px;
}
.dim-title {
  font-size: 12px;
  color: rgba(0, 0, 0, 0.55);
}
.dim-score {
  font-size: 18px;
  font-weight: 600;
  margin: 2px 0;
}
.dim-sub {
  font-size: 11px;
  color: rgba(0, 0, 0, 0.45);
  margin-top: 4px;
}
.metric-alert {
  color: #cf1322;
  font-weight: 600;
}
.issue-tag-wrap {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}
.issue-tag-item {
  margin-right: 0;
  white-space: normal;
  height: auto;
  line-height: 1.4;
  word-break: break-word;
}
</style>
