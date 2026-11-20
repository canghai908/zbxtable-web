<template>
  <div class="schedule-calendar">
    <div class="calendar-toolbar">
      <h4 aria-live="polite">{{ monthTitle }}</h4>
      <div class="calendar-navigation">
        <a-button size="small" class="touch-action" aria-label="上个月" icon="left" @click="navigate(-1)">上个月</a-button>
        <a-button size="small" class="touch-action" @click="$emit('month-change',today.slice(0,7))">本月</a-button>
        <a-button size="small" class="touch-action" aria-label="下个月" icon="right" @click="navigate(1)">下个月</a-button>
      </div>
    </div>
    <div class="calendar-legend" aria-label="班次来源图例">
      <span v-for="source in legend" :key="source" :class="['source-label',source]"><i aria-hidden="true" />{{ sourceLabels[source] }}</span>
      <span class="calendar-zone">{{ timezone }}</span>
    </div>
    <div class="calendar-scroll" tabindex="0" aria-label="月排班日历，周一至周日排列，点击班次或日期查看详情">
      <div class="calendar-weekdays"><strong v-for="label in weekdays" :key="label">{{ label }}</strong></div>
      <div class="calendar-grid">
        <section v-for="day in cells" :key="day.key" :class="['calendar-day',{outside:!day.inMonth,today:day.key===today}]" :aria-label="day.key">
          <header><time :datetime="day.key" :aria-label="day.key===today ? `${day.key}，今天` : day.key">{{ day.day }}</time><span v-if="day.key===today">今天</span></header>
          <template v-if="day.inMonth">
            <button v-for="(segment,index) in day.segments.slice(0,1)" :key="`${segment.start}-${index}`" type="button"
              :class="['shift',segment.source]" :title="`${range(segment)} ${names(segment.user_ids)} ${sourceLabels[segment.source] || segment.source} ${segment.reason || ''}`" @click="showDay(day,segment)">
              <span class="shift-time">{{ range(segment) }}</span>
              <strong>{{ names(segment.user_ids) }}</strong>
            </button>
            <a-button v-if="day.segments.length>1" type="link" size="small" class="more-shifts" @click="showDay(day)">另 {{ day.segments.length-1 }} 个班次</a-button>
            <span v-if="!day.segments.length" class="no-shift">暂无班次</span>
            <button v-if="day.segments.length" type="button" class="day-compact" :aria-label="`${day.key}，${day.segments.length} 个班次，点击查看详情`" @click="showDay(day)">
              <span class="compact-markers" aria-hidden="true"><i v-for="(segment,index) in day.segments.slice(0,3)" :key="index" :class="segment.source" /></span>
              <strong>{{ names(day.segments[0].user_ids) }}</strong><small>{{ day.segments.length }} 班</small>
            </button>
          </template>
        </section>
      </div>
    </div>
    <p class="calendar-help">按排班时区显示完整月份，周一为每周起点。点击日期或班次查看完整时间和原因；多班次可点“另 N 个班次”展开。</p>
    <a-modal :visible="!!selectedDay" :title="selectedDay ? `${selectedDay.key} 班次详情` : '班次详情'" width="660px" :footer="null" @cancel="selectedDay=null">
      <div v-if="selectedDay" class="day-details">
        <section v-for="(segment,index) in selectedDay.segments" :key="`${segment.start}-${index}`" :class="['shift-detail',{chosen:selectedStart===segment.start}]">
          <div><strong>{{ names(segment.user_ids) }}</strong><a-tag>{{ sourceLabels[segment.source] || segment.source }}</a-tag></div>
          <p>{{ exactTime(segment.start) }} → {{ exactTime(segment.end) }}</p>
          <p class="shift-reason" tabindex="0">{{ segment.reason || '—' }}</p>
        </section>
      </div>
    </a-modal>
  </div>
