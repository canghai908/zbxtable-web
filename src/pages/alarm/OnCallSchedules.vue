<template>
  <page-layout :noTitle="true">
    <div class="oncall-toolbar"><div><h3>值班排班</h3><span class="muted">按排班时区轮换，临时代班优先；空班按通知渠道使用兜底人员。</span></div><div><a-button @click="load">刷新</a-button><a-button type="primary" @click="edit()">新增排班</a-button></div></div>
    <a-alert v-if="error" type="error" :message="error" show-icon style="margin-bottom: 12px" />
    <div class="oncall-list-scroll" tabindex="0" aria-label="值班排班列表，窄屏可横向滚动"><a-table class="oncall-list-table" :loading="loading" :data-source="list" :columns="columns" :pagination="pagination" @change="changePage" row-key="id" size="small">
      <template slot="rotation" slot-scope="text">{{ rotationLabels[text] || text }}</template>
      <template slot="members" slot-scope="text">{{ names(text) }}</template>
      <template slot="coverage" slot-scope="text, record"><div>{{ record.window_start }}–{{ record.window_end }} {{ record.window_start === record.window_end ? '全天' : '' }}</div><small>{{ weekText(record.weekdays) }} · {{ record.timezone }}</small></template>
      <template slot="enabled" slot-scope="text"><a-tag :color="text ? 'green' : undefined">{{ text ? '启用' : '禁用' }}</a-tag></template>
      <template slot="actions" slot-scope="text, record"><a-button type="link" size="small" @click="inspect(record)">日历 / 代班</a-button><a-button type="link" size="small" @click="edit(record)">编辑</a-button><a-popconfirm title="删除此排班？已被规则引用的排班不能删除。" @confirm="remove(record)"><a-button type="link" size="small">删除</a-button></a-popconfirm></template>
    </a-table></div>

    <a-modal :visible="editorVisible" :title="form.id ? '编辑排班' : '新增排班'" width="940px"
      wrap-class-name="oncall-editor-modal" :confirm-loading="saving" @ok="save" @cancel="editorVisible = false">
      <a-form-model :model="form" layout="vertical" class="oncall-editor">
        <section class="editor-section">
          <div class="editor-heading"><h4>基本设置</h4><a-switch v-model="form.enabled" checked-children="启用" un-checked-children="禁用" /></div>
          <div class="basic-fields">
            <a-form-model-item label="排班名称" required><a-input v-model.trim="form.name" :max-length="120" placeholder="例如：生产运维一线" /></a-form-model-item>
            <a-form-model-item label="排班时区" required>
              <a-select v-model="form.timezone" show-search option-filter-prop="children" placeholder="搜索城市或 IANA 时区" style="width:100%">
                <a-select-option v-for="zone in zoneOptions" :key="zone.value" :value="zone.value" :title="zone.label">{{ zone.label }}</a-select-option>
              </a-select>
            </a-form-model-item>
            <a-form-model-item label="轮换方式"><a-select v-model="form.rotation" style="width:100%"><a-select-option v-for="(label,key) in rotationLabels" :key="key" :value="key">{{ label }}</a-select-option></a-select></a-form-model-item>
          </div>
          <div class="anchor-fields">
            <a-form-model-item label="轮换起点（本机时间）" required><a-date-picker v-model="form.start" show-time format="YYYY-MM-DD HH:mm:ss" style="width:100%" /></a-form-model-item>
            <div class="anchor-summary"><span class="muted">排班时区中的起点 / 交接钟点</span><strong>{{ zoneStart }}</strong><small>{{ form.timezone }} · 起点之前视为空班</small></div>
          </div>
        </section>
        <div class="editor-columns">
          <section class="editor-section">
            <div class="editor-heading"><h4>轮班成员</h4><span class="muted">{{ form.members.length }} 人</span></div>
            <a-form-model-item label="选择值班人员" required>
              <a-select v-model="form.members" mode="multiple" option-filter-prop="children" placeholder="可搜索并选择多人" style="width:100%"><a-select-option v-for="u in users" :key="u.id" :value="u.id">{{ u.username }}{{ u.status !== 0 ? '（已禁用）' : '' }}</a-select-option></a-select>
            </a-form-model-item>
            <div v-if="!form.members.length" class="member-placeholder">选择成员后，可调整轮班顺序</div>
            <ol v-else class="member-order">
              <li v-for="(id,i) in form.members" :key="id"><span class="member-position">{{ i + 1 }}</span><strong>{{ names([id]) }}</strong><div><a-button size="small" class="touch-action" :disabled="i===0" :aria-label="`将${names([id])}上移`" @click="form.members=moveMember(form.members,i,-1)">上移</a-button><a-button size="small" class="touch-action" :disabled="i===form.members.length-1" :aria-label="`将${names([id])}下移`" @click="form.members=moveMember(form.members,i,1)">下移</a-button></div></li>
            </ol>
            <p class="editor-help">{{ form.rotation === 'fixed' ? '固定模式：所有成员同时值班。' : '每班一人，按以上顺序循环；临时代班不改变轮班顺序。' }}</p>
          </section>
          <section class="editor-section">
            <div class="editor-heading"><h4>覆盖范围</h4><span class="muted">按排班时区</span></div>
            <a-form-model-item label="值班星期" required><a-checkbox-group v-model="form.weekdays" :options="weekdays" class="coverage-weekdays" /></a-form-model-item>
            <a-form-model-item label="每日覆盖时段">
              <div class="time-range"><a-time-picker :value="clockValue(form.window_start)" format="HH:mm" :allow-clear="false" aria-label="覆盖开始时间" @change="setClock('window_start',$event)" /><span>至</span><a-time-picker :value="clockValue(form.window_end)" format="HH:mm" :allow-clear="false" aria-label="覆盖结束时间" @change="setClock('window_end',$event)" /></div>
            </a-form-model-item>
            <div class="coverage-summary">{{ coverageSummary }}</div>
            <p class="editor-help">相同时间表示全天；跨午夜时，凌晨时段归属前一天的值班星期。</p>
          </section>
        </div>
        <section class="editor-section">
          <div class="editor-heading"><h4>空班兜底</h4><span class="muted">与所选渠道的可达性一起判断</span></div>
          <div class="fallback-fields">
            <a-form-model-item label="备用用户"><a-select v-model="form.fallback_user_ids" mode="multiple" option-filter-prop="children" placeholder="选择备用接收人" style="width:100%"><a-select-option v-for="u in users" :key="u.id" :value="u.id">{{ u.username }}</a-select-option></a-select></a-form-model-item>
            <a-form-model-item label="备用用户组"><a-select v-model="form.fallback_group_ids" mode="multiple" option-filter-prop="children" placeholder="选择备用接收组" style="width:100%"><a-select-option v-for="g in groups" :key="g.id" :value="g.id">{{ g.name }}</a-select-option></a-select></a-form-model-item>
          </div>
          <p class="editor-help">空班、成员禁用或缺少渠道地址时尝试兜底。禁用排班后停止正常轮班，关联规则仍尝试兜底人员。</p>
        </section>
      </a-form-model>
      <a-alert v-if="saveError" type="error" :message="saveError" show-icon />
    </a-modal>

    <a-modal :visible="detailVisible" :title="`排班详情 · ${selected.name || ''}`" width="1000px" :footer="null" @cancel="closeDetail">
      <a-spin :spinning="detailLoading">
        <a-alert v-if="detailError" type="error" :message="detailError" show-icon />
        <a-tabs v-model="activeTab" @change="tabChanged">
          <a-tab-pane key="preview" tab="值班预览">
            <div class="preview-toolbar"><a-date-picker v-model="previewAt" show-time format="YYYY-MM-DD HH:mm:ss" /><a-select v-model="previewChannel" aria-label="预览内容" style="width:180px"><a-select-option value="">排班人员</a-select-option><a-select-option value="mail">邮件接收人</a-select-option><a-select-option value="wechat">企业微信接收人</a-select-option><a-select-option value="wechat_robot">群机器人接收人</a-select-option></a-select><a-select v-if="previewView === 'list'" v-model="previewDays" style="width:100px"><a-select-option :value="7">未来 7 天</a-select-option><a-select-option :value="14">未来 14 天</a-select-option><a-select-option :value="31">未来 31 天</a-select-option></a-select><a-button type="primary" :loading="previewLoading" @click="preview">预览</a-button></div>
            <p class="muted preview-help">{{ rotationLabels[selected.rotation] }} · {{ (selected.members || []).length }} 名成员。输入时间按本机时区，结果按 {{ selected.timezone }} 显示。</p>
            <p class="muted preview-help">{{ previewChannel ? '当前显示渠道实际接收人；当班人被禁用或缺少渠道地址时会使用兜底，可能连续多天为同一人。' : '当前显示排班人员，按配置顺序轮换；切换通知渠道可查看实际接收人与兜底。' }}预览不会发送通知。</p>
            <a-alert v-if="previewError" type="error" :message="previewError" show-icon />
            <template v-if="previewResult">
              <div class="view-toolbar preview-summary">
                <a-radio-group v-model="previewView" size="small" button-style="solid"><a-radio-button value="calendar">班次日历</a-radio-button><a-radio-button value="list">明细列表</a-radio-button></a-radio-group>
                <span role="status" :class="['preview-current',{'is-empty':!previewResult.current.user_ids || !previewResult.current.user_ids.length}]"><strong><i class="recipient-status" aria-hidden="true" />选定时刻{{ previewChannel ? '接收人' : '当班' }}：{{ names(previewResult.current.user_ids) }}</strong><span>{{ resolutionText(previewResult.current) }}</span></span>
              </div>
              <schedule-calendar v-if="previewView === 'calendar'" :slots="previewResult.slots || []" :timezone="selected.timezone" :users="users" :month="previewMonth" @month-change="changeCalendarMonth" />
              <a-table v-else size="small" :columns="previewSlotColumns" :data-source="previewResult.slots || []" :row-key="(r,i) => String(i)" :pagination="{pageSize:12}" :scroll="{x:650}"><span slot="time" slot-scope="text">{{ formatInZone(text,selected.timezone) }}</span><span slot="people" slot-scope="text">{{ names(text) }}</span><span slot="source" slot-scope="text,record"><a-tag>{{ sourceLabels[text] || text }}</a-tag>{{ record.reason }}</span></a-table>
            </template>
          </a-tab-pane>
          <a-tab-pane key="overrides" tab="临时代班">
            <a-alert type="info" message="代班优先于正常轮换；同一排班的代班时段不可重叠，结束时刻自动恢复正常轮班。" show-icon style="margin-bottom:12px" />
            <a-button type="primary" @click="openOverride">新增代班</a-button>
            <a-table size="small" :data-source="overrides" :columns="overrideColumns" row-key="id" :scroll="{x:700}"><span slot="time" slot-scope="text">{{ formatInZone(text, selected.timezone) }}</span><span slot="people" slot-scope="text">{{ names(text) }}</span><table-text-detail slot="overrideReason" slot-scope="text" :content="text" title="代班原因" /><span slot="overrideAction" slot-scope="text, record"><a-popconfirm title="撤销该代班？正常轮班将在此时段恢复。" @confirm="removeOverride(record)"><a-button type="link" size="small">撤销</a-button></a-popconfirm></span></a-table>
          </a-tab-pane>
          <a-tab-pane key="audit" tab="变更记录">
            <p class="muted">列表仅显示变更摘要，完整记录可单独查看。</p>
            <a-alert v-if="auditError" type="error" :message="auditError" show-icon style="margin-bottom:8px" />
            <a-table class="audit-table" size="small" table-layout="fixed" :loading="auditLoading" :data-source="audit" :columns="auditColumns" row-key="id" :scroll="{x:820,y:320}" :pagination="auditPagination" @change="changeAuditPage">
              <span slot="time" slot-scope="text">{{ formatInZone(text,selected.timezone) }}</span>
              <span slot="auditAction" slot-scope="text">{{ auditActionLabels[text] || text }}</span>
              <table-text-detail slot="auditDetail" slot-scope="text,record" :content="text" :summary="auditSummary(record)" title="排班变更详情" />
            </a-table>
          </a-tab-pane>
        </a-tabs>
      </a-spin>
    </a-modal>
    <a-modal :visible="overrideVisible" title="新增临时代班" :confirm-loading="overrideSaving" @ok="saveOverride" @cancel="overrideVisible = false">
      <a-form-model layout="vertical"><a-form-model-item label="代班开始（本机时间）" required><a-date-picker v-model="overrideForm.start" show-time style="width:100%" /></a-form-model-item><a-form-model-item label="代班结束（本机时间）" required><a-date-picker v-model="overrideForm.end" show-time style="width:100%" /></a-form-model-item><a-form-model-item label="代班人员" required><a-select v-model="overrideForm.user_ids" mode="multiple" option-filter-prop="children"><a-select-option v-for="u in users" :key="u.id" :value="u.id">{{ u.username }}</a-select-option></a-select></a-form-model-item><a-form-model-item label="原因" required><a-input v-model.trim="overrideForm.reason" :max-length="500" /></a-form-model-item></a-form-model><a-alert v-if="overrideError" type="error" :message="overrideError" show-icon />
    </a-modal>
  </page-layout>
