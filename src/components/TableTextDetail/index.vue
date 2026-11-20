<template>
  <div class="table-text-detail">
    <span class="table-text-summary" :title="preview">{{ preview || '—' }}</span>
    <a-button type="link" size="small" @click="visible = true">查看详情</a-button>
    <a-modal :visible="visible" :title="title" width="820px" :footer="null" @cancel="visible = false">
      <pre class="table-text-content" tabindex="0" aria-label="完整内容，可滚动查看">{{ fullText }}</pre>
    </a-modal>
  </div>
</template>
<script>
import { shortText, formatDetail } from './model'
export default {
  name: 'TableTextDetail',
  props: { content: {default: ''}, summary: {type:String,default:''}, title:{type:String,default:'详细内容'} },
  data:()=>({visible:false}),
  computed:{preview(){return shortText(this.summary || this.content)},fullText(){return formatDetail(this.content)}},
}
</script>
<style scoped>
.table-text-detail{display:flex;align-items:center;gap:8px;min-width:0;max-width:100%}
.table-text-summary{flex:1;min-width:0;display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:2;overflow:hidden;max-height:42px;line-height:21px;overflow-wrap:anywhere;white-space:normal}
.table-text-detail>.ant-btn{flex-shrink:0;padding:0;height:auto;white-space:nowrap}
.table-text-content{margin:0;max-height:55vh;overflow:auto;white-space:pre-wrap;overflow-wrap:anywhere;word-break:break-word;font-size:12px;line-height:1.6;tab-size:2}
</style>