</template>
<script>
import { calendarMonthCells, shiftCalendarMonth, dateKey, segmentRange } from './calendar'
import { ids, sourceLabels } from './model'
export default {
  props:{slots:{type:Array,default:()=>[]},timezone:{type:String,default:'Asia/Shanghai'},users:{type:Array,default:()=>[]},month:{type:String,default:''}},
  data:()=>({sourceLabels,legend:['rotation','override','fallback','uncovered'],weekdays:['周一','周二','周三','周四','周五','周六','周日'],selectedDay:null,selectedStart:null}),
  computed:{
    activeMonth(){return this.month || dateKey(this.slots.length?this.slots[0].start:new Date(),this.timezone).slice(0,7)},
    monthTitle(){const [year,month]=this.activeMonth.split('-');return `${year} 年 ${Number(month)} 月`},
    cells(){return calendarMonthCells(this.slots,this.timezone,this.activeMonth)},
    today(){return dateKey(new Date(),this.timezone)},
  },
  watch:{slots(){this.selectedDay=null},timezone(){this.selectedDay=null},month(){this.selectedDay=null}},
  methods:{
    navigate(offset){this.$emit('month-change',shiftCalendarMonth(this.activeMonth,offset))},
    range(segment){return segmentRange(segment,this.timezone)},
    showDay(day,segment){this.selectedDay=day;this.selectedStart=segment?segment.start:null},
    names(value){return ids(value).map(id=>{const u=this.users.find(u=>u.id===id);return u?u.username:`用户 #${id}`}).join('、')||'无人 / 空班'},
    exactTime(value){return new Intl.DateTimeFormat('zh-CN',{timeZone:this.timezone,year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23',timeZoneName:'short'}).format(new Date(value))},
  },
}
</script>
<style scoped>
.calendar-toolbar{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:8px}.calendar-toolbar h4{margin:0;font-size:16px}.calendar-navigation{display:flex;gap:4px}.calendar-toolbar{flex-wrap:wrap}
.calendar-legend{display:flex;flex-wrap:wrap;align-items:center;gap:8px 16px;margin-bottom:8px;font-size:12px}.source-label{display:inline-flex;align-items:center;gap:4px}.source-label i{width:8px;height:8px;border-radius:2px;background:#1677b8}.override i{background:#389e0d}.fallback i{background:#d48806}.uncovered i{background:#8c8c8c}.calendar-zone{margin-left:auto;color:var(--ops-muted,rgba(0,0,0,.65))}
.calendar-scroll{overflow-x:auto;scrollbar-width:thin;scrollbar-color:#bfbfbf transparent;border:1px solid rgba(128,128,128,.24);border-radius:4px}
.calendar-scroll::-webkit-scrollbar{height:6px}.calendar-scroll::-webkit-scrollbar-thumb{background:#bfbfbf;border-radius:3px}.calendar-scroll::-webkit-scrollbar-track{background:transparent}
.calendar-weekdays,.calendar-grid{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));min-width:0}
.calendar-weekdays{background:rgba(128,128,128,.05);border-bottom:1px solid rgba(128,128,128,.2)}.calendar-weekdays strong{text-align:center;padding:5px 4px;font-size:12px;font-weight:500}
.calendar-day{min-width:0;height:clamp(76px,10vh,88px);border-right:1px solid rgba(128,128,128,.18);border-bottom:1px solid rgba(128,128,128,.18);overflow:hidden}.calendar-day:nth-child(7n){border-right:0}.calendar-day:nth-last-child(-n+7){border-bottom:0}
.calendar-day header{display:flex;align-items:center;justify-content:space-between;gap:4px;padding:2px 6px;font-size:12px;height:20px}.calendar-day header time{font-weight:600}.calendar-day header span{font-size:11px}.calendar-day.outside{background:rgba(128,128,128,.04);color:var(--ops-muted,rgba(0,0,0,.65))}.calendar-day.today header{background:rgba(22,119,184,.1);color:var(--ops-text,rgba(0,0,0,.85))}
.shift{display:flex;flex-direction:column;gap:0;width:calc(100% - 10px);margin:2px 5px;padding:2px 4px;text-align:left;cursor:pointer;border:1px solid rgba(22,119,184,.24);border-radius:3px;background:rgba(22,119,184,.06);color:inherit;font:inherit;font-size:12px;overflow:hidden;line-height:13px}
.shift.override{border-color:rgba(56,158,13,.3);background:rgba(56,158,13,.07)}.shift.fallback{border-color:rgba(212,136,6,.35);background:rgba(212,136,6,.08)}.shift.uncovered,.shift.gap,.shift.disabled,.shift.error{border-style:dashed;border-color:rgba(128,128,128,.5);background:rgba(128,128,128,.06)}
.shift:hover{box-shadow:inset 0 0 0 1px currentColor}.shift:focus-visible{outline:2px solid currentColor;outline-offset:-2px}.shift-time,.shift strong{display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.shift-time{font-variant-numeric:tabular-nums;font-size:11px}
.more-shifts{height:18px;line-height:18px;font-size:11px;margin:0 5px;padding:0;max-width:calc(100% - 10px)}.no-shift{display:block;padding:6px 8px;color:var(--ops-muted,rgba(0,0,0,.65));font-size:11px}.calendar-help{font-size:12px;color:var(--ops-muted,rgba(0,0,0,.65));margin:8px 0 0}
.day-details{max-height:60vh;overflow:auto}.shift-detail{border:1px solid rgba(128,128,128,.25);border-radius:4px;padding:12px;margin-bottom:8px;overflow-wrap:anywhere}.shift-detail.chosen{border-color:var(--ops-text,rgba(0,0,0,.85))}.shift-detail>div{display:flex;align-items:center;justify-content:space-between;gap:8px}.shift-detail p{margin:8px 0 0}.shift-reason{max-height:140px;overflow:auto;white-space:pre-wrap}
.day-compact{display:none}
@media(max-width:575px), (pointer:coarse){
 .calendar-zone{margin-left:0}.calendar-toolbar h4{font-size:14px}.calendar-weekdays strong{font-size:11px;padding:8px 2px}
 .calendar-day{height:76px}.calendar-day header{padding:3px;height:20px;font-size:11px}.calendar-day header span{display:none}
 .shift,.more-shifts,.no-shift{display:none}
 .day-compact{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;width:calc(100% - 4px);min-height:48px;margin:2px;padding:3px 1px;border:0;background:rgba(128,128,128,.04);border-radius:3px;color:inherit;cursor:pointer;font:inherit;line-height:16px}
 .day-compact strong{font-size:12px;width:100%;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-weight:500}.day-compact small{font-size:11px;line-height:14px;color:var(--ops-muted,rgba(0,0,0,.65))}
 .compact-markers{display:flex;gap:2px;min-height:8px;align-items:center}.compact-markers i{width:5px;height:5px;border-radius:50%;background:#1677b8}.compact-markers .override{background:#389e0d}.compact-markers .fallback{background:#d48806}.compact-markers .uncovered,.compact-markers .gap,.compact-markers .disabled{background:#8c8c8c}
 .day-compact:focus-visible{outline:2px solid currentColor;outline-offset:-2px}
}
</style>
