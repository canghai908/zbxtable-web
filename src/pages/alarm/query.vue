<template>
  <page-layout :noTitle="true">
    <a-form-model class="home-search" layout="inline" :colon='false'>
      <a-form-model-item label="搜索">
        <a-input v-model.trim="hosts" placeholder="主机名" />
      </a-form-model-item>
      <a-form-model-item label="IP">
        <a-input v-model.trim="hostIp" placeholder="主机IP" />
      </a-form-model-item>
      <a-form-model-item label="选择实例">
        <a-select v-model="selectedInstance" placeholder="全部实例" allowClear style="width: 200px">
          <a-select-option value="">全部实例</a-select-option>
          <a-select-option v-for="item in instanceList" :key="item.tenant_id" :value="item.tenant_id">
            {{ item.name }}
          </a-select-option>
        </a-select>
      </a-form-model-item>
      <a-form-model-item label="告警类型">
        <a-select optionFilterProp="label" style="width:100px" v-model="status" option-label-prop="label" @change="handleStatusChange">
          <a-select-option v-for="(item, index) in statuslist" :key="index" :value="item.id" :label="item.value" :title="item.value">
            {{ item.value }}
          </a-select-option>
        </a-select>
      </a-form-model-item>
      <a-form-model-item label="告警级别">
        <a-select optionFilterProp="label" style="width:100px" v-model="level" option-label-prop="label" @change="handleLevelChange">
          <a-select-option v-for="(item, index) in levellist" :key="index" :value="item.id" :label="item.value" :title="item.value">
            {{ item.value }}
          </a-select-option>
        </a-select>
      </a-form-model-item>
      <a-form-model-item label="创建时间">
        <a-range-picker format="YYYY-MM-DD HH:mm:ss" :show-time="{ format: 'HH:mm', defaultValue:[moment('00:00:00', 'HH:mm:ss'),moment('23:59:59', 'HH:mm:ss')]}" v-model="timeValue"
          @change="changeCreationTime" :getCalendarContainer="triggerNode=>{return triggerNode.parentNode || document.body}" />
      </a-form-model-item>
      <a-form-model-item>
        <a-button type="primary" @click="init">查询</a-button>
        <a-button style="margin-left: 10px;" @click="resetData">重置</a-button>
        <a-button style="margin-left: 10px;" type="primary" @click="anayexport">导出</a-button>
      </a-form-model-item>
    </a-form-model>

    <div class="linux-list">
      <a-table :loading="loading" :columns="columns" :data-source="list" @expand="getEvent" @change="changePage" :pagination="pagination" :rowKey="(record) => { return record.id;}">
        <a-table slot="expandedRowRender" :columns="innerColumns" :data-source="innerData" :pagination="false">
          <span slot="notify_time" slot-scope="record">{{record.notify_time | parsetime }}</span>
          <span slot="status" slot-scope="record">
            <a-badge v-if="record.status==0" status="success"></a-badge>
            <a-badge v-else-if="record.status==1" status="error"></a-badge>
            <a-badge v-else-if="record.status==2" status="processing"></a-badge>
            {{record.status | notifyResult }}
          </span>
        </a-table>
        <div slot="instance_name" slot-scope="record">
          <a-tag color="orange">{{record.instance_name || record.tenant_name || '未知'}}</a-tag>
        </div>
        <div slot="level" slot-scope="record">
          <a-tag v-if="record.level==0" color="#97AAB3">{{record.level | levelFilter}}</a-tag>
          <a-tag v-else-if="record.level==1" color=" #7499FF">{{record.level | levelFilter}}</a-tag>
          <a-tag v-else-if="record.level==2" color="#FFC859">{{record.level | levelFilter}}</a-tag>
          <a-tag v-else-if="record.level==3" color="#FFA059">{{record.level | levelFilter}}</a-tag>
          <a-tag v-else-if="record.level==4" color="#E97659">{{record.level | levelFilter}}</a-tag>
          <a-tag v-else-if="record.level==5" color="#f50000">{{record.level | levelFilter}}</a-tag>
        </div>
        <div slot="status" slot-scope="record">
          <a-tag v-if="record.status==0" color="#87d068">{{record.status | statusFilter}}</a-tag>
          <a-tag v-else-if="record.status==1" color="#f50">{{record.status | statusFilter}}</a-tag>
        </div>
        <span slot="occur_time" slot-scope="record">{{record.occur_time | parsetime }}</span>
        <span slot="notify_status" slot-scope="record">

          <a-badge v-if="record.notify_status==0" status="success"></a-badge>
          <a-badge v-else-if="record.notify_status==1" status="default"></a-badge>
          <a-badge v-else-if="record.notify_status==2" status="processing"></a-badge>
          {{record.notify_status | notifyStatusFilter }}
        </span>
        <span slot="operation" slot-scope="record">
          <a-button v-if="record.notify_status!=1" class="pd20 paddingleft0" type="link" size="small" @click="addMutes(record)">屏蔽</a-button>
          <a-button class="pd20" type="link" size="small" @click="analyzeWithDeepseek(record)">AI助手分析</a-button>
        </span>
      </a-table>
    </div>

    <!-- 修改分析结果弹窗 -->
    <a-modal title="AI助手分析结果" :visible="deepseekModalVisible" :maskClosable="false" :keyboard="false" @ok="handleModalOk" @cancel="handleModalCancel" @close="handleModalClose" width="800px">
      <div v-if="analyzing" style="text-align: center;">
        <a-spin tip="分析中..." />
      </div>
      <div v-else class="markdown-body" v-html="formattedResult"></div>
      <template slot="footer">
        <a-button key="cancel" @click="handleModalCancel">
          {{ analyzing ? '中止分析' : '关闭' }}
        </a-button>
        <a-button key="ok" type="primary" @click="handleModalOk" :disabled="analyzing">
          确定
        </a-button>
      </template>
    </a-modal>
  </page-layout>
