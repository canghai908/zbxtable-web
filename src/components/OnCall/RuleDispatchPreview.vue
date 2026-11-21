<template>
  <a-collapse @change="clear">
    <a-collapse-panel key="preview" header="测试分发接收人（不会发送通知）">
      <a-alert type="info" message="按指定时间和实例模拟当前规则，解析排班及兜底人员；通知重试使用入队时接收人。" show-icon style="margin-bottom:8px" />
      <div class="preview-inputs"><label>分发时间<a-date-picker v-model="at" show-time style="width:100%" /></label><label>实例<a-select v-model="zid" style="width:100%"><a-select-option v-for="instance in instances" :key="instance.id" :value="instance.id">{{ instance.name }}</a-select-option></a-select></label><label v-for="field in fields" :key="field.value">{{ field.label }}<a-input v-model="sample[field.value]" /></label></div>
      <a-button type="primary" :loading="loading" @click="run">测试分发</a-button>
      <a-alert v-if="error" type="error" :message="error" show-icon style="margin-top:8px" />
      <template v-if="result"><a-alert :type="result.matched ? 'success' : 'info'" :message="result.matched ? '规则匹配' : '规则未匹配'" :description="result.reason" style="margin-top:8px" /><div v-for="channel in result.channels || []" :key="channel.channel" class="channel-result"><strong>{{ channelNames[channel.channel] || channel.channel }}</strong><a-tag v-if="channel.muted" color="orange">已被屏蔽</a-tag><p>接收人：{{ names(channel.user_ids) }}</p><div v-for="(schedule,index) in channel.schedules || []" :key="`${schedule.schedule_id}-${index}`"><a-tag>{{ scheduleName(schedule.schedule_id) }}</a-tag>{{ sourceLabels[schedule.source] || schedule.source }} · {{ names(schedule.user_ids) }}<span v-if="schedule.reason"> · {{ schedule.reason }}</span></div></div></template>
    </a-collapse-panel>
  </a-collapse>
</template>
<script>
import moment from 'moment'
import { fields } from '@/components/RuleConditions/model'
import { ids, rulePayload, sourceLabels } from './model'
import { rulePreview } from '@/services/admin'
export default {
  props: { rule:{type:Object,required:true}, users:{type:Array,default:()=>[]}, schedules:{type:Array,default:()=>[]}, instances:{type:Array,default:()=>[]} },
  data:()=>({fields,sourceLabels,at:moment(),zid:undefined,sample:{host:'',group:'',item:'',key:'',trigger:'',severity:''},loading:false,error:'',result:null,sequence:0,channelNames:{mail:'邮件',wechat:'企业微信',wechat_robot:'企业微信群机器人',dingtalk_robot:'钉钉群机器人',feishu_robot:'飞书群机器人',webhook:'自定义Webhook'}}),
  watch:{rule:{deep:true,handler(){this.clear()}},sample:{deep:true,handler(){this.clear()}},at(){this.clear()},zid(){this.clear()}},
  methods:{
    clear(){this.sequence++;this.result=null;this.error=''},
    names(value){return ids(value).map(id=>{const u=this.users.find(u=>u.id===id);return u?u.username:`用户 #${id}`}).join('、')||'无可用接收人'},
    scheduleName(id){const s=this.schedules.find(s=>s.id===id);return s?s.name:`排班 #${id}`},
    async run(){this.clear();const sequence=this.sequence;if(!this.at||!this.zid){this.error='请选择测试时间和实例';return}this.loading=true;try{const response=await rulePreview({rule:rulePayload(this.rule),at:this.at.toISOString(),zid:this.zid,data:{...this.sample}});if(sequence!==this.sequence)return;if(response.data.code!==200)throw new Error(response.data.message||'测试失败');this.result=response.data.data}catch(e){if(sequence===this.sequence)this.error=e.message||'测试失败'}finally{this.loading=false}},
  },
}
</script>
<style scoped>
.preview-inputs{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;margin-bottom:8px}
.preview-inputs label{display:block;min-width:0;font-weight:normal}
.channel-result{border-top:1px solid #ddd;padding-top:8px;margin-top:8px;overflow-wrap:anywhere}
.channel-result p{margin:4px 0}
@media(max-width:575px){.preview-inputs{grid-template-columns:minmax(0,1fr)}}
</style>
