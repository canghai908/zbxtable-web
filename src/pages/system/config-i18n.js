module.exports = {
  // 配置项的 name 和 comment 翻译映射（根据 key 字段）
  configItemTranslations: {
    CN: {
      encryption_key: {
        name: '加密密钥',
        comment: '用于加密存储敏感信息（如Zabbix密码和Token）的密钥，系统自动生成，不可修改'
      },
      system_name: {
        name: '系统名称',
        comment: '系统显示的名称'
      },
      system_logo: {
        name: '系统Logo',
        comment: '系统Logo的base64编码数据'
      },
      zbx_dash: {
        name: '数据面板',
        comment: '是否开启Zabbix看板：1 开启,0 关闭'
      },
      dash_id: {
        name: '面板配置',
        comment: '需要引入的Zabbix面板的ID，默认为1'
      },
      sync_inventory: {
        name: '主机分类同步',
        comment: '主机分类同步计划任务是否启用：1 启用,0 不启用'
      },
      sync_inventory_cron: {
        name: '主机分类同步 Cron',
        comment: '主机分类同步执行周期，格式：秒 分 时 日 月 周'
      },
      top_sync_enabled: {
        name: '首页 Top 数据同步开关',
        comment: '首页 Top 数据同步计划任务是否启用：1 启用,0 停用'
      },
      top_sync_cron: {
        name: '首页 Top 数据同步 Cron',
        comment: '首页 Top 数据同步执行周期，格式：秒 分 时 日 月 周'
      },
      day_report_enabled: {
        name: '日报生成开关',
        comment: '日报生成计划任务是否启用：1 启用,0 停用'
      },
      day_report_cron: {
        name: '日报生成 Cron',
        comment: '日报生成执行周期，格式：秒 分 时 日 月 周'
      },
      week_report_enabled: {
        name: '周报生成开关',
        comment: '周报生成计划任务是否启用：1 启用,0 停用'
      },
      week_report_cron: {
        name: '周报生成 Cron',
        comment: '周报生成执行周期，格式：秒 分 时 日 月 周'
      },
      auto_metric_mapping_enabled: {
        name: '自动指标映射开关',
        comment: '自动指标映射计划任务是否启用：1 启用,0 停用'
      },
      auto_metric_mapping_cron: {
        name: '自动指标映射 Cron',
        comment: '自动指标映射执行周期，格式：秒 分 时 日 月 周'
      },
      retry_failed_mapping_enabled: {
        name: '失败指标映射重试开关',
        comment: '失败指标映射重试计划任务是否启用：1 启用,0 停用'
      },
      retry_failed_mapping_cron: {
        name: '失败指标映射重试 Cron',
        comment: '失败指标映射重试执行周期，格式：秒 分 时 日 月 周'
      },
      egress_collect_enabled: {
        name: '出口数据采集开关',
        comment: '出口数据采集计划任务是否启用：1 启用,0 停用'
      },
      egress_collect_cron: {
        name: '出口数据采集 Cron',
        comment: '出口数据采集执行周期，格式：秒 分 时 日 月 周'
      },
      overview_sync_enabled: {
        name: '状态总览同步开关',
        comment: '状态总览同步计划任务是否启用：1 启用,0 停用'
      },
      overview_sync_cron: {
        name: '状态总览同步 Cron',
        comment: '状态总览同步执行周期，格式：秒 分 时 日 月 周'
      },
      webhook_url: {
        name: 'Webhook回调地址',
        comment: 'webhook通知地址'
      },
      email_from: {
        name: '邮件发件人',
        comment: '告警邮件发件人邮箱地址'
      },
      email_nickname: {
        name: '邮件昵称',
        comment: '告警邮件显示的发件人昵称'
      },
      email_secret: {
        name: 'SMTP 密码/授权码',
        comment: 'SMTP 登录密码或授权码'
      },
      email_host: {
        name: 'SMTP 服务器',
        comment: 'SMTP 服务器地址'
      },
      email_port: {
        name: 'SMTP 端口',
        comment: 'SMTP 端口号'
      },
      email_isSSl: {
        name: 'SMTP 使用 SSL',
        comment: '是否启用 SSL：true/false'
      },
      wechat_enabled: {
        name: '企业微信开关',
        comment: '是否启用企业微信：1 启用,0 禁用'
      },
      wechat_agentid: {
        name: '企业微信 AgentID',
        comment: '企业微信应用的 AgentID'
      },
      wechat_corpid: {
        name: '企业微信 CorpID',
        comment: '企业微信企业ID'
      },
      wechat_secret: {
        name: '企业微信 Secret',
        comment: '企业微信应用的 Secret'
      },
      ai_type: {
        name: 'AI 类型',
        comment: '选择使用的 AI 服务类型：ollama、deepseek 或 custom'
      },
      alarm_analysis_prompt: {
        name: '告警分析提示词',
        comment: '用于“AI助手分析”默认发送给模型的提示词模板，支持占位符：{{hostname}} {{host_ip}} {{message}} {{detail}} {{level}} {{status}} {{alarm_context}}'
      },
      ollama_host: {
        name: 'Ollama Host',
        comment: 'Ollama 服务地址，如 http://127.0.0.1:11434'
      },
      ollama_model: {
        name: 'Ollama Model',
        comment: '默认使用的大模型名称'
      },
      deepseek_api_key: {
        name: 'Deepseek API Key',
        comment: 'Deepseek API 密钥'
      },
      deepseek_model: {
        name: 'Deepseek Model',
        comment: 'Deepseek 模型名称，如 deepseek-chat'
      },
      deepseek_base_url: {
        name: 'Deepseek Base URL',
        comment: 'Deepseek API 地址，默认为 https://api.deepseek.com'
      },
      custom_api_key: {
        name: 'Custom API Key',
        comment: 'OpenAI 兼容接口的 API Key'
      },
      custom_model: {
        name: 'Custom Model',
        comment: 'OpenAI 兼容接口的模型名称'
      },
      custom_base_url: {
        name: 'Custom Base URL',
        comment: 'OpenAI 兼容接口地址，如 https://api.example.com/v1'
      },
      dash_top_lin_num: {
        name: 'Linux Top 数量',
        comment: '首页 Linux CPU、内存排行显示的数量'
      },
      dash_top_win_num: {
        name: 'Windows Top 数量',
        comment: '首页 Windows CPU、内存排行显示的数量'
      }
    },
    HK: {
      encryption_key: {
        name: '加密密鑰',
        comment: '用於加密存儲敏感信息（如Zabbix密碼和Token）的密鑰，系統自動生成，不可修改'
      },
      system_name: {
        name: '系統名稱',
        comment: '系統顯示的名稱'
      },
      system_logo: {
        name: '系統Logo',
        comment: '系統Logo的base64編碼數據'
      },
      zbx_dash: {
        name: '數據面板',
        comment: '是否開啟Zabbix看板：1 開啟,0 關閉'
      },
      dash_id: {
        name: '面板配置',
        comment: '需要引入的Zabbix面板的ID，默認為1'
      },
      sync_inventory: {
        name: '主機分類同步',
        comment: '主機分類同步計劃任務是否啟用：1 啟用,0 不啟用'
      },
      sync_inventory_cron: {
        name: '主機分類同步 Cron',
        comment: '主機分類同步執行週期，格式：秒 分 時 日 月 周'
      },
      top_sync_enabled: {
        name: '首頁 Top 數據同步開關',
        comment: '首頁 Top 數據同步計劃任務是否啟用：1 啟用,0 停用'
      },
      top_sync_cron: {
        name: '首頁 Top 數據同步 Cron',
        comment: '首頁 Top 數據同步執行週期，格式：秒 分 時 日 月 周'
      },
      day_report_enabled: {
        name: '日報生成開關',
        comment: '日報生成計劃任務是否啟用：1 啟用,0 停用'
      },
      day_report_cron: {
        name: '日報生成 Cron',
        comment: '日報生成執行週期，格式：秒 分 時 日 月 周'
      },
      week_report_enabled: {
        name: '週報生成開關',
        comment: '週報生成計劃任務是否啟用：1 啟用,0 停用'
      },
      week_report_cron: {
        name: '週報生成 Cron',
        comment: '週報生成執行週期，格式：秒 分 時 日 月 周'
      },
      auto_metric_mapping_enabled: {
        name: '自動指標映射開關',
        comment: '自動指標映射計劃任務是否啟用：1 啟用,0 停用'
      },
      auto_metric_mapping_cron: {
        name: '自動指標映射 Cron',
        comment: '自動指標映射執行週期，格式：秒 分 時 日 月 周'
      },
      retry_failed_mapping_enabled: {
        name: '失敗指標映射重試開關',
        comment: '失敗指標映射重試計劃任務是否啟用：1 啟用,0 停用'
      },
      retry_failed_mapping_cron: {
        name: '失敗指標映射重試 Cron',
        comment: '失敗指標映射重試執行週期，格式：秒 分 時 日 月 周'
      },
      egress_collect_enabled: {
        name: '出口數據採集開關',
        comment: '出口數據採集計劃任務是否啟用：1 啟用,0 停用'
      },
      egress_collect_cron: {
        name: '出口數據採集 Cron',
        comment: '出口數據採集執行週期，格式：秒 分 時 日 月 周'
      },
      overview_sync_enabled: {
        name: '狀態總覽同步開關',
        comment: '狀態總覽同步計劃任務是否啟用：1 啟用,0 停用'
      },
      overview_sync_cron: {
        name: '狀態總覽同步 Cron',
        comment: '狀態總覽同步執行週期，格式：秒 分 時 日 月 周'
      },
      webhook_url: {
        name: 'Webhook回調地址',
        comment: 'webhook通知地址'
      },
      email_from: {
        name: '郵件發件人',
        comment: '告警郵件發件人郵箱地址'
      },
      email_nickname: {
        name: '郵件昵稱',
        comment: '告警郵件顯示的發件人昵稱'
      },
      email_secret: {
        name: 'SMTP 密碼/授權碼',
        comment: 'SMTP 登錄密碼或授權碼'
      },
      email_host: {
        name: 'SMTP 服務器',
        comment: 'SMTP 服務器地址'
      },
      email_port: {
        name: 'SMTP 端口',
        comment: 'SMTP 端口號'
      },
      email_isSSl: {
        name: 'SMTP 使用 SSL',
        comment: '是否啟用 SSL：true/false'
      },
      wechat_enabled: {
        name: '企業微信開關',
        comment: '是否啟用企業微信：1 啟用,0 禁用'
      },
      wechat_agentid: {
        name: '企業微信 AgentID',
        comment: '企業微信應用的 AgentID'
      },
      wechat_corpid: {
        name: '企業微信 CorpID',
        comment: '企業微信企業ID'
      },
      wechat_secret: {
        name: '企業微信 Secret',
        comment: '企業微信應用的 Secret'
      },
      ai_type: {
        name: 'AI 類型',
        comment: '選擇使用的 AI 服務類型：ollama、deepseek 或 custom'
      },
      alarm_analysis_prompt: {
        name: '告警分析提示詞',
        comment: '用於「AI助手分析」默認發送給模型的提示詞模板，支持佔位符：{{hostname}} {{host_ip}} {{message}} {{detail}} {{level}} {{status}} {{alarm_context}}'
      },
      ollama_host: {
        name: 'Ollama Host',
        comment: 'Ollama 服務地址，如 http://127.0.0.1:11434'
      },
      ollama_model: {
        name: 'Ollama Model',
        comment: '默認使用的大模型名稱'
      },
      deepseek_api_key: {
        name: 'Deepseek API Key',
        comment: 'Deepseek API 密鑰'
      },
      deepseek_model: {
        name: 'Deepseek Model',
        comment: 'Deepseek 模型名稱，如 deepseek-chat'
      },
      deepseek_base_url: {
        name: 'Deepseek Base URL',
        comment: 'Deepseek API 地址，默認為 https://api.deepseek.com'
      },
      custom_api_key: {
        name: 'Custom API Key',
        comment: 'OpenAI 相容接口的 API Key'
      },
      custom_model: {
        name: 'Custom Model',
        comment: 'OpenAI 相容接口的模型名稱'
      },
      custom_base_url: {
        name: 'Custom Base URL',
        comment: 'OpenAI 相容接口地址，如 https://api.example.com/v1'
      },
      dash_top_lin_num: {
        name: 'Linux Top 數量',
        comment: '首頁 Linux CPU、內存排行顯示的數量'
      },
      dash_top_win_num: {
        name: 'Windows Top 數量',
        comment: '首頁 Windows CPU、內存排行顯示的數量'
      }
    },
    US: {
      encryption_key: {
        name: 'Encryption Key',
        comment: 'Key for encrypting sensitive information (such as Zabbix passwords and tokens), automatically generated by the system, cannot be modified'
      },
      system_name: {
        name: 'System Name',
        comment: 'The name displayed in the system'
      },
      system_logo: {
        name: 'System Logo',
        comment: 'Base64 encoded data of system logo'
      },
      zbx_dash: {
        name: 'Dashboard',
        comment: 'Enable Zabbix dashboard: 1 enable, 0 disable'
      },
      dash_id: {
        name: 'Dashboard Config',
        comment: 'ID of the Zabbix dashboard to import, default is 1'
      },
      sync_inventory: {
        name: 'Host Inventory Sync',
        comment: 'Enable host inventory sync task: 1 enable, 0 disable'
      },
      sync_inventory_cron: {
        name: 'Host Inventory Sync Cron',
        comment: 'Execution schedule for host inventory sync. Format: second minute hour day month weekday'
      },
      top_sync_enabled: {
        name: 'Top Sync Switch',
        comment: 'Enable dashboard Top sync task: 1 enable, 0 disable'
      },
      top_sync_cron: {
        name: 'Top Sync Cron',
        comment: 'Execution schedule for dashboard Top sync. Format: second minute hour day month weekday'
      },
      day_report_enabled: {
        name: 'Daily Report Switch',
        comment: 'Enable daily report task: 1 enable, 0 disable'
      },
      day_report_cron: {
        name: 'Daily Report Cron',
        comment: 'Execution schedule for daily report generation. Format: second minute hour day month weekday'
      },
      week_report_enabled: {
        name: 'Weekly Report Switch',
        comment: 'Enable weekly report task: 1 enable, 0 disable'
      },
      week_report_cron: {
        name: 'Weekly Report Cron',
        comment: 'Execution schedule for weekly report generation. Format: second minute hour day month weekday'
      },
      auto_metric_mapping_enabled: {
        name: 'Auto Metric Mapping Switch',
        comment: 'Enable automatic metric mapping task: 1 enable, 0 disable'
      },
      auto_metric_mapping_cron: {
        name: 'Auto Metric Mapping Cron',
        comment: 'Execution schedule for automatic metric mapping. Format: second minute hour day month weekday'
      },
      retry_failed_mapping_enabled: {
        name: 'Retry Failed Mapping Switch',
        comment: 'Enable failed metric mapping retry task: 1 enable, 0 disable'
      },
      retry_failed_mapping_cron: {
        name: 'Retry Failed Mapping Cron',
        comment: 'Execution schedule for failed metric mapping retry. Format: second minute hour day month weekday'
      },
      egress_collect_enabled: {
        name: 'Egress Collection Switch',
        comment: 'Enable egress data collection task: 1 enable, 0 disable'
      },
      egress_collect_cron: {
        name: 'Egress Collection Cron',
        comment: 'Execution schedule for egress data collection. Format: second minute hour day month weekday'
      },
      overview_sync_enabled: {
        name: 'Overview Sync Switch',
        comment: 'Enable overview sync task: 1 enable, 0 disable'
      },
      overview_sync_cron: {
        name: 'Overview Sync Cron',
        comment: 'Execution schedule for overview sync. Format: second minute hour day month weekday'
      },
      webhook_url: {
        name: 'Webhook URL',
        comment: 'Webhook notification URL'
      },
      email_from: {
        name: 'Email From',
        comment: 'Alert email sender address'
      },
      email_nickname: {
        name: 'Email Nickname',
        comment: 'Sender nickname displayed in alert emails'
      },
      email_secret: {
        name: 'SMTP Password/Auth Code',
        comment: 'SMTP login password or authorization code'
      },
      email_host: {
        name: 'SMTP Server',
        comment: 'SMTP server address'
      },
      email_port: {
        name: 'SMTP Port',
        comment: 'SMTP port number'
      },
      email_isSSl: {
        name: 'SMTP Use SSL',
        comment: 'Enable SSL: true/false'
      },
      wechat_enabled: {
        name: 'WeChat Work Switch',
        comment: 'Enable WeChat Work: 1 enable, 0 disable'
      },
      wechat_agentid: {
        name: 'WeChat Work AgentID',
        comment: 'AgentID of WeChat Work application'
      },
      wechat_corpid: {
        name: 'WeChat Work CorpID',
        comment: 'WeChat Work corporation ID'
      },
      wechat_secret: {
        name: 'WeChat Work Secret',
        comment: 'Secret of WeChat Work application'
      },
      ai_type: {
        name: 'AI Type',
        comment: 'Select AI service type: ollama, deepseek, or custom'
      },
      alarm_analysis_prompt: {
        name: 'Alarm Analysis Prompt',
        comment: 'Prompt template sent by default when clicking "AI Assistant Analysis", supports placeholders: {{hostname}} {{host_ip}} {{message}} {{detail}} {{level}} {{status}} {{alarm_context}}'
      },
      ollama_host: {
        name: 'Ollama Host',
        comment: 'Ollama service address, e.g. http://127.0.0.1:11434'
      },
      ollama_model: {
        name: 'Ollama Model',
        comment: 'Default AI model name to use'
      },
      deepseek_api_key: {
        name: 'Deepseek API Key',
        comment: 'Deepseek API key'
      },
      deepseek_model: {
        name: 'Deepseek Model',
        comment: 'Deepseek model name, e.g. deepseek-chat'
      },
      deepseek_base_url: {
        name: 'Deepseek Base URL',
        comment: 'Deepseek API base URL, default is https://api.deepseek.com'
      },
      custom_api_key: {
        name: 'Custom API Key',
        comment: 'API key for an OpenAI-compatible endpoint'
      },
      custom_model: {
        name: 'Custom Model',
        comment: 'Model name for an OpenAI-compatible endpoint'
      },
      custom_base_url: {
        name: 'Custom Base URL',
        comment: 'OpenAI-compatible API base URL, e.g. https://api.example.com/v1'
      },
      dash_top_lin_num: {
        name: 'Linux Top Number',
        comment: 'The number of Top items to display for Linux CPU and memory'
      },
      dash_top_win_num: {
        name: 'Windows Top Number',
        comment: 'The number of Top items to display for Windows CPU and memory'
      }
    }
  },
  messages: {
    CN: {
      title: '系统配置',
      systemTab: '系统配置',
      taskTab: '计划任务',
      emailTab: '邮件配置',
      wechatTab: '企业微信配置',
      aiTab: 'AI 配置',
      securityTab: '安全配置',
      
      // 外观配置
      appearanceConfig: '外观配置',
      systemName: '系统名称',
      systemNamePlaceholder: '请输入系统名称',
      systemNameHint: '系统显示的名称，将在页面标题和导航栏中显示',
      systemLogo: '系统Logo',
      uploadLogo: '上传Logo',
      logoUploading: '上传中...',
      logoUploadHint: '支持 PNG、JPG、SVG 格式，建议尺寸 32x32px，大小不超过2MB',
      logoPreview: 'Logo预览',
      
      // 系统配置
      systemSettings: '系统配置',
      taskSettings: '计划任务',
      taskEnabledLabel: '开关',
      taskCronLabel: 'Cron',
      taskCronFormatShort: '秒 分 时 日 月 周',
      webhookUrl: 'Webhook地址',
      getCurrentUrl: '获取当前地址',
      gettingUrl: '获取中...',
      
      // 按钮
      save: '保存',
      saveSuccess: '保存成功',
      saveFailed: '保存失败',
      
      // 提示
      configHint: '配置说明',
      
      // 通用
      enabled: '开启',
      disabled: '关闭',
      
      // 安全配置
      encryptionKey: '加密密钥',
      showKey: '显示完整密钥',
      hideKey: '隐藏密钥',
      securityWarning: '安全提示',
      keyDesc1: '此密钥用于加密存储 Zabbix 密码和 Token 等敏感信息',
      keyDesc2: '系统初始化时自动生成，不可通过界面修改',
      keyDesc3: '请妥善保管此密钥，丢失将导致已加密数据无法解密',
      keyDesc4: '建议定期备份数据库，包含此密钥配置',
      copyKey: '复制密钥',
      needShowKeyFirst: '需要先显示完整密钥才能复制',
      keyEmpty: '密钥为空',
      keyCopied: '加密密钥已复制到剪贴板',
      copyFailed: '复制失败，请手动复制',
      
      // Logo上传
      logoFormatError: '只支持 PNG、JPG、JPEG 或 SVG 格式的图片',
      logoSizeError: '图片大小不能超过 2MB',
      logoUploadSuccess: 'Logo上传成功',
      logoUploadFailed: 'Logo上传失败',
      unknownError: '未知错误',
      
      // 其他
      previewHint: '保存后刷新页面即可看到效果',
      urlGetSuccess: '已获取当前访问地址',
      urlGetFailed: '获取地址失败',
      
      // 测试功能
      testEmail: '测试邮件',
      testWechat: '测试企业微信',
      testEmailTitle: '测试邮件配置',
      testWechatTitle: '测试企业微信配置',
      testEmailPlaceholder: '请输入接收测试邮件的邮箱地址',
      testWechatPlaceholder: '请输入企业微信用户ID',
      testEmailHint: '将发送一封测试邮件到指定邮箱，用于验证邮件配置是否正确',
      testWechatHint: '将发送一条测试消息到指定用户的企业微信，用于验证配置是否正确',
      sendTest: '发送测试',
      testing: '测试中...',
      testSuccess: '测试成功',
      testFailed: '测试失败',
      pleaseInputTestEmail: '请输入测试邮箱地址',
      pleaseInputTestUserId: '请输入测试用户ID',
      testEmailSuccess: '测试邮件发送成功，请检查邮箱',
      testWechatSuccess: '测试消息发送成功，请检查企业微信',
      defaultAlarmAnalysisPrompt: '你是专业运维分析师。请基于以下告警信息进行分析：\n\n设备名称：{{hostname}}\nIP：{{host_ip}}\n告警描述：{{message}}\n告警详情：{{detail}}\n告警级别：{{level}}\n告警状态：{{status}}\n\n请输出：\n1. 可能根因（按概率排序）\n2. 排查步骤（关键命令/检查项）\n3. 修复方案与风险\n4. 防复发建议',
    },
    HK: {
      title: '系統配置',
      systemTab: '系統配置',
      taskTab: '計劃任務',
      emailTab: '郵件配置',
      wechatTab: '企業微信配置',
      aiTab: 'AI 配置',
      securityTab: '安全配置',
      
      // 外觀配置
      appearanceConfig: '外觀配置',
      systemName: '系統名稱',
      systemNamePlaceholder: '請輸入系統名稱',
      systemNameHint: '系統顯示的名稱，將在頁面標題和導航欄中顯示',
      systemLogo: '系統Logo',
      uploadLogo: '上傳Logo',
      logoUploading: '上傳中...',
      logoUploadHint: '支持 PNG、JPG、SVG 格式，建議尺寸 32x32px，大小不超過2MB',
      logoPreview: 'Logo預覽',
      
      // 系統配置
      systemSettings: '系統配置',
      taskSettings: '計劃任務',
      taskEnabledLabel: '開關',
      taskCronLabel: 'Cron',
      taskCronFormatShort: '秒 分 時 日 月 周',
      webhookUrl: 'Webhook地址',
      getCurrentUrl: '獲取當前地址',
      gettingUrl: '獲取中...',
      
      // 按鈕
      save: '保存',
      saveSuccess: '保存成功',
      saveFailed: '保存失敗',
      
      // 提示
      configHint: '配置說明',
      
      // 通用
      enabled: '開啟',
      disabled: '關閉',
      
      // 安全配置
      encryptionKey: '加密密鑰',
      showKey: '顯示完整密鑰',
      hideKey: '隱藏密鑰',
      securityWarning: '安全提示',
      keyDesc1: '此密鑰用於加密存儲 Zabbix 密碼和 Token 等敏感信息',
      keyDesc2: '系統初始化時自動生成，不可通過界面修改',
      keyDesc3: '請妥善保管此密鑰，丟失將導致已加密數據無法解密',
      keyDesc4: '建議定期備份數據庫，包含此密鑰配置',
      copyKey: '複製密鑰',
      needShowKeyFirst: '需要先顯示完整密鑰才能複製',
      keyEmpty: '密鑰為空',
      keyCopied: '加密密鑰已複製到剪貼板',
      copyFailed: '複製失敗，請手動複製',
      
      // Logo上傳
      logoFormatError: '只支持 PNG、JPG、JPEG 或 SVG 格式的圖片',
      logoSizeError: '圖片大小不能超過 2MB',
      logoUploadSuccess: 'Logo上傳成功',
      logoUploadFailed: 'Logo上傳失敗',
      unknownError: '未知錯誤',
      
      // 其他
      previewHint: '保存後刷新頁面即可看到效果',
      urlGetSuccess: '已獲取當前訪問地址',
      urlGetFailed: '獲取地址失敗',
      
      // 測試功能
      testEmail: '測試郵件',
      testWechat: '測試企業微信',
      testEmailTitle: '測試郵件配置',
      testWechatTitle: '測試企業微信配置',
      testEmailPlaceholder: '請輸入接收測試郵件的郵箱地址',
      testWechatPlaceholder: '請輸入企業微信用戶ID',
      testEmailHint: '將發送一封測試郵件到指定郵箱，用於驗證郵件配置是否正確',
      testWechatHint: '將發送一條測試消息到指定用戶的企業微信，用於驗證配置是否正確',
      sendTest: '發送測試',
      testing: '測試中...',
      testSuccess: '測試成功',
      testFailed: '測試失敗',
      pleaseInputTestEmail: '請輸入測試郵箱地址',
      pleaseInputTestUserId: '請輸入測試用戶ID',
      testEmailSuccess: '測試郵件發送成功，請檢查郵箱',
      testWechatSuccess: '測試消息發送成功，請檢查企業微信',
      defaultAlarmAnalysisPrompt: '你是專業運維分析師。請基於以下告警信息進行分析：\n\n設備名稱：{{hostname}}\nIP：{{host_ip}}\n告警描述：{{message}}\n告警詳情：{{detail}}\n告警級別：{{level}}\n告警狀態：{{status}}\n\n請輸出：\n1. 可能根因（按概率排序）\n2. 排查步驟（關鍵命令/檢查項）\n3. 修復方案與風險\n4. 防復發建議',
    },
    US: {
      title: 'System Configuration',
      systemTab: 'System',
      taskTab: 'Tasks',
      emailTab: 'Email',
      wechatTab: 'WeChat',
      aiTab: 'AI',
      securityTab: 'Security',
      
      // Appearance Config
      appearanceConfig: 'System Information',
      systemName: 'Name',
      systemNamePlaceholder: 'Please input system name',
      systemNameHint: 'The name displayed in the system, shown in page title and navigation bar',
      systemLogo: 'Logo',
      uploadLogo: 'Upload Logo',
      logoUploading: 'Uploading...',
      logoUploadHint: 'Support PNG, JPG, SVG format, recommended size 32x32px, max 2MB',
      logoPreview: 'Logo Preview',
      
      // System Settings
      systemSettings: 'System Settings',
      taskSettings: 'Scheduled Tasks',
      taskEnabledLabel: 'Switch',
      taskCronLabel: 'Cron',
      taskCronFormatShort: 'sec min hour day mon wk',
      webhookUrl: 'Webhook URL',
      getCurrentUrl: 'Get Current URL',
      gettingUrl: 'Getting...',
      
      // Buttons
      save: 'Save',
      saveSuccess: 'Save Success',
      saveFailed: 'Save Failed',
      
      // Hints
      configHint: 'Configuration Description',
      
      // Common
      enabled: 'Enabled',
      disabled: 'Disabled',
      
      // Security Config
      encryptionKey: 'Encryption Key',
      showKey: 'Show Full Key',
      hideKey: 'Hide Key',
      securityWarning: 'Security Warning',
      keyDesc1: 'This key is used to encrypt sensitive data such as Zabbix passwords and tokens',
      keyDesc2: 'Automatically generated during system initialization, cannot be modified through the interface',
      keyDesc3: 'Please keep this key safe. Loss of the key will result in encrypted data being unrecoverable',
      keyDesc4: 'It is recommended to regularly backup the database, including this key configuration',
      copyKey: 'Copy Key',
      needShowKeyFirst: 'Need to show the full key first before copying',
      keyEmpty: 'Key is empty',
      keyCopied: 'Encryption key copied to clipboard',
      copyFailed: 'Copy failed, please copy manually',
      
      // Logo Upload
      logoFormatError: 'Only PNG, JPG, JPEG or SVG format images are supported',
      logoSizeError: 'Image size cannot exceed 2MB',
      logoUploadSuccess: 'Logo uploaded successfully',
      logoUploadFailed: 'Logo upload failed',
      unknownError: 'Unknown error',
      
      // Others
      previewHint: 'Refresh the page after saving to see the effect',
      urlGetSuccess: 'Current access address obtained',
      urlGetFailed: 'Failed to get address',
      
      // Test Features
      testEmail: 'Test Email',
      testWechat: 'Test WeChat',
      testEmailTitle: 'Test Email Configuration',
      testWechatTitle: 'Test WeChat Configuration',
      testEmailPlaceholder: 'Please enter the email address to receive test email',
      testWechatPlaceholder: 'Please enter WeChat Work user ID',
      testEmailHint: 'A test email will be sent to the specified email address to verify the email configuration',
      testWechatHint: 'A test message will be sent to the specified user\'s WeChat Work to verify the configuration',
      sendTest: 'Send Test',
      testing: 'Testing...',
      testSuccess: 'Test Success',
      testFailed: 'Test Failed',
      pleaseInputTestEmail: 'Please enter test email address',
      pleaseInputTestUserId: 'Please enter test user ID',
      testEmailSuccess: 'Test email sent successfully, please check your inbox',
      testWechatSuccess: 'Test message sent successfully, please check WeChat Work',
      defaultAlarmAnalysisPrompt: 'You are a professional operations analyst. Please analyze the following alarm information:\n\nDevice Name: {{hostname}}\nIP: {{host_ip}}\nAlarm Description: {{message}}\nAlarm Detail: {{detail}}\nAlarm Severity: {{level}}\nAlarm Status: {{status}}\n\nPlease output:\n1. Possible root causes (sorted by probability)\n2. Troubleshooting steps (key commands/check items)\n3. Fix plan and risks\n4. Prevention recommendations',
    }
  }
}