</template>

<script>
import PageLayout from "@/layouts/PageLayout";
import { alarm, alarmExport, eventLogGet, alarmDeepseekAnalysis } from "@/services/admin";
import { listZabbixInstances } from '@/services/zabbix'
import { parseTimeFun } from "@/utils/formatter";
import { reduce } from "lodash";
import moment from "moment";
import "moment/locale/zh-cn";
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import hljs from 'highlight.js';  // 添加代码高亮库

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
  name: "LinuxList",
  components: {
    PageLayout,
  },
  data() {
    return {
      page: 1,
      pageSize: 10,
      loading: false,
      instanceList: [],
      selectedInstance: '',
      status: "",
      level: "",
      statuslist: [
        { id: 1, value: "告警", },
        { id: 0, value: "恢复", }
      ],
      levellist: [
        { id: 0, value: "未分类", },
        { id: 1, value: "信息", },
        { id: 2, value: "警告", },
        { id: 3, value: "一般", },
        { id: 4, value: "严重", },
        { id: 5, value: "灾难", },
      ],
      columns: [
        { title: "ID", dataIndex: "id", align: "left" },
        { title: "所属实例", key: "instance_name", align: "left", width: 120, scopedSlots: { customRender: "instance_name" } },
        { title: "告警类型", key: "status", align: "left", scopedSlots: { customRender: "status" }, },
        { title: "设备名称", dataIndex: "hostname", align: "left" },
        { title: "IP", dataIndex: "host_ip", align: "left", scopedSlots: { customRender: "host_ip" }, },
        { title: "告警级别", key: "level", align: "left", scopedSlots: { customRender: "level" }, },
        { title: "告警描述", dataIndex: "message", align: "left" },
        { title: "告警详情", dataIndex: "detail", align: "left" },
        { title: "发生时间", key: "occur_time", align: "left", scopedSlots: { customRender: "occur_time" }, },
        { title: "通知状态", key: "notify_status", align: "left", scopedSlots: { customRender: "notify_status" }, },
        { title: "操作", key: "operation", align: "center", scopedSlots: { customRender: "operation" } },
      ],
      innerColumns: [
        { title: "规则名称", dataIndex: "rule", align: "left" },
        { title: "接收渠道", dataIndex: "channel", align: "left" },
        { title: "接收用户", dataIndex: "user", align: "left" },
        { title: "接收账号", dataIndex: "account", align: "left" },
        { title: "通知时间", key: "notify_time", align: "left", scopedSlots: { customRender: "notify_time" }, },
        { title: "通知内容", dataIndex: "notify_content", align: "left", width: "300px", ellipsis: true, },
        { title: "通知结果", key: "status", align: "left", scopedSlots: { customRender: "status" }, },
        { title: "错误信息", dataIndex: "notify_error", align: "left", width: "300px", ellipsis: true, },
      ],
      // tenantlist/tenantid 已取消：跟随“当前 Zabbix 连接”
      list: [],
      innerData: [],
      pagination: {
        total: 0,
        current: 1,
        "show-quick-jumper": true,
        "page-size-options": ["10", "20", "30", "40", "50", "100", "200"],
        pageSize: 10,
        "show-size-changer": true,
        "show-total": (total) => `共 ${total} 条数据`,
      },
      moment,
      // 兼容旧字段（不再参与请求）
      tenantid: "",
      hosts: "",
      timeValue: null,
      beginTime: "",
      endTime: "",
      deepseekModalVisible: false,
      analyzing: false,
      analysisResult: '',
      formattedResult: '',
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
    this.loadInstances();
    this.init();
  },
  methods: {
    loadInstances() {
      listZabbixInstances().then((resp) => {
        let res = resp.data
        if (res.code == 200) {
          const allItems = Array.isArray(res.data) ? res.data : []
          this.instanceList = allItems.filter(item => item.enabled)
        }
      }).catch(err => {
        console.error('加载实例列表失败:', err)
      })
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
        req.tenant_id = this.selectedInstance;
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
      this.$router.push("/alarm/mutes?hostid=" + record.host_id + '&tenantid=' + record.tenant_id +
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
          tenant_id: this.selectedInstance,
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
      this.innerData = []
      eventLogGet(record.id).then((resp) => {
        let res = resp.data;
        if (res.code == 200) {
          this.innerData = res.data.items || [];
        }
      })
    },
    // 发送到Deepseek分析
    analyzeWithDeepseek(record) {
      // 重置所有状态
      this.deepseekModalVisible = true;
      this.analyzing = true;
      this.analysisResult = '';
      this.formattedResult = '';
      
      // 确保上一个请求被取消
      if (this.abortController) {
        this.abortController.abort();
        this.abortController = null;
      }
      
      // 生成新的请求ID
      this.currentRequestId = Date.now().toString();
      
      // 创建新的 AbortController
      this.abortController = new AbortController();
      let analysisTimeout = null;
      
      const analysisData = {
        message: "请分析以下告警详情，说明可能的原因并给出具体的解决方案：\n" + record.detail,
        requestId: this.currentRequestId,
        onProgress: (text, responseRequestId) => {
          try {
            // 检查响应是否属于当前请求
            if (responseRequestId === this.currentRequestId && text && text.trim()) {
              if (analysisTimeout) {
                clearTimeout(analysisTimeout);
              }
              if (this.deepseekModalVisible) {
                this.analyzing = false;
                this.analysisResult = text;
                try {
                  const processedText = processThinkTags(text);
                  const htmlContent = marked(processedText, { renderer });
                  this.formattedResult = DOMPurify.sanitize(htmlContent);
                } catch (parseError) {
                  console.error('Markdown parse error:', parseError);
                  this.formattedResult = text;
                }
              }
            }
          } catch (error) {
            console.error('Progress callback error:', error);
          }
        },
        signal: this.abortController.signal
      };

      // 设置总体超时处理，调整为6分钟（比请求超时稍长一些）
      analysisTimeout = setTimeout(() => {
        if (this.analyzing) {
          this.analyzing = false;
          this.analysisResult = '分析超时，请稍后重试或缩短分析内容';
          this.$message.warning('分析请求超时');
        }
      }, 360000); // 6分钟总体超时

      // 调用 Deepseek API
      alarmDeepseekAnalysis(analysisData)
        .then(() => {
          clearTimeout(analysisTimeout);
          this.analyzing = false;
        })
        .catch(error => {
          clearTimeout(analysisTimeout);
          this.analyzing = false;
          // 如果是用户主动取消，不显示错误信息
          if (error.name === 'AbortError') {
            return;
          }
          let errorMsg = '未知错误';
          if (error.code === 'ECONNABORTED') {
            errorMsg = '请求超时，请稍后重试';
          } else if (error.response) {
            errorMsg = error.response.data?.message || error.message;
          } else if (error.message) {
            errorMsg = error.message;
          }
          this.analysisResult = '分析失败: ' + errorMsg;
          this.$message.error('分析请求失败');
        });
    },
    
    handleModalClose() {
      this.abortAnalysis();
    },
    
    handleModalCancel() {
      if (this.analyzing) {
        this.$confirm({
          title: '确认中止',
          content: '是否确认中止当前分析？',
          okText: '确认',
          cancelText: '取消',
          onOk: () => {
            this.abortAnalysis();
          }
        });
      } else {
        this.abortAnalysis();
      }
    },
    
    handleModalOk() {
      if (!this.analyzing) {
        this.abortAnalysis();
      }
    },
    
    abortAnalysis() {
      // 取消请求
      if (this.abortController) {
        this.abortController.abort();
        this.abortController = null;
      }
      // 清理所有状态
      this.deepseekModalVisible = false;
      this.analyzing = false;
      this.analysisResult = '';
      this.formattedResult = '';
      this.currentRequestId = null;
    },
  },
  filters: {
    parsetime(v) {
      return parseTimeFun(v);
    },
    levelFilter(v) {
      let res = "未分类";
      switch (v) {
        case "0":
          res = "未分类";
          break;
        case "1":
          res = "信息";
          break;
        case "2":
          res = "警告";
          break;
        case "3":
          res = "一般";
          break;
        case "4":
          res = "严重";
          break;
        case "5":
          res = "灾难";
          break;
      }
      return res;
    },
    statusFilter(v) {
      let res = "未分类";
      switch (v) {
        case "0":
          res = "恢复";
          break;
        case "1":
          res = "告警";
          break;
      }
      return res;
    },
    notifyStatusFilter(v) {
      let res = "已通知";
      switch (v) {
        case "0":
          res = "已通知";
          break;
        case "1":
          res = "已屏蔽";
          break;
        case "2":
          res = "默认规则";
          break;
      }
      return res;
    },
    notifyResult(v) {
      let res = "已通知";
      switch (v) {
        case "0":
          res = "已送达";
          break;
        case "1":
          res = "失败";
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
