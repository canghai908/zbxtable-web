<template>
  <page-layout :noTitle="true">
    <a-form-model class="home-search" layout="inline" :colon='false'>
      <a-form-model-item :label="$t('label_search')">
        <a-input v-model.trim="hosts" :placeholder="$t('label_hostname')" />
      </a-form-model-item>
      <a-form-model-item label="IP">
        <a-input v-model.trim="hostIp" :placeholder="$t('label_host_ip')" />
      </a-form-model-item>
      <a-form-model-item :label="$t('label_select_instance')">
        <a-select v-model="selectedInstance" :placeholder="$t('label_all_instances')" allowClear style="width: 200px">
          <a-select-option value="">{{ $t('label_all_instances') }}</a-select-option>
          <a-select-option v-for="item in instanceList" :key="item.id" :value="item.id">
            {{ item.name }}
          </a-select-option>
        </a-select>
      </a-form-model-item>
      <a-form-model-item :label="$t('label_alarm_type')">
        <a-select optionFilterProp="label" style="width:100px" v-model="status" option-label-prop="label" @change="handleStatusChange">
          <a-select-option v-for="(item, index) in statuslist" :key="index" :value="item.id" :label="item.value" :title="item.value">
            {{ item.value }}
          </a-select-option>
        </a-select>
      </a-form-model-item>
      <a-form-model-item :label="$t('label_alarm_level')">
        <a-select optionFilterProp="label" style="width:100px" v-model="level" option-label-prop="label" @change="handleLevelChange">
          <a-select-option v-for="(item, index) in levellist" :key="index" :value="item.id" :label="item.value" :title="item.value">
            {{ item.value }}
          </a-select-option>
        </a-select>
      </a-form-model-item>
      <a-form-model-item :label="$t('label_creation_time')">
        <a-range-picker format="YYYY-MM-DD HH:mm:ss" :show-time="{ format: 'HH:mm', defaultValue:[moment('00:00:00', 'HH:mm:ss'),moment('23:59:59', 'HH:mm:ss')]}" v-model="timeValue"
          @change="changeCreationTime" :getCalendarContainer="triggerNode=>{return triggerNode.parentNode || document.body}" />
      </a-form-model-item>
      <a-form-model-item>
        <a-button type="primary" @click="init">{{ $t('btn_query') }}</a-button>
        <a-button style="margin-left: 10px;" @click="resetData">{{ $t('btn_reset') }}</a-button>
        <a-button style="margin-left: 10px;" type="primary" @click="anayexport">{{ $t('btn_export') }}</a-button>
      </a-form-model-item>
    </a-form-model>

    <div class="linux-list">
      <a-table :loading="loading" :columns="columns" :data-source="list" @expand="getEvent" @change="changePage" :pagination="pagination" :rowKey="(record) => { return record.id;}">
        <!-- 主表格的插槽 -->
        <div slot="instance_name" slot-scope="record">
          <a-tag :color="themeColor">{{getInstanceName(record.zid)}}</a-tag>
        </div>
        <div slot="status" slot-scope="record">
          <a-tag v-if="record.status==0" color="#87d068">{{ $t('alarm_type_recovery') }}</a-tag>
          <a-tag v-else-if="record.status==1" color="#f50">{{ $t('alarm_type_alarm') }}</a-tag>
        </div>
        <div slot="level" slot-scope="record">
          <a-tag v-if="record.level==0" color="#97AAB3">{{ $t('level_unclassified') }}</a-tag>
          <a-tag v-else-if="record.level==1" color=" #7499FF">{{ $t('level_information') }}</a-tag>
          <a-tag v-else-if="record.level==2" color="#FFC859">{{ $t('level_warning') }}</a-tag>
          <a-tag v-else-if="record.level==3" color="#FFA059">{{ $t('level_average') }}</a-tag>
          <a-tag v-else-if="record.level==4" color="#E97659">{{ $t('level_high') }}</a-tag>
          <a-tag v-else-if="record.level==5" color="#f50000">{{ $t('level_disaster') }}</a-tag>
        </div>
        <span slot="occur_time" slot-scope="record">{{ record.occur_time | parsetime }}</span>
        <span slot="notify_status" slot-scope="record">
          <a-badge v-if="record.notify_status==0" status="success"></a-badge>
          <a-badge v-else-if="record.notify_status==1" status="default"></a-badge>
          <a-badge v-else-if="record.notify_status==2" status="processing"></a-badge>
          <template v-if="record.notify_status==0">{{ $t('notify_status_notified') }}</template>
          <template v-else-if="record.notify_status==1">{{ $t('notify_status_muted') }}</template>
          <template v-else-if="record.notify_status==2">{{ $t('notify_status_default_rule') }}</template>
        </span>
        <span slot="operation" slot-scope="record">
          <a-button v-if="record.notify_status!=1" class="pd20 paddingleft0" type="link" size="small" @click="addMutes(record)">{{ $t('btn_mute') }}</a-button>
          <a-button class="pd20" type="link" size="small" @click="analyzeWithDeepseek(record)">{{ $t('btn_ai_analysis') }}</a-button>
        </span>
        
        <!-- 展开行的嵌套表格 -->
        <a-table slot="expandedRowRender" slot-scope="record" :columns="innerColumns" :data-source="(record && record.innerData) ? record.innerData : []" :loading="record ? record.innerLoading : false" :pagination="false" :rowKey="(r) => r.id || r.notify_time || r.rule + '-' + r.user + '-' + r.channel">
          <span slot="channel" slot-scope="text">{{ formatChannel(text) }}</span>
          <span slot="notify_time" slot-scope="record">{{ record.notify_time | parsetime }}</span>
          <span slot="status" slot-scope="record">
            <a-badge v-if="record.status==0" status="success"></a-badge>
            <a-badge v-else-if="record.status==1" status="error"></a-badge>
            <a-badge v-else-if="record.status==2" status="processing"></a-badge>
            <template v-if="record.status==0">{{ $t('notify_result_delivered') }}</template>
            <template v-else-if="record.status==1">{{ $t('notify_result_failed') }}</template>
          </span>
        </a-table>
      </a-table>
    </div>

    <!-- AI 助手 Drawer -->
    <a-drawer
      :title="$t('drawer_title_ai_chat')"
      placement="right"
      :closable="true"
      :visible="aiDrawerVisible"
      :width="720"
      @close="handleDrawerClose"
      :bodyStyle="{ padding: 0, height: 'calc(100vh - 55px)', overflow: 'hidden' }">
      
      <div class="ai-chat-container">
        <!-- 告警上下文信息 -->
        <div v-if="currentAlarmContext" class="alarm-context">
          <a-alert :message="$t('chat_alarm_context')" type="info" show-icon closable @close="currentAlarmContext = null">
            <template slot="description">
              <div class="context-content">
                <div><strong>{{ $t('col_device_name') }}:</strong> {{ currentAlarmContext.hostname }}</div>
                <div><strong>{{ $t('col_ip') }}:</strong> {{ currentAlarmContext.host_ip }}</div>
                <div><strong>{{ $t('col_alarm_description') }}:</strong> {{ currentAlarmContext.message }}</div>
              </div>
            </template>
          </a-alert>
        </div>

        <!-- 聊天消息区域 -->
        <div class="chat-messages" ref="chatMessages">
          <div v-for="(msg, index) in chatMessages" :key="index" :class="['chat-message', msg.role]">
            <div class="message-header">
              <a-avatar :size="32" :style="{ backgroundColor: msg.role === 'user' ? '#1890ff' : '#52c41a' }">
                <a-icon :type="msg.role === 'user' ? 'user' : 'robot'" />
              </a-avatar>
              <span class="message-sender">{{ msg.role === 'user' ? $t('chat_user') : $t('chat_assistant') }}</span>
              <span class="message-time">{{ msg.time }}</span>
            </div>
            <div class="message-content">
              <div v-if="msg.role === 'assistant'" class="markdown-body" v-html="msg.formattedContent"></div>
              <div v-else class="user-message">{{ msg.content }}</div>
            </div>
          </div>
          
          <!-- 正在输入指示器 -->
          <div v-if="isTyping" class="chat-message assistant typing-indicator">
            <div class="message-header">
              <a-avatar :size="32" :style="{ backgroundColor: '#52c41a' }">
                <a-icon type="robot" />
              </a-avatar>
              <span class="message-sender">{{ $t('chat_assistant') }}</span>
            </div>
            <div class="message-content">
              <div class="typing-dots">
                <span></span><span></span><span></span>
              </div>
            </div>
          </div>
        </div>

        <!-- 输入区域 -->
        <div class="chat-input-area">
          <div class="input-actions">
            <a-button size="small" @click="clearChat" icon="delete">{{ $t('chat_clear') }}</a-button>
          </div>
          <div class="input-wrapper">
            <a-textarea
              v-model="chatInput"
              :placeholder="$t('chat_input_placeholder')"
              :auto-size="{ minRows: 1, maxRows: 4 }"
              @pressEnter="handleSendMessage"
              :disabled="isTyping"
            />
            <a-button v-if="isTyping" type="danger" @click="stopGeneration">
              <a-icon type="stop" /> {{ $t('chat_stop') }}
            </a-button>
            <a-button v-else type="primary" @click="handleSendMessage" :disabled="!chatInput.trim()">
              <a-icon type="send" /> {{ $t('chat_send') }}
            </a-button>
          </div>
        </div>
      </div>
    </a-drawer>
  </page-layout>