</template>
<script>
import moment from 'moment'
import PageLayout from '@/layouts/PageLayout'
import ScheduleCalendar from '@/components/OnCall/ScheduleCalendar.vue'
import TableTextDetail from '@/components/TableTextDetail/index.vue'
import { auditSummary, auditActionLabels } from '@/components/OnCall/audit'
import { timezoneOptions, calendarMonthWindow } from '@/components/OnCall/calendar'
import { onCallList, onCallGet, onCallCreate, onCallUpdate, onCallDelete, onCallPreview, onCallOverrideCreate, onCallOverrideDelete, onCallAudit, userList, groupList } from '@/services/admin'
import { rotationLabels, sourceLabels, weekdays, ids, moveMember, formatInZone } from '@/components/OnCall/model'
const blank = () => ({ name: '', timezone: 'Asia/Shanghai', rotation: 'daily', start: moment().startOf('day'), members: [], weekdays: [0,1,2,3,4,5,6], window_start: '00:00', window_end: '00:00', fallback_user_ids: [], fallback_group_ids: [], enabled: true })
const unwrap = response => { if (response.data.code !== 200) throw new Error(response.data.message || '操作失败'); return response.data.data }
export default {
  name: 'OnCallSchedules', components: { PageLayout, ScheduleCalendar, TableTextDetail },
  data: () => ({ auditActionLabels, auditLoading:false,auditError:'',auditSequence:0,auditPagination:{current:1,pageSize:10,total:0,size:'small',showSizeChanger:true,showLessItems:true,pageSizeOptions:['10','20','50'],showTotal:total=>`共 ${total} 条`}, rotationLabels, sourceLabels, weekdays, list: [], pagination: {current:1,pageSize:20,total:0,showSizeChanger:true}, users: [], groups: [], loading: false, error: '', editorVisible: false, saving: false, saveError: '', form: blank(), detailVisible: false, detailLoading: false, detailError: '', selected: {}, overrides: [], audit: [], activeTab: 'preview', previewAt: moment(), previewDays: 7, previewView: 'calendar', previewChannel: '', previewLoading: false, previewError: '', previewResult: null, previewSequence: 0, overrideVisible: false, overrideSaving: false, overrideError: '', overrideForm: {},
    columns: [{title:'名称',dataIndex:'name'},{title:'轮换方式',dataIndex:'rotation',scopedSlots:{customRender:'rotation'}},{title:'轮班顺序',dataIndex:'members',scopedSlots:{customRender:'members'}},{title:'覆盖范围',key:'coverage',scopedSlots:{customRender:'coverage'}},{title:'状态',dataIndex:'enabled',scopedSlots:{customRender:'enabled'}},{title:'操作',key:'actions',scopedSlots:{customRender:'actions'}}],
    slotColumns: [{title:'开始',dataIndex:'start',scopedSlots:{customRender:'time'}},{title:'结束',dataIndex:'end',scopedSlots:{customRender:'time'}},{title:'接收人',dataIndex:'user_ids',scopedSlots:{customRender:'people'}},{title:'来源 / 原因',dataIndex:'source',scopedSlots:{customRender:'source'}}],
    overrideColumns: [{title:'开始',dataIndex:'start',scopedSlots:{customRender:'time'}},{title:'结束',dataIndex:'end',scopedSlots:{customRender:'time'}},{title:'代班人员',dataIndex:'user_ids',scopedSlots:{customRender:'people'}},{title:'原因',dataIndex:'reason',scopedSlots:{customRender:'overrideReason'}},{title:'操作人',dataIndex:'created_by'},{title:'操作',key:'action',scopedSlots:{customRender:'overrideAction'}}],
    auditColumns: [{title:'时间',dataIndex:'created',width:170,scopedSlots:{customRender:'time'}},{title:'操作人',dataIndex:'actor',width:110,ellipsis:true},{title:'操作',dataIndex:'action',width:110,ellipsis:true,scopedSlots:{customRender:'auditAction'}},{title:'变更摘要',dataIndex:'detail',scopedSlots:{customRender:'auditDetail'}}],
  }),
  watch: { previewAt() { this.clearPreview() }, previewDays() { this.clearPreview() }, previewChannel() { this.clearPreview() }, previewView() { this.$nextTick(()=>this.preview()) } },
  computed: {
    previewSlotColumns() { return this.slotColumns.map(column => column.dataIndex === 'user_ids' ? {...column,title:this.previewChannel ? '实际接收人' : '值班人员'} : column) },
    previewMonth() { return this.previewAt ? calendarMonthWindow(this.previewAt.toISOString(),this.selected.timezone || 'Asia/Shanghai').month : '' },
    zoneOptions() { return timezoneOptions(this.form.timezone) },
    zoneStart() { return this.form.start ? formatInZone(this.form.start.toISOString(),this.form.timezone) : '请选择轮换起点' },
    coverageSummary() { return this.form.window_start === this.form.window_end ? '全天 24 小时覆盖' : `${this.form.window_start} 至 ${this.form.window_end}${this.form.window_end < this.form.window_start ? '（次日）' : ''}` },
  },
  created() { this.load() },
  methods: {
    moveMember, formatInZone, auditSummary,
    clockValue(value) { return moment(value,'HH:mm',true).isValid() ? moment(value,'HH:mm') : null },
    setClock(field,value) { this.form[field] = value ? value.format('HH:mm') : '' },
    names(value) { const found = ids(value).map(id => { const u = this.users.find(u => u.id === id); return u ? u.username : `用户 #${id}` }); return found.join(' → ') || '无人 / 空班' },
    weekText(value) { return weekdays.filter(w => (value || []).includes(w.value)).map(w => w.label).join('、') || '未覆盖星期' },
    resolutionText(result) { return [sourceLabels[result.source] || result.source, result.reason, result.next_handoff ? '下次交接：' + formatInZone(result.next_handoff,this.selected.timezone) : ''].filter(Boolean).join(' · ') },
    async load() { this.loading = true; this.error = ''; try { const [list, users, groups] = await Promise.all([onCallList({page:this.pagination.current,limit:this.pagination.pageSize}),userList({page:1,limit:1000}),groupList({page:1,limit:1000})]); this.list = unwrap(list).items || []; this.pagination.total = unwrap(list).total || 0; this.users = unwrap(users).items || []; this.groups = unwrap(groups).items || [] } catch (e) { this.error = e.message || '加载失败' } finally { this.loading = false } },
    changePage(page) { this.pagination.current = page.current; this.pagination.pageSize = page.pageSize; this.load() },
    edit(record) { this.saveError = ''; this.form = record ? { ...record, start: moment(record.start), members: ids(record.members), weekdays: (record.weekdays || []).slice(), fallback_user_ids: ids(record.fallback_user_ids), fallback_group_ids: ids(record.fallback_group_ids) } : blank(); this.editorVisible = true },
    async save() { this.saveError = ''; if (!this.form.name || !this.form.start || !this.form.members.length || !this.form.weekdays.length) { this.saveError = '请填写名称、轮换起点、成员和覆盖星期'; return } this.saving = true; try { const payload = {...this.form,start:this.form.start.toISOString()}; unwrap(await (this.form.id ? onCallUpdate(this.form.id,payload) : onCallCreate(payload))); this.editorVisible = false; await this.load() } catch (e) { this.saveError = e.message || '保存失败' } finally { this.saving = false } },
    async remove(record) { try { unwrap(await onCallDelete(record.id)); await this.load() } catch (e) { this.$message.error(e.message || '删除失败') } },
    async inspect(record) { this.auditSequence++;this.auditLoading=false;this.audit=[];this.auditError='';this.auditPagination.current=1;this.auditPagination.total=0;this.selected = {...record}; this.detailVisible = true; this.detailError = ''; this.activeTab = 'preview'; this.clearPreview(); this.detailLoading = true; try { const detail = unwrap(await onCallGet(record.id)); this.selected = detail.schedule; this.overrides = detail.overrides || []; await this.preview() } catch (e) { this.detailError = e.message || '加载失败' } finally { this.detailLoading = false } },
    closeDetail() { this.detailVisible = false; this.auditSequence++;this.auditLoading=false; this.clearPreview() },
    clearPreview() { this.previewSequence++; this.previewResult = null; this.previewError = '' },
    changeCalendarMonth(month) {
      this.previewAt=moment(calendarMonthWindow(month,this.selected.timezone).start)
      this.$nextTick(()=>this.preview())
    },
    async preview() {
      this.clearPreview()
      const sequence=this.previewSequence
      if(!this.previewAt) {this.previewError='请选择预览时间';return}
      this.previewLoading=true
      try {
        const at=this.previewAt.toISOString()
        const id=this.selected.id, channel=this.previewChannel
        let result
        if(this.previewView === 'calendar') {
          const window=calendarMonthWindow(at,this.selected.timezone)
          const [current,month]=await Promise.all([
            onCallPreview(id,{at,days:1,channel}),
            onCallPreview(id,{at:window.start,days:window.days,channel}),
          ])
          result={...unwrap(month),current:unwrap(current).current}
        } else result=unwrap(await onCallPreview(id,{at,days:this.previewDays,channel}))
        if(sequence===this.previewSequence) this.previewResult=result
      } catch(e) {if(sequence===this.previewSequence) this.previewError=e.message||'预览失败'}
      finally {if(sequence===this.previewSequence) this.previewLoading=false}
    },
    async tabChanged(key) { if (key === 'audit') await this.loadAudit() },
    changeAuditPage(page) { this.auditPagination.current=page.current;this.auditPagination.pageSize=page.pageSize;this.loadAudit() },
    async loadAudit() {
      const sequence=++this.auditSequence, scheduleID=this.selected.id
      this.auditLoading=true;this.auditError='';this.audit=[]
      try {
        const data=unwrap(await onCallAudit(scheduleID,{page:this.auditPagination.current,limit:this.auditPagination.pageSize}))
        if(sequence!==this.auditSequence || scheduleID!==this.selected.id) return
        this.audit=data.items||[];this.auditPagination.total=data.total||0
      } catch(e) {if(sequence===this.auditSequence) this.auditError=e.message||'加载记录失败'}
      finally {if(sequence===this.auditSequence) this.auditLoading=false}
    },
    openOverride() { this.overrideError = ''; this.overrideForm = { start: moment(), end: moment().add(1,'day'), user_ids: [], reason: '' }; this.overrideVisible = true },
    async saveOverride() { this.overrideError = ''; const f = this.overrideForm; if (!f.start || !f.end || !f.end.isAfter(f.start) || !f.user_ids.length || !f.reason) { this.overrideError = '请填写有效起止时间、代班人员和原因'; return } this.overrideSaving = true; try { unwrap(await onCallOverrideCreate(this.selected.id,{...f,start:f.start.toISOString(),end:f.end.toISOString()})); this.overrideVisible = false; const detail = unwrap(await onCallGet(this.selected.id)); this.overrides = detail.overrides || []; this.clearPreview() } catch (e) { this.overrideError = e.message || '保存失败' } finally { this.overrideSaving = false } },
    async removeOverride(record) { try { unwrap(await onCallOverrideDelete(this.selected.id,record.id)); const detail = unwrap(await onCallGet(this.selected.id)); this.overrides = detail.overrides || []; this.clearPreview() } catch (e) { this.$message.error(e.message || '撤销失败') } },
  },
}
</script>
<style lang="less" scoped>
.oncall-toolbar,.preview-toolbar,.view-toolbar{display:flex;align-items:center;flex-wrap:wrap;gap:8px;margin-bottom:12px}
.oncall-toolbar{justify-content:space-between}.oncall-toolbar h3{margin-bottom:4px}.oncall-toolbar .ant-btn+.ant-btn{margin-left:8px}.muted{color:var(--ops-muted,rgba(0,0,0,.65))}.view-toolbar{justify-content:space-between}
.preview-toolbar,.view-toolbar{margin-bottom:8px}.preview-help{font-size:12px;margin:0 0 8px}.preview-summary{align-items:flex-start}.preview-current{display:flex;flex:1;min-width:180px;flex-wrap:wrap;gap:2px 8px;font-size:12px;line-height:22px;overflow-wrap:anywhere}.preview-current strong{font-weight:500;color:var(--ops-text,rgba(0,0,0,.85))}.preview-current>span{color:var(--ops-muted,rgba(0,0,0,.65))}.recipient-status{display:inline-block;width:6px;height:6px;border-radius:50%;background:#389e0d;margin-right:4px;vertical-align:middle}.preview-current.is-empty .recipient-status{background:#ad6800}
.oncall-editor{display:flex;flex-direction:column;gap:12px}.editor-section{border:1px solid rgba(128,128,128,.2);border-radius:4px;padding:12px;min-width:0}
.editor-heading{display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px;margin-bottom:8px}.editor-heading h4{font-size:14px;font-weight:600;margin:0}.editor-heading .muted{font-size:12px}
.basic-fields{display:grid;grid-template-columns:1.1fr 1.4fr .9fr;gap:12px}.anchor-fields,.fallback-fields,.editor-columns{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}
.basic-fields .ant-form-item,.anchor-fields .ant-form-item,.fallback-fields .ant-form-item{margin-bottom:0}.anchor-fields{margin-top:12px}
.anchor-summary{display:flex;flex-direction:column;justify-content:center;gap:4px;padding:8px 12px;margin-bottom:0;background:rgba(128,128,128,.05);font-size:12px;overflow-wrap:anywhere}.anchor-summary strong{font-weight:500;font-variant-numeric:tabular-nums}.anchor-summary small{color:var(--ops-muted,rgba(0,0,0,.65))}
.member-order{margin:0;padding:0;list-style:none;max-height:210px;overflow-y:auto}.member-order li{display:flex;align-items:center;gap:8px;padding:6px 0;border-bottom:1px solid rgba(128,128,128,.15)}.member-order strong{font-weight:500;min-width:0;overflow-wrap:anywhere;flex:1}.member-order li>div{display:flex;flex-shrink:0;gap:4px}.member-position{display:inline-flex;align-items:center;justify-content:center;width:22px;height:22px;background:rgba(128,128,128,.1);border-radius:3px;font-size:12px}.member-placeholder{padding:18px 8px;text-align:center;color:var(--ops-muted,rgba(0,0,0,.65));background:rgba(128,128,128,.04)}
.editor-help{font-size:12px;color:var(--ops-muted,rgba(0,0,0,.65));margin:8px 0 0}.time-range{display:flex;align-items:center;gap:8px}.time-range>.ant-time-picker{width:auto;min-width:0;flex:1}.coverage-summary{padding:8px 10px;background:rgba(128,128,128,.05);font-size:12px}.coverage-weekdays{display:flex;flex-wrap:wrap;gap:4px 10px}.coverage-weekdays /deep/ .ant-checkbox-wrapper{margin-left:0}
@media(max-width:767px){.basic-fields,.anchor-fields,.fallback-fields,.editor-columns{grid-template-columns:minmax(0,1fr)}.editor-section{padding:10px}.basic-fields .ant-form-item,.anchor-fields .ant-form-item,.fallback-fields .ant-form-item{margin-bottom:0}.anchor-fields{margin-top:12px}
.anchor-summary{margin-bottom:0}.preview-toolbar>.ant-calendar-picker{width:100%}.editor-columns{gap:12px}}
.audit-table /deep/ .ant-table-tbody>tr>td{vertical-align:top}
.audit-table /deep/ .ant-pagination{max-width:100%;display:flex;align-items:center;flex-wrap:wrap;row-gap:6px}
.audit-table /deep/ .ant-pagination-options{margin-left:8px}
// The table no longer forces overflow-x:scroll on wide screens. Only this
// wrapper scrolls when the viewport genuinely cannot fit the columns.
.oncall-list-scroll{overflow-x:auto;scrollbar-width:thin;scrollbar-color:#bfbfbf transparent}
.oncall-list-scroll /deep/ .ant-table{min-width:920px}
.oncall-list-scroll::-webkit-scrollbar{height:6px}
.oncall-list-scroll::-webkit-scrollbar-thumb{background:#bfbfbf;border-radius:3px}
.oncall-list-scroll::-webkit-scrollbar-track{background:transparent}
</style>
