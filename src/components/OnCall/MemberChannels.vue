<template>
  <section class="member-channels" aria-label="成员通知渠道检查">
    <div class="channel-summary"><strong>通知渠道配置</strong><span v-for="channel in channels" :key="channel.key">{{ channel.label }} {{ configuredCount(channel.key) }}/{{ rows.length }}</span></div>
    <p class="channel-help">仅检查账号启用及地址配置，不代表投递成功；实际通知渠道由分发规则决定。缺少地址时可使用已配置的排班兜底。</p>
    <a-collapse v-if="rows.length">
      <a-collapse-panel key="members" :header="`查看 ${rows.length} 名人员的渠道配置`">
        <div class="channel-scroll" tabindex="0" aria-label="人员渠道配置，可滚动查看">
          <table><thead><tr><th>人员</th><th>身份</th><th v-for="channel in channels" :key="channel.key">{{ channel.label }}</th></tr></thead>
            <tbody><tr v-for="row in rows" :key="row.id"><td><span class="channel-name" :title="row.username">{{ row.username }}</span><small v-if="row.disabled">{{ row.missing ? '用户不存在' : '已禁用' }}</small></td><td>{{ row.role }}</td><td v-for="channel in channels" :key="channel.key"><span :class="{'channel-missing':!row.channels[channel.key]}">{{ row.channels[channel.key] ? '已配置' : '未配置' }}</span></td></tr></tbody>
          </table>
        </div>
      </a-collapse-panel>
    </a-collapse>
    <p v-else class="channel-help">选择轮班或备用人员后显示检查结果</p>
  </section>
</template>
<script>
import { ids } from './model'
export default {
  name:'MemberChannels',
  props:{users:{type:Array,default:()=>[]},members:{type:Array,default:()=>[]},fallbackUserIds:{type:Array,default:()=>[]}},
  data:()=>({channels:[{key:'mail',label:'邮件'},{key:'wechat',label:'企业微信'},{key:'wechat_robot',label:'企微机器人'},{key:'dingtalk_robot',label:'钉钉机器人'},{key:'feishu_robot',label:'飞书机器人'},{key:'webhook',label:'Webhook'}]}),
  computed:{
    rows(){
      const members=ids(this.members),fallback=ids(this.fallbackUserIds)
      return ids([...members,...fallback]).map(id=>{
        const user=this.users.find(user=>user.id===id)
        return {id,username:user?user.username:`用户 #${id}`,missing:!user,disabled:!user||Number(user.status)!==0,channels:user&&user.channels||{},role:[members.includes(id)?'轮班':'',fallback.includes(id)?'备用':''].filter(Boolean).join(' / ')}
      })
    },
  },
  methods:{configuredCount(channel){return this.rows.filter(row=>!row.disabled&&row.channels[channel]).length}},
}
</script>
<style lang="less" scoped>
.member-channels{min-width:0}.channel-summary{display:flex;flex-wrap:wrap;gap:4px 12px;font-size:12px}.channel-summary strong{font-weight:500}.channel-help{font-size:12px;color:var(--ops-muted,rgba(0,0,0,.65));margin:4px 0 8px}.channel-scroll{max-height:176px;overflow:auto}.channel-scroll table{width:100%;min-width:640px;table-layout:fixed;font-size:12px}.channel-scroll th,.channel-scroll td{text-align:left;padding:6px 8px;border-bottom:1px solid @border-color-split;vertical-align:top}.channel-scroll th{position:sticky;top:0;background:@component-background;font-weight:500}.channel-scroll td:first-child,.channel-scroll th:first-child{width:28%}.channel-name{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.channel-scroll small{display:block;color:var(--ops-muted,rgba(0,0,0,.65))}.channel-missing{color:var(--ops-muted,rgba(0,0,0,.65))}
</style>