</template>

<script>
import PageLayout from "@/layouts/PageLayout";
import { alarm, alarmExport, eventLogGet, alarmDeepseekAnalysis } from "@/services/admin";
import { listZabbixInstance } from '@/services/zabbix'
import { parseTimeFun } from "@/utils/formatter";
import { reduce } from "lodash";
import moment from "moment";
import "moment/locale/zh-cn";
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import hljs from 'highlight.js';  // 添加代码高亮库
import themeMixin from '@/mixins/themeMixin'

// 配置 marked 选项
marked.setOptions({
  gfm: true,
  breaks: true,
  headerIds: false,
  mangle: false,
  // 添加代码高亮配置
  highlight: function(code, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return hljs.highlight(code, { language: lang }).value;
      } catch (e) {
        console.error(e);
      }
    }
    return code;  // 使用普通代码块
  }
});

// 自定义 marked 渲染器来处理 think 标签
const renderer = new marked.Renderer();
const originalParagraph = renderer.paragraph.bind(renderer);

renderer.paragraph = (text) => {
  // 修改正则表达式以更准确地匹配 think 标签
  const thinkRegex = /<think>([\s\S]*?)<\/think>/g;
  if (text.match(thinkRegex)) {
    text = text.replace(thinkRegex, (match, content) => {
      return '\n> 思考过程：' + content.trim() + '\n';
    });
  }
  return originalParagraph(text);
};

// 修改处理 think 标签的函数
function processThinkTags(text) {
  // 使用非贪婪模式匹配整个 think 标签块
  const thinkRegex = /<think>([\s\S]*?)<\/think>/g;
  let processedText = text;
  
  // 将所有 think 标签内容替换为引用格式
  processedText = processedText.replace(thinkRegex, (match, content) => {
    // 处理多行内容，每行都添加引用符号
    const quotedContent = content
      .split('\n')
      .map(line => '> ' + line.trim())
      .join('\n');
    
    // 添加思考过程标题
    return '\n> **思考过程**\n' + quotedContent + '\n';
  });

  return processedText;
}

export default {
  i18n: require('./i18n'),
  name: "LinuxList",
  mixins: [themeMixin],
  components: {
    PageLayout,
  },
  data() {
    return {
      page: 1,
      pageSize: 10,
      loading: false,
      instanceList: [],
      instanceMap: {},
      selectedInstance: '',
      status: "",
      level: "",
      statuslist: [],
      levellist: [],
      columns: [],
      innerColumns: [],
      // tenantlist/tenantid 已取消：跟随“当前 Zabbix 连接”
      list: [],
      pagination: {
        total: 0,
        current: 1,
        "show-quick-jumper": true,
        "page-size-options": ["10", "20", "30", "40", "50", "100", "200"],
        pageSize: 10,
        "show-size-changer": true,
        "show-total": (total) => this.$t('pagination_total', { total }),
      },
      moment,
      // 兼容旧字段（不再参与请求）
      tenantid: "",
      hosts: "",
      timeValue: null,
      beginTime: "",
      endTime: "",
      aiDrawerVisible: false,
      isTyping: false,
      chatInput: '',
      chatMessages: [],
      currentAlarmContext: null,
      abortController: null,
      currentRequestId: null,
      hostIp: "",
    };
  },
  created() {
    let ntime = new Date(),
      qtime = new Date(new Date().getTime() - 7 * 24 * 60 * 60 * 1000);
    this.beginTime = parseTimeFun(qtime);
    this.endTime = parseTimeFun(ntime);
    this.timeValue = [
      moment(qtime, "YYYY-MM-DD HH:mm:ss"),
      moment(ntime, "YYYY-MM-DD HH:mm:ss"),
    ];
    this.initOptions();
    this.initColumns();
    this.loadInstances();
    this.init();
  },
  methods: {
    initOptions() {
      this.statuslist = [
        { id: 1, value: this.$t('alarm_type_alarm') },
        { id: 0, value: this.$t('alarm_type_recovery') }
      ];
      this.levellist = [
        { id: 0, value: this.$t('level_unclassified') },
        { id: 1, value: this.$t('level_information') },
        { id: 2, value: this.$t('level_warning') },
        { id: 3, value: this.$t('level_average') },
        { id: 4, value: this.$t('level_high') },
        { id: 5, value: this.$t('level_disaster') },
      ];
    },
    initColumns() {
      this.columns = [
        { title: this.$t('col_id'), dataIndex: "id", align: "left" },
        { title: this.$t('col_instance'), key: "instance_name", align: "left", width: 120, scopedSlots: { customRender: "instance_name" } },
        { title: this.$t('col_alarm_type'), key: "status", align: "left", scopedSlots: { customRender: "status" } },
        { title: this.$t('col_device_name'), dataIndex: "hostname", align: "left" },
        { title: this.$t('col_ip'), dataIndex: "host_ip", align: "left" },
        { title: this.$t('col_alarm_level'), key: "level", align: "left", scopedSlots: { customRender: "level" } },
        { title: this.$t('col_alarm_description'), dataIndex: "message", align: "left" },
        { title: this.$t('col_alarm_detail'), dataIndex: "detail", align: "left" },
        { title: this.$t('col_occurrence_time'), key: "occur_time", align: "left", scopedSlots: { customRender: "occur_time" } },
        { title: this.$t('col_notification_status'), key: "notify_status", align: "left", scopedSlots: { customRender: "notify_status" } },
        { title: this.$t('col_operation'), key: "operation", align: "center", scopedSlots: { customRender: "operation" } },
      ];
      this.innerColumns = [
        { title: this.$t('col_rule_name'), dataIndex: "rule", align: "left" },
        { title: this.$t('col_alarm_channel'), dataIndex: "channel", align: "left", scopedSlots: { customRender: "channel" } },
        { title: this.$t('col_receiving_user'), dataIndex: "user", align: "left" },
        { title: this.$t('col_receiving_account'), dataIndex: "account", align: "left" },
        { title: this.$t('col_notification_time'), key: "notify_time", align: "left", scopedSlots: { customRender: "notify_time" } },
        { title: this.$t('col_notification_content'), dataIndex: "notify_content", align: "left", width: "300px", ellipsis: true },
        { title: this.$t('col_notification_result'), key: "status", align: "left", scopedSlots: { customRender: "status" } },
        { title: this.$t('col_error_message'), dataIndex: "notify_error", align: "left", width: "300px", ellipsis: true },
      ];
    },
    loadInstances() {
      listZabbixInstance().then((resp) => {
        let res = resp.data
        if (res.code == 200) {
          const allItems = Array.isArray(res.data) ? res.data : []
          this.instanceList = allItems.filter(item => item.enabled)
          // 创建 ZID 到实例名称的映射
          this.instanceMap = {}
          this.instanceList.forEach(item => {
            this.instanceMap[item.id] = item.name
          })
        }
      }).catch(err => {
        console.error(this.$t('msg_load_instances_failed'), err)
      })
    },
    getInstanceName(zid) {
      if (!zid) return this.$t('msg_unknown')
      return this.instanceMap[zid] || this.$t('msg_unknown')
    },
    formatChannel(channel) {
      const key = String(channel || '').trim().toLowerCase()
      const channelMap = {
        mail: this.$t('channel_mail'),
        wechat: this.$t('channel_wechat'),
        wechat_robot: this.$t('channel_wechat_robot'),
        dingding: this.$t('channel_dingding'),
        sms: this.$t('channel_sms'),
      }
      return channelMap[key] || channel || this.$t('msg_unknown')
    },
    init() {
      this.loading = true;
      let req = {
        page: this.page, limit: this.pageSize,
        hosts: this.hosts,
        status: this.status, level: this.level,
        host_ip: this.hostIp,
        order: "desc",  // 使用 order 参数来指定降序排列
        order_by: "id"  // 按 ID 降序，确保最新数据在最前
      };
      if (this.selectedInstance) {
        req.zid = this.selectedInstance;
      }
      if (this.beginTime) {
        req.begin = this.beginTime;
        req.end = this.endTime;
      }
      alarm(req).then((resp) => {
        let res = resp.data;
        if (res.code == 200) {
          this.pagination.total = res.data.total;
          this.pagination.current = this.page;
          this.pagination.pageSize = this.pageSize;
          this.list = res.data.items || [];
        }
      }).finally(() => {
        this.loading = false;
      });
      // alarmTenantGet 已不再需要
    },

    handleStatusChange(value) {
      this.status = value
    },
    handleLevelChange(value) {
      this.level = value
    },
    addMutes(record) {
      console.log(record)
      this.$router.push("/alarm/mutes?hostid=" + record.host_id + '&tenantid=' + record.zid +
        '&host=' + record.host + '&message=' + record.message)
    },
    //导出excel
    anayexport() {
      alarmExport(
        {
          begin: this.beginTime, end: this.endTime,
          hosts: this.hosts,
          status: this.status, level: this.level,
          host_ip: this.hostIp,
          zid: this.selectedInstance,
        },
        {
          responseType: "arraybuffer",
        }
      ).then((resp) => {
        let filename = resp.headers["content-disposition"]
          .split(";")
          .find((n) => n.includes("filename="))
          .replace("filename=", "")
          .trim();
        const url = window.URL.createObjectURL(new Blob([resp.data]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", filename);
        document.body.appendChild(link);
        link.click();
      });
    },
    changePage(e) {
      // 切换页码
      this.page = e.current;
      this.pageSize = e.pageSize;
      this.init();
    },
    changeCreationTime(e) {
      if (e.length) {
        this.beginTime = parseTimeFun(new Date(e[0]));
        this.endTime = parseTimeFun(new Date(e[1]));
      } else {
        this.beginTime = "";
        this.endTime = "";
      }
    },
    resetData() {
      this.hosts = "";
      this.status = "";
      this.level = "";
      this.hostIp = "";
      this.selectedInstance = "";
      this.init();
    },
    getEvent(exp, record) {
      console.log(exp, record)
      if (!exp) {
        return
      }

      if (record.innerData && record.innerData.length) {
        return
      }

      this.$set(record, 'innerLoading', true)
      eventLogGet(record.id).then((resp) => {
        let res = resp.data;
        if (res.code == 200) {
          this.$set(record, 'innerData', res.data.items || [])
        }
      }).finally(() => {
        this.$set(record, 'innerLoading', false)
      })
    },
    // 打开 AI 助手分析
    analyzeWithDeepseek(record) {
      // 打开 Drawer
      this.aiDrawerVisible = true;
      
      // 设置告警上下文
      this.currentAlarmContext = {
        hostname: record.hostname,
        host_ip: record.host_ip,
        message: record.message,
        detail: record.detail,
        level: record.level,
        status: record.status
      };
      
      // 如果是首次打开或者聊天记录为空，自动发送初始分析请求
      if (this.chatMessages.length === 0) {
        this.chatInput = this.$t('msg_analysis_prompt');
        this.$nextTick(() => {
          this.handleSendMessage();
        });
      }
    },
    
    // 发送消息
    handleSendMessage(e) {
      // 如果是按 Enter 键且没有按 Shift，则发送消息
      if (e && e.shiftKey) {
        return;
      }
      if (e) {
        e.preventDefault();
      }
      
      const message = this.chatInput.trim();
      if (!message || this.isTyping) {
        return;
      }
      
      // 添加用户消息
      const userMessage = {
        role: 'user',
        content: message,
        time: this.formatTime(new Date())
      };
      this.chatMessages.push(userMessage);
      
      // 清空输入框
      this.chatInput = '';
      
      // 滚动到底部
      this.$nextTick(() => {
        this.scrollToBottom();
      });
      
      // 发送到 AI
      this.sendToAI(message);
    },
    
    // 发送到 AI
    sendToAI(userMessage) {
      this.isTyping = true;
      
      // 确保上一个请求被取消
      if (this.abortController) {
        this.abortController.abort();
        this.abortController = null;
      }
      
      // 生成新的请求ID
      this.currentRequestId = Date.now().toString();
      
      // 创建新的 AbortController
      this.abortController = new AbortController();
      
      // 构建完整的消息（包含告警上下文）
      let fullMessage = userMessage;
      if (this.currentAlarmContext) {
        fullMessage = `${this.$t('chat_alarm_context')}:\n` +
          `${this.$t('col_device_name')}: ${this.currentAlarmContext.hostname}\n` +
          `${this.$t('col_ip')}: ${this.currentAlarmContext.host_ip}\n` +
          `${this.$t('col_alarm_description')}: ${this.currentAlarmContext.message}\n` +
          `${this.$t('col_alarm_detail')}: ${this.currentAlarmContext.detail}\n\n` +
          `${userMessage}`;
      }
      
      // 创建 AI 消息占位符
      const aiMessageIndex = this.chatMessages.length;
      this.chatMessages.push({
        role: 'assistant',
        content: '',
        formattedContent: '',
        time: this.formatTime(new Date())
      });
      
      let analysisTimeout = null;
      
      const analysisData = {
        message: fullMessage,
        requestId: this.currentRequestId,
        onProgress: (text, responseRequestId) => {
          try {
            // 检查响应是否属于当前请求
            if (responseRequestId === this.currentRequestId && text && text.trim()) {
              if (analysisTimeout) {
                clearTimeout(analysisTimeout);
              }
              if (this.aiDrawerVisible) {
                // 更新 AI 消息内容
                this.chatMessages[aiMessageIndex].content = text;
                try {
                  const processedText = processThinkTags(text);
                  const htmlContent = marked(processedText, { renderer });
                  this.chatMessages[aiMessageIndex].formattedContent = DOMPurify.sanitize(htmlContent);
                } catch (parseError) {
                  console.error('Markdown parse error:', parseError);
                  this.chatMessages[aiMessageIndex].formattedContent = text;
                }
                
                // 滚动到底部
                this.$nextTick(() => {
                  this.scrollToBottom();
                });
              }
            }
          } catch (error) {
            console.error('Progress callback error:', error);
          }
        },
        signal: this.abortController.signal
      };

      // 设置总体超时处理
      analysisTimeout = setTimeout(() => {
        if (this.isTyping) {
          this.isTyping = false;
          this.chatMessages[aiMessageIndex].content = this.$t('msg_analysis_timeout');
          this.chatMessages[aiMessageIndex].formattedContent = this.$t('msg_analysis_timeout');
          this.$message.warning(this.$t('msg_analysis_timeout'));
        }
      }, 360000); // 6分钟总体超时

      // 调用 AI API
      alarmDeepseekAnalysis(analysisData)
        .then(() => {
          clearTimeout(analysisTimeout);
          this.isTyping = false;
        })
        .catch(error => {
          clearTimeout(analysisTimeout);
          this.isTyping = false;
          
          // 如果是用户主动取消，不显示错误信息
          if (error.name === 'AbortError') {
            return;
          }
          
          let errorMsg = this.$t('msg_unknown_error');
          if (error.code === 'ECONNABORTED') {
            errorMsg = this.$t('msg_request_timeout');
          } else if (error.response) {
            errorMsg = error.response.data?.message || error.message;
          } else if (error.message) {
            errorMsg = error.message;
          }
          
          this.chatMessages[aiMessageIndex].content = this.$t('msg_analysis_failed') + ': ' + errorMsg;
          this.chatMessages[aiMessageIndex].formattedContent = this.$t('msg_analysis_failed') + ': ' + errorMsg;
          this.$message.error(this.$t('msg_analysis_failed'));
        });
    },
    
    // 停止生成
    stopGeneration() {
      // 取消当前请求
      if (this.abortController) {
        this.abortController.abort();
        this.abortController = null;
      }
      
      // 停止输入状态
      this.isTyping = false;
      this.currentRequestId = null;
      
      // 在最后一条消息后添加停止标记
      const lastMessage = this.chatMessages[this.chatMessages.length - 1];
      if (lastMessage && lastMessage.role === 'assistant') {
        if (!lastMessage.content || lastMessage.content.trim() === '') {
          // 如果 AI 还没有输出任何内容，移除这条消息
          this.chatMessages.pop();
        } else {
          // 添加停止标记
          lastMessage.content += '\n\n_[已停止生成]_';
          const processedText = processThinkTags(lastMessage.content);
          const htmlContent = marked(processedText, { renderer });
          lastMessage.formattedContent = DOMPurify.sanitize(htmlContent);
        }
      }
      
      this.$message.info('已停止生成');
    },
    
    // 清空对话
    clearChat() {
      this.$confirm({
        title: this.$t('confirm_clear_chat_title'),
        content: this.$t('confirm_clear_chat_content'),
        okText: this.$t('text_confirm'),
        cancelText: this.$t('text_close'),
        onOk: () => {
          // 先停止当前生成
          if (this.isTyping) {
            this.stopGeneration();
          }
          
          this.chatMessages = [];
          this.currentAlarmContext = null;
        }
      });
    },
    
    // 关闭 Drawer
    handleDrawerClose() {
      // 取消正在进行的请求
      if (this.abortController) {
        this.abortController.abort();
        this.abortController = null;
      }
      
      this.aiDrawerVisible = false;
      this.isTyping = false;
      this.currentRequestId = null;
    },
    
    // 滚动到底部
    scrollToBottom() {
      const container = this.$refs.chatMessages;
      if (container) {
        container.scrollTop = container.scrollHeight;
      }
    },
    
    // 格式化时间
    formatTime(date) {
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      return `${hours}:${minutes}`;
    },
  },
  filters: {
    parsetime(v) {
      return parseTimeFun(v);
    },
    levelFilter(v) {
      let res = this.$t('level_unclassified');
      switch (v) {
        case "0":
          res = this.$t('level_unclassified');
          break;
        case "1":
          res = this.$t('level_information');
          break;
        case "2":
          res = this.$t('level_warning');
          break;
        case "3":
          res = this.$t('level_average');
          break;
        case "4":
          res = this.$t('level_high');
          break;
        case "5":
          res = this.$t('level_disaster');
          break;
      }
      return res;
    },
    statusFilter(v) {
      let res = this.$t('level_unclassified');
      switch (v) {
        case "0":
          res = this.$t('alarm_type_recovery');
          break;
        case "1":
          res = this.$t('alarm_type_alarm');
          break;
      }
      return res;
    },
    notifyStatusFilter(v) {
      let res = this.$t('notify_status_notified');
      switch (v) {
        case "0":
          res = this.$t('notify_status_notified');
          break;
        case "1":
          res = this.$t('notify_status_muted');
          break;
        case "2":
          res = this.$t('notify_status_default_rule');
          break;
      }
      return res;
    },
    notifyResult(v) {
      let res = this.$t('notify_status_notified');
      switch (v) {
        case "0":
          res = this.$t('notify_result_delivered');
          break;
        case "1":
          res = this.$t('notify_result_failed');
          break;
      }
      return res;
    },
  },
  beforeDestroy() {
    // 组件销毁时确保请求被取消
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }
  },
};
</script>

<style lang="less">
/* 注意：移除 scoped 以使样式对动态内容生效 */

.card-avatar {
  width: 48px;
  height: 48px;
  border-radius: 48px;
}
.new-btn {
  border-radius: 2px;
  width: 100%;
  height: 187px;
}
.meta-content {
  position: relative;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  height: 64px;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
}

/* AI 聊天 Drawer 样式 */
.ai-chat-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #f5f5f5;
  overflow: hidden;
}

.alarm-context {
  padding: 16px;
  background: #fff;
  border-bottom: 1px solid #e8e8e8;
  
  .context-content {
    font-size: 13px;
    line-height: 1.8;
    
    div {
      margin-bottom: 4px;
      
      &:last-child {
        margin-bottom: 0;
      }
    }
    
    strong {
      color: #595959;
      margin-right: 8px;
    }
  }
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: #d9d9d9;
    border-radius: 3px;
    
    &:hover {
      background: #bfbfbf;
    }
  }
}

.chat-message {
  margin-bottom: 24px;
  animation: fadeIn 0.3s ease-in;
  
  &:last-child {
    margin-bottom: 0;
  }
  
  .message-header {
    display: flex;
    align-items: center;
    margin-bottom: 8px;
    
    .message-sender {
      margin-left: 8px;
      font-weight: 600;
      font-size: 14px;
      color: #262626;
    }
    
    .message-time {
      margin-left: auto;
      font-size: 12px;
      color: #8c8c8c;
    }
  }
  
  .message-content {
    margin-left: 40px;
    
    .user-message {
      background: #1890ff;
      color: #fff;
      padding: 12px 16px;
      border-radius: 8px;
      display: inline-block;
      max-width: 80%;
      word-wrap: break-word;
      line-height: 1.6;
    }
  }
  
  &.user {
    .message-content {
      text-align: right;
      
      .user-message {
        text-align: left;
      }
    }
  }
  
  &.assistant {
    .message-content {
      .markdown-body {
        background: #fff;
        padding: 16px;
        border-radius: 8px;
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
      }
    }
  }
}

.typing-indicator {
  .typing-dots {
    display: inline-flex;
    align-items: center;
    padding: 16px;
    background: #fff;
    border-radius: 8px;
    
    span {
      width: 8px;
      height: 8px;
      margin: 0 2px;
      background: #1890ff;
      border-radius: 50%;
      animation: typingDot 1.4s infinite;
      
      &:nth-child(2) {
        animation-delay: 0.2s;
      }
      
      &:nth-child(3) {
        animation-delay: 0.4s;
      }
    }
  }
}

@keyframes typingDot {
  0%, 60%, 100% {
    transform: translateY(0);
    opacity: 0.7;
  }
  30% {
    transform: translateY(-10px);
    opacity: 1;
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.chat-input-area {
  background: #fff;
  border-top: 1px solid #e8e8e8;
  padding: 16px;
  
  .input-actions {
    margin-bottom: 12px;
    display: flex;
    justify-content: flex-end;
  }
  
  .input-wrapper {
    display: flex;
    gap: 12px;
    align-items: flex-end;
    
    textarea {
      flex: 1;
      resize: none;
      border-radius: 8px;
      
      &:focus {
        box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
      }
    }
    
    button {
      height: 40px;
      border-radius: 8px;
      padding: 0 24px;
    }
  }
}

/* 添加Markdown样式 */
.markdown-body {
  padding: 20px;
  line-height: 1.6;
}

.markdown-body h1,
.markdown-body h2,
.markdown-body h3,
.markdown-body h4 {
  margin-top: 24px;
  margin-bottom: 16px;
  font-weight: 600;
  line-height: 1.25;
}

.markdown-body p {
  margin-bottom: 16px;
}

.markdown-body code {
  padding: 0.2em 0.4em;
  margin: 0;
  font-size: 85%;
  background-color: rgba(27,31,35,0.05);
  border-radius: 3px;
}

.markdown-body pre {
  padding: 16px;
  overflow: auto;
  font-size: 85%;
  line-height: 1.45;
  background-color: #f6f8fa;
  border-radius: 3px;
}

.markdown-body ul,
.markdown-body ol {
  padding-left: 2em;
  margin-bottom: 16px;
}

.markdown-body blockquote {
  padding: 0.5em 1em;
  color: #666;
  background-color: #f5f5f5;
  border-left: 0.25em solid #4CAF50; // 使用绿色边框突出思考过程
  margin: 1em 0;
  border-radius: 0 3px 3px 0;
}

.markdown-body blockquote p {
  margin: 0;
}

/* 调整代码高亮样式 */
.markdown-body {
  pre code.hljs {
    padding: 16px;
    background-color: #f6f8fa;
    border-radius: 6px;
    font-size: 15px;  // 增大代码块字体
    line-height: 1.6;
    font-family: 'Monaco', 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
  }

  /* 增强代码块的可读性 */
  .hljs {
    color: #24292e;
    background: #f6f8fa;
    border: 1px solid #e1e4e8;
    letter-spacing: 0.5px;  // 增加字符间距
  }

  /* 调整内联代码样式 */
  code:not(.hljs) {
    padding: 0.2em 0.4em;
    margin: 0;
    font-size: 14px;  // 增大内联代码字体
    background-color: rgba(27,31,35,0.05);
    border-radius: 3px;
    font-family: 'Monaco', 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
  }

  /* 优化代码块容器 */
  pre {
    margin: 16px 0;
    padding: 16px;
    background-color: #f6f8fa;
    border-radius: 6px;
    border: 1px solid #e1e4e8;
    overflow-x: auto;
  }
}

/* 优化引用样式 */
.markdown-body blockquote {
  background-color: #f8f9fa;
  border-left: 0.25em solid #4CAF50;
  color: #2c3e50;
  margin: 1.5em 0;
  padding: 1em 1.2em;  // 增加内边距
  border-radius: 0 4px 4px 0;
  box-shadow: 0 1px 2px rgba(0,0,0,0.1);
  font-size: 15px;  // 增大引用内容字体
}

.markdown-body blockquote p {
  margin: 0;
  line-height: 1.6;
  color: #34495e;  // 调整文字颜色
}

.markdown-body blockquote strong {
  color: #2c3e50;  // 思考过程标题加粗
  font-size: 16px;  // 标题字体稍大
}
</style>
