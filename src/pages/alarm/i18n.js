module.exports = {
  messages: {
    CN: {
      // 搜索表单
      label_search: '搜索',
      label_hostname: '主机名',
      label_host_ip: '主机IP',
      label_ip: 'IP',
      label_select_instance: '选择实例',
      label_all_instances: '全部实例',
      label_alarm_type: '告警类型',
      label_alarm_level: '告警级别',
      label_creation_time: '创建时间',
      label_effective_time: '生效时间',
      label_start_end: '开始-结束',
      btn_query: '查询',
      btn_reset: '重置',
      btn_export: '导出',
      btn_submit: '提交',
      btn_save: '保存',
      btn_cancel: '取消',
      btn_back: '返回',
      btn_delete: '删除',
      btn_edit: '编辑',
      btn_add: '新增',
      
      // 告警类型
      alarm_type_alarm: '告警',
      alarm_type_recovery: '恢复',
      
      // 告警级别
      level_unclassified: '未分类',
      level_information: '信息',
      level_warning: '警告',
      level_average: '一般',
      level_high: '严重',
      level_disaster: '灾难',
      
      // 表格列
      col_id: 'ID',
      col_instance: '所属实例',
      col_alarm_type: '告警类型',
      col_device_name: '设备名称',
      col_hostname: '主机名',
      col_ip: 'IP',
      col_alarm_level: '告警级别',
      col_alarm_description: '告警描述',
      col_alarm_detail: '告警详情',
      col_occurrence_time: '发生时间',
      col_notification_status: '通知状态',
      col_operation: '操作',
      col_rule_name: '规则名称',
      col_receiving_channel: '通知渠道',
      col_alarm_channel: '告警渠道',
      col_receiving_user: '接收用户',
      col_receiving_account: '接收账号',
      col_notification_time: '通知时间',
      col_notification_content: '通知内容',
      col_notification_result: '通知结果',
      col_error_message: '错误信息',
      col_status: '状态',
      col_creator: '创建人',
      col_creation_time: '创建时间',
      col_update_time: '更新时间',
      
      // 通知状态
      notify_status_notified: '已通知',
      notify_status_muted: '已屏蔽',
      notify_status_default_rule: '默认规则',
      
      // 通知结果
      notify_result_delivered: '已送达',
      notify_result_failed: '失败',
      
      // 操作按钮
      btn_mute: '屏蔽',
      btn_ai_analysis: 'AI助手分析',
      btn_view_detail: '详细信息',
      
      // AI分析模态框
      modal_title_ai_analysis: 'AI助手分析结果',
      drawer_title_ai_chat: 'AI 助手',
      text_analyzing: '分析中...',
      text_abort_analysis: '中止分析',
      text_close: '关闭',
      text_confirm: '确定',
      confirm_abort_title: '确认中止',
      confirm_abort_content: '是否确认中止当前分析？',
      
      // AI 聊天
      chat_input_placeholder: '输入消息...',
      chat_send: '发送',
      chat_stop: '停止',
      chat_clear: '清空对话',
      chat_user: '我',
      chat_assistant: 'AI 助手',
      chat_alarm_context: '告警上下文',
      confirm_clear_chat_title: '确认清空',
      confirm_clear_chat_content: '是否确认清空所有对话记录？',
      
      // 消息提示
      msg_password_not_configured: '密码没有配置，无法查看图形',
      msg_get_data_failed: '获取数据失败',
      msg_request_failed: '请求失败，请稍后重试',
      msg_analysis_timeout: '分析超时，请稍后重试或缩短分析内容',
      msg_analysis_failed: '分析请求失败',
      
      // 分页
      pagination_total: '共 {total} 条数据',
      
      // 告警规则相关
      rule_name: '规则名称',
      rule_name_placeholder: '策略名称',
      rule_distribution_dimension: '分发维度',
      rule_condition: '条件',
      rule_operator: '运算符',
      rule_value: '值',
      rule_value_placeholder: '请输入值',
      zabbix_instance: 'Zabbix实例',
      notification_channel: '通知渠道',
      notification_user: '通知用户',
      notification_user_placeholder: '请选择接收人',
      receiving_user_group: '接收用户组',
      remark: '备注',
      remark_placeholder: '请输入备注',
      effective_time: '生效时间',
      
      // 告警屏蔽相关
      mute_reason: '屏蔽原因',
      mute_reason_placeholder: '请输入屏蔽原因',
      mute_duration: '屏蔽时长',
      mute_condition: '屏蔽条件',
      mute_channel: '屏蔽渠道',
      start_time: '开始时间',
      end_time: '结束时间',
      
      // 确认对话框
      confirm_delete_title: '确定要删除吗?',
      confirm_delete_ok: '确定',
      confirm_delete_cancel: '取消',
      
      // 模态框标题
      modal_title_add_rule: '新增分发规则',
      modal_title_edit_rule: '编辑分发规则',
      
      // 告警分析
      analysis_select_instance: '选择实例',
      analysis_all_instances: '全部实例',
      analysis_alarm_time: '告警时间',
      analysis_historical_alarm_top10: '历史告警TOP10',
      analysis_alarm_classification_top: '告警分类TOP',
      
      // 告警规则页面 - a-alert
      alert_multi_instance_title: '多实例告警规则说明',
      alert_multi_instance_desc: '系统已支持多实例数据聚合。在配置告警分发规则时，可以选择一个或多个实例，规则将应用于所选实例的告警。',
      
      // 告警规则页面 - 表格列
      col_name: '名称',
      col_instances: '实例',
      col_distribution_conditions: '分发条件',
      col_distribution_channel: '通知渠道',
      col_receiver: '接收人',
      col_receiver_group: '接收组',
      col_note: '备注',
      col_add_time: '添加时间',
      
      // 告警规则页面 - 状态
      status_enabled: '启用',
      status_disabled: '禁用',
      status_not_selected: '未选择',
      
      // 告警规则页面 - 模态框表单
      form_label_name: '名称',
      form_label_instance: '实例',
      form_label_week: '星期',
      form_label_time_range: '时间段',
      form_label_channel: '通知渠道',
      form_label_receiver: '接收人',
      form_label_receiver_group: '接收组',
      form_label_note: '备注',
      form_label_status: '状态',
      
      form_placeholder_name: '请输入规则名称',
      form_placeholder_instance: '选择告警实例',
      form_placeholder_receiver: '告警接收人',
      form_placeholder_receiver_group: '告警接收组',
      form_placeholder_note: '备注说明',
      
      // 告警规则页面 - 匹配条件
      card_title_match_conditions: '匹配条件',
      card_title_time_channel: '时间与通道',
      card_title_receiver_object: '接收对象',
      
      condition_field: '字段',
      condition_operator: '操作符',
      condition_value: '值',
      condition_placeholder_value: '匹配值',
      
      // 字段选项
      field_host: '主机',
      field_group: '主机组',
      field_item: '指标名称',
      field_key: '指标Key',
      field_trigger: '触发器',
      field_severity: '告警级别',
      
      // 星期选项
      week_sunday: '星期日',
      week_monday: '星期一',
      week_tuesday: '星期二',
      week_wednesday: '星期三',
      week_thursday: '星期四',
      week_friday: '星期五',
      week_saturday: '星期六',
      
      // 通道选项
      channel_mail: '邮件',
      channel_wechat: '企业微信',
      channel_wechat_robot: '企业微信群机器人',
      channel_dingding: '钉钉',
      channel_sms: '短信',
      
      // 按钮
      btn_delete_condition: '删除',
      btn_add_condition: '添加',
      
      // 提示消息
      msg_please_fill_name: '请填写名称',
      msg_please_select_instance: '请选择实例',
      
      // 告警屏蔽页面 (mutes.vue)
      mutes_search_label: '搜索',
      mutes_search_placeholder: '主机名',
      mutes_btn_query: '查询',
      mutes_btn_reset: '重置',
      mutes_btn_add: '新增',
      
      // 表格列
      mutes_col_id: 'ID',
      mutes_col_policy_name: '策略名称',
      mutes_col_instance: '实例',
      mutes_col_mute_condition: '屏蔽条件',
      mutes_col_mute_duration: '屏蔽时长',
      mutes_col_start_time: '开始时间',
      mutes_col_end_time: '结束时间',
      mutes_col_add_time: '添加时间',
      mutes_col_policy_status: '策略状态',
      mutes_col_operation: '操作',
      
      // 时长单位
      duration_day: '天',
      duration_hour: '小时',
      duration_minute: '分钟',
      duration_second: '秒',
      
      // 模态框
      mutes_modal_title_add: '新增规则',
      mutes_modal_title_edit: '编辑规则',
      
      // 表单字段
      mutes_form_name: '名称',
      mutes_form_name_placeholder: '请输入策略名称',
      mutes_form_instance: '实例',
      mutes_form_instance_placeholder: '选择告警实例',
      mutes_form_condition_card_title: '屏蔽条件',
      mutes_form_time_card_title: '时间与通道',
      mutes_form_field: '字段',
      mutes_form_operator: '操作符',
      mutes_form_value: '值',
      mutes_form_value_placeholder: '请输入值',
      mutes_form_operation: '操作',
      mutes_form_start_time: '开始时间',
      mutes_form_duration: '屏蔽时长',
      mutes_form_end_time: '结束时间',
      mutes_form_mute_channels: '屏蔽渠道',
      mutes_form_mute_note: '屏蔽原因',
      mutes_form_mute_note_placeholder: '请输入屏蔽原因',
      
      // 字段选项
      mutes_field_hostname: '主机名',
      mutes_field_hostgroup: '主机组',
      mutes_field_item_name: '指标名称',
      mutes_field_item_key: '指标Key',
      mutes_field_trigger_name: '触发器名称',
      mutes_field_severity: '告警级别',
      
      // 操作符选项
      mutes_operator_equal: '等于',
      mutes_operator_contain: '包含',
      mutes_operator_not_equal: '不等于',
      
      // 时长选项
      mutes_duration_1h: '1小时',
      mutes_duration_2h: '2小时',
      mutes_duration_5h: '5小时',
      mutes_duration_8h: '8小时',
      mutes_duration_12h: '12小时',
      mutes_duration_1d: '1天',
      mutes_duration_2d: '2天',
      mutes_duration_5d: '5天',
      mutes_duration_7d: '7天',
      mutes_duration_14d: '14天',
      mutes_duration_30d: '30天',
      mutes_duration_60d: '60天',
      mutes_duration_90d: '90天',
      mutes_duration_forever: '永久',
      
      // 分页
      mutes_pagination_total: '共 {total} 条数据',
      
      // query.vue 额外翻译
      msg_load_instances_failed: '加载实例列表失败',
      msg_unknown: '未知',
      msg_analysis_prompt: '请分析以下告警详情，说明可能的原因并给出具体的解决方案：',
      msg_unknown_error: '未知错误',
      msg_request_timeout: '请求超时，请稍后重试',
      
      // rule.vue 额外翻译
      msg_save_success: '保存成功',
      msg_save_failed: '保存失败',
    },
    US: {
      // Search form
      label_search: 'Search',
      label_hostname: 'Hostname',
      label_host_ip: 'Host IP',
      label_ip: 'IP',
      label_select_instance: 'Instance',
      label_all_instances: 'All Instances',
      label_alarm_type: 'Type',
      label_alarm_level: 'Severity',
      label_creation_time: 'Creation Time',
      label_effective_time: 'Effective Time',
      label_start_end: 'Start-End',
      btn_query: 'Query',
      btn_reset: 'Reset',
      btn_export: 'Export',
      btn_submit: 'Submit',
      btn_save: 'Save',
      btn_cancel: 'Cancel',
      btn_back: 'Back',
      btn_delete: 'Delete',
      btn_edit: 'Edit',
      btn_add: 'Add',
      
      // Alarm types
      alarm_type_alarm: 'Alarm',
      alarm_type_recovery: 'Recovery',
      
      // Alarm levels
      level_unclassified: 'Unclassified',
      level_information: 'Information',
      level_warning: 'Warning',
      level_average: 'Average',
      level_high: 'High',
      level_disaster: 'Disaster',
      
      // Table columns
      col_id: 'ID',
      col_instance: 'Instance',
      col_alarm_type: 'Type',
      col_device_name: 'Device Name',
      col_hostname: 'Hostname',
      col_ip: 'IP',
      col_alarm_level: 'Severity',
      col_alarm_description: 'Description',
      col_alarm_detail: 'Detail',
      col_occurrence_time: 'Occurrence',
      col_notification_status: 'Notification Status',
      col_operation: 'Operation',
      col_rule_name: 'Rule Name',
      col_receiving_channel: 'Notification Channel',
      col_alarm_channel: 'Alarm Channel',
      col_receiving_user: 'Receiving User',
      col_receiving_account: 'Receiving Account',
      col_notification_time: 'Notification Time',
      col_notification_content: 'Notification Content',
      col_notification_result: 'Notification Result',
      col_error_message: 'Error Message',
      col_status: 'Status',
      col_creator: 'Creator',
      col_creation_time: 'Creation Time',
      col_update_time: 'Update Time',
      
      // Notification status
      notify_status_notified: 'Notified',
      notify_status_muted: 'Muted',
      notify_status_default_rule: 'Default Rule',
      
      // Notification result
      notify_result_delivered: 'Delivered',
      notify_result_failed: 'Failed',
      
      // Operation buttons
      btn_mute: 'Mute',
      btn_ai_analysis: 'AI Assistant',
      btn_view_detail: 'Detail',
      
      // AI analysis modal
      modal_title_ai_analysis: 'AI Assistant Analysis Result',
      drawer_title_ai_chat: 'AI Assistant',
      text_analyzing: 'Analyzing...',
      text_abort_analysis: 'Abort Analysis',
      text_close: 'Close',
      text_confirm: 'Confirm',
      confirm_abort_title: 'Confirm Abort',
      confirm_abort_content: 'Are you sure to abort the current analysis?',
      
      // AI Chat
      chat_input_placeholder: 'Type a message...',
      chat_send: 'Send',
      chat_stop: 'Stop',
      chat_clear: 'Clear Chat',
      chat_user: 'You',
      chat_assistant: 'AI Assistant',
      chat_alarm_context: 'Alarm Context',
      confirm_clear_chat_title: 'Confirm Clear',
      confirm_clear_chat_content: 'Are you sure to clear all chat history?',
      
      // Messages
      msg_password_not_configured: 'Password Not Configured, Cannot View Graph',
      msg_get_data_failed: 'Failed to Get Data',
      msg_request_failed: 'Request Failed, Please Try Again Later',
      msg_analysis_timeout: 'Analysis Timeout, Please Try Again Later or Shorten Analysis Content',
      msg_analysis_failed: 'Analysis Request Failed',
      
      // Pagination
      pagination_total: 'Total {total} Items',
      
      // Alarm rule related
      rule_name: 'Rule Name',
      rule_name_placeholder: 'Name',
      rule_distribution_dimension: 'Distribution Dimension',
      rule_condition: 'Condition',
      rule_operator: 'Operator',
      rule_value: 'Value',
      rule_value_placeholder: 'Please Enter Value',
      zabbix_instance: 'Zabbix Instance',
      notification_channel: 'Notification Channel',
      notification_user: 'Notification User',
      notification_user_placeholder: 'Please Select Recipient',
      receiving_user_group: 'Receiving User Group',
      remark: 'Remark',
      remark_placeholder: 'Please Enter Remark',
      effective_time: 'Effective Time',
      
      // Alarm mute related
      mute_reason: 'Reason',
      mute_reason_placeholder: 'Please Enter Mute Reason',
      mute_duration: 'Duration',
      mute_condition: 'Condition',
      mute_channel: 'Mute Channel',
      start_time: 'Time',
      end_time: 'End Time',
      
      // Confirm dialog
      confirm_delete_title: 'Are You Sure to Delete?',
      confirm_delete_ok: 'Confirm',
      confirm_delete_cancel: 'Cancel',
      
      // Modal titles
      modal_title_add_rule: 'Add Distribution Rule',
      modal_title_edit_rule: 'Edit Distribution Rule',
      
      // Alarm analysis
      analysis_select_instance: 'Select Instance',
      analysis_all_instances: 'All Instances',
      analysis_alarm_time: 'Alarm Time',
      analysis_historical_alarm_top10: 'Historical Alarm TOP10',
      analysis_alarm_classification_top: 'Alarm Classification TOP',
      
      // Alarm rule page - a-alert
      alert_multi_instance_title: 'Multi-Instance Alarm Rule Description',
      alert_multi_instance_desc: 'The system now supports multi-instance data aggregation. When configuring alarm distribution rules, you can select one or more instances, and the rule will apply to alarms from the selected instances.',
      
      // Alarm rule page - Table columns
      col_name: 'Name',
      col_instances: 'Instances',
      col_distribution_conditions: 'Conditions',
      col_distribution_channel: 'Notification Channel',
      col_receiver: 'User',
      col_receiver_group: 'Group',
      col_note: 'Note',
      col_add_time: 'Created',
      
      // Alarm rule page - Status
      status_enabled: 'Enabled',
      status_disabled: 'Disabled',
      status_not_selected: 'Not Selected',
      
      // Alarm rule page - Modal form
      form_label_name: 'Name',
      form_label_instance: 'Instance',
      form_label_week: 'Week',
      form_label_time_range: 'Time Range',
      form_label_channel: 'Notification Channel',
      form_label_receiver: 'User',
      form_label_receiver_group: 'Group',
      form_label_note: 'Note',
      form_label_status: 'Status',
      
      form_placeholder_name: 'Please Enter Rule Name',
      form_placeholder_instance: 'Select Alarm Instance',
      form_placeholder_receiver: 'Alarm Receiver',
      form_placeholder_receiver_group: 'Group',
      form_placeholder_note: 'Note Description',
      
      // Alarm rule page - Match conditions
      card_title_match_conditions: 'Conditions',
      card_title_time_channel: 'Duration & Channel',
      card_title_receiver_object: 'Receiver Object',
      
      condition_field: 'Field',
      condition_operator: 'Operator',
      condition_value: 'Value',
      condition_placeholder_value: 'Match Value',
      
      // Field options
      field_host: 'Host',
      field_group: 'Host Group',
      field_item: 'Item Name',
      field_key: 'Item Key',
      field_trigger: 'Trigger',
      field_severity: 'Severity',
      
      // Week options
      week_sunday: 'Sunday',
      week_monday: 'Monday',
      week_tuesday: 'Tuesday',
      week_wednesday: 'Wednesday',
      week_thursday: 'Thursday',
      week_friday: 'Friday',
      week_saturday: 'Saturday',
      
      // Channel options
      channel_mail: 'Email',
      channel_wechat: 'WeChat',
      channel_wechat_robot: 'WeChat Work Group Robot',
      channel_dingding: 'DingTalk',
      channel_sms: 'SMS',
      
      // Buttons
      btn_delete_condition: 'Delete',
      btn_add_condition: 'Add',
      
      // Messages
      msg_please_fill_name: 'Please Fill in Name',
      msg_please_select_instance: 'Please Select Instance',
      
      // Alarm mute page (mutes.vue)
      mutes_search_label: 'Search',
      mutes_search_placeholder: 'Hostname',
      mutes_btn_query: 'Query',
      mutes_btn_reset: 'Reset',
      mutes_btn_add: 'Add',
      
      // Table columns
      mutes_col_id: 'ID',
      mutes_col_policy_name: 'Name',
      mutes_col_instance: 'Instance',
      mutes_col_mute_condition: 'Condition',
      mutes_col_mute_duration: 'Duration',
      mutes_col_start_time: 'Start',
      mutes_col_end_time: 'End',
      mutes_col_add_time: 'Created',
      mutes_col_policy_status: 'Status',
      mutes_col_operation: 'Operation',
      
      // Duration units
      duration_day: 'Day',
      duration_hour: 'Hour',
      duration_minute: 'Minute',
      duration_second: 'Second',
      
      // Modal
      mutes_modal_title_add: 'Add Rule',
      mutes_modal_title_edit: 'Edit Rule',
      
      // Form fields
      mutes_form_name: 'Name',
      mutes_form_name_placeholder: 'Please Enter Policy Name',
      mutes_form_instance: 'Instance',
      mutes_form_instance_placeholder: 'Select Alarm Instance',
      mutes_form_condition_card_title: 'Condition',
      mutes_form_time_card_title: 'Duration & Channel',
      mutes_form_field: 'Field',
      mutes_form_operator: 'Operator',
      mutes_form_value: 'Value',
      mutes_form_value_placeholder: 'Please Enter Value',
      mutes_form_operation: 'Operation',
      mutes_form_start_time: 'Start',
      mutes_form_duration: 'Duration',
      mutes_form_end_time: 'Time',
      mutes_form_mute_channels: 'Mute Channels',
      mutes_form_mute_note: 'Reason',
      mutes_form_mute_note_placeholder: 'Please Enter Mute Reason',
      
      // Field options
      mutes_field_hostname: 'Hostname',
      mutes_field_hostgroup: 'Host Group',
      mutes_field_item_name: 'Item Name',
      mutes_field_item_key: 'Item Key',
      mutes_field_trigger_name: 'Trigger Name',
      mutes_field_severity: 'Severity',
      
      // Operator options
      mutes_operator_equal: 'Equal',
      mutes_operator_contain: 'Contain',
      mutes_operator_not_equal: 'Not Equal',
      
      // Duration options
      mutes_duration_1h: '1 Hour',
      mutes_duration_2h: '2 Hours',
      mutes_duration_5h: '5 Hours',
      mutes_duration_8h: '8 Hours',
      mutes_duration_12h: '12 Hours',
      mutes_duration_1d: '1 Day',
      mutes_duration_2d: '2 Days',
      mutes_duration_5d: '5 Days',
      mutes_duration_7d: '7 Days',
      mutes_duration_14d: '14 Days',
      mutes_duration_30d: '30 Days',
      mutes_duration_60d: '60 Days',
      mutes_duration_90d: '90 Days',
      mutes_duration_forever: 'Forever',
      
      // Pagination
      mutes_pagination_total: 'Total {total} Items',
      
      // query.vue additional translations
      msg_load_instances_failed: 'Failed to Load Instance List',
      msg_unknown: 'Unknown',
      msg_analysis_prompt: 'Please analyze the following alarm details, explain possible causes and provide specific solutions:',
      msg_unknown_error: 'Unknown Error',
      msg_request_timeout: 'Request Timeout, Please Try Again Later',
      
      // rule.vue additional translations
      msg_save_success: 'Save Successful',
      msg_save_failed: 'Save Failed',
    },
    HK: {
      // 搜索表單
      label_search: '搜索',
      label_hostname: '主機名',
      label_host_ip: '主機IP',
      label_ip: 'IP',
      label_select_instance: '選擇實例',
      label_all_instances: '全部實例',
      label_alarm_type: '告警類型',
      label_alarm_level: '告警級別',
      label_creation_time: '創建時間',
      label_effective_time: '生效時間',
      label_start_end: '開始-結束',
      btn_query: '查詢',
      btn_reset: '重置',
      btn_export: '導出',
      btn_submit: '提交',
      btn_save: '保存',
      btn_cancel: '取消',
      btn_back: '返回',
      btn_delete: '刪除',
      btn_edit: '編輯',
      btn_add: '新增',
      
      // 告警類型
      alarm_type_alarm: '告警',
      alarm_type_recovery: '恢復',
      
      // 告警級別
      level_unclassified: '未分類',
      level_information: '信息',
      level_warning: '警告',
      level_average: '一般',
      level_high: '嚴重',
      level_disaster: '災難',
      
      // 表格列
      col_id: 'ID',
      col_instance: '所屬實例',
      col_alarm_type: '告警類型',
      col_device_name: '設備名稱',
      col_hostname: '主機名',
      col_ip: 'IP',
      col_alarm_level: '告警級別',
      col_alarm_description: '告警描述',
      col_alarm_detail: '告警詳情',
      col_occurrence_time: '發生時間',
      col_notification_status: '通知狀態',
      col_operation: '操作',
      col_rule_name: '規則名稱',
      col_receiving_channel: '通知渠道',
      col_alarm_channel: '告警渠道',
      col_receiving_user: '接收用戶',
      col_receiving_account: '接收賬號',
      col_notification_time: '通知時間',
      col_notification_content: '通知內容',
      col_notification_result: '通知結果',
      col_error_message: '錯誤信息',
      col_status: '狀態',
      col_creator: '創建人',
      col_creation_time: '創建時間',
      col_update_time: '更新時間',
      
      // 通知狀態
      notify_status_notified: '已通知',
      notify_status_muted: '已屏蔽',
      notify_status_default_rule: '默認規則',
      
      // 通知結果
      notify_result_delivered: '已送達',
      notify_result_failed: '失敗',
      
      // 操作按鈕
      btn_mute: '屏蔽',
      btn_ai_analysis: 'AI助手分析',
      btn_view_detail: '詳細信息',
      
      // AI分析模態框
      modal_title_ai_analysis: 'AI助手分析結果',
      drawer_title_ai_chat: 'AI 助手',
      text_analyzing: '分析中...',
      text_abort_analysis: '中止分析',
      text_close: '關閉',
      text_confirm: '確定',
      confirm_abort_title: '確認中止',
      confirm_abort_content: '是否確認中止當前分析？',
      
      // AI 聊天
      chat_input_placeholder: '輸入消息...',
      chat_send: '發送',
      chat_stop: '停止',
      chat_clear: '清空對話',
      chat_user: '我',
      chat_assistant: 'AI 助手',
      chat_alarm_context: '告警上下文',
      confirm_clear_chat_title: '確認清空',
      confirm_clear_chat_content: '是否確認清空所有對話記錄？',
      
      // 消息提示
      msg_password_not_configured: '密碼沒有配置，無法查看圖形',
      msg_get_data_failed: '獲取數據失敗',
      msg_request_failed: '請求失敗，請稍後重試',
      msg_analysis_timeout: '分析超時，請稍後重試或縮短分析內容',
      msg_analysis_failed: '分析請求失敗',
      
      // 分頁
      pagination_total: '共 {total} 條數據',
      
      // 告警規則相關
      rule_name: '規則名稱',
      rule_name_placeholder: '策略名稱',
      rule_distribution_dimension: '分發維度',
      rule_condition: '條件',
      rule_operator: '運算符',
      rule_value: '值',
      rule_value_placeholder: '請輸入值',
      zabbix_instance: 'Zabbix實例',
      notification_channel: '通知渠道',
      notification_user: '通知用戶',
      notification_user_placeholder: '請選擇接收人',
      receiving_user_group: '接收用戶組',
      remark: '備註',
      remark_placeholder: '請輸入備註',
      effective_time: '生效時間',
      
      // 告警屏蔽相關
      mute_reason: '屏蔽原因',
      mute_reason_placeholder: '請輸入屏蔽原因',
      mute_duration: '屏蔽時長',
      mute_condition: '屏蔽條件',
      mute_channel: '屏蔽渠道',
      start_time: '開始時間',
      end_time: '結束時間',
      
      // 確認對話框
      confirm_delete_title: '確定要刪除嗎?',
      confirm_delete_ok: '確定',
      confirm_delete_cancel: '取消',
      
      // 模態框標題
      modal_title_add_rule: '新增分發規則',
      modal_title_edit_rule: '編輯分發規則',
      
      // 告警分析
      analysis_select_instance: '選擇實例',
      analysis_all_instances: '全部實例',
      analysis_alarm_time: '告警時間',
      analysis_historical_alarm_top10: '歷史告警TOP10',
      analysis_alarm_classification_top: '告警分類TOP',
      
      // 告警規則頁面 - a-alert
      alert_multi_instance_title: '多實例告警規則說明',
      alert_multi_instance_desc: '系統已支持多實例數據聚合。在配置告警分發規則時，可以選擇一個或多個實例，規則將應用於所選實例的告警。',
      
      // 告警規則頁面 - 表格列
      col_name: '名稱',
      col_instances: '實例',
      col_distribution_conditions: '分發條件',
      col_distribution_channel: '通知渠道',
      col_receiver: '接收人',
      col_receiver_group: '接收組',
      col_note: '備註',
      col_add_time: '添加時間',
      
      // 告警規則頁面 - 狀態
      status_enabled: '啟用',
      status_disabled: '禁用',
      status_not_selected: '未選擇',
      
      // 告警規則頁面 - 模態框表單
      form_label_name: '名稱',
      form_label_instance: '實例',
      form_label_week: '星期',
      form_label_time_range: '時間段',
      form_label_channel: '通知渠道',
      form_label_receiver: '接收人',
      form_label_receiver_group: '接收組',
      form_label_note: '備註',
      form_label_status: '狀態',
      
      form_placeholder_name: '請輸入規則名稱',
      form_placeholder_instance: '選擇告警實例',
      form_placeholder_receiver: '告警接收人',
      form_placeholder_receiver_group: '告警接收組',
      form_placeholder_note: '備註說明',
      
      // 告警規則頁面 - 匹配條件
      card_title_match_conditions: '匹配條件',
      card_title_time_channel: '時間與通道',
      card_title_receiver_object: '接收對象',
      
      condition_field: '字段',
      condition_operator: '操作符',
      condition_value: '值',
      condition_placeholder_value: '匹配值',
      
      // 字段選項
      field_host: '主機',
      field_group: '主機組',
      field_item: '指標名稱',
      field_key: '指標Key',
      field_trigger: '觸發器',
      field_severity: '告警級別',
      
      // 星期選項
      week_sunday: '星期日',
      week_monday: '星期一',
      week_tuesday: '星期二',
      week_wednesday: '星期三',
      week_thursday: '星期四',
      week_friday: '星期五',
      week_saturday: '星期六',
      
      // 通道選項
      channel_mail: '郵件',
      channel_wechat: '企業微信',
      channel_wechat_robot: '企業微信群機器人',
      channel_dingding: '釘釘',
      channel_sms: '短信',
      
      // 按鈕
      btn_delete_condition: '刪除',
      btn_add_condition: '添加',
      
      // 提示消息
      msg_please_fill_name: '請填寫名稱',
      msg_please_select_instance: '請選擇實例',
      
      // 告警屏蔽頁面 (mutes.vue)
      mutes_search_label: '搜索',
      mutes_search_placeholder: '主機名',
      mutes_btn_query: '查詢',
      mutes_btn_reset: '重置',
      mutes_btn_add: '新增',
      
      // 表格列
      mutes_col_id: 'ID',
      mutes_col_policy_name: '策略名稱',
      mutes_col_instance: '實例',
      mutes_col_mute_condition: '屏蔽條件',
      mutes_col_mute_duration: '屏蔽時長',
      mutes_col_start_time: '開始時間',
      mutes_col_end_time: '結束時間',
      mutes_col_add_time: '添加時間',
      mutes_col_policy_status: '策略狀態',
      mutes_col_operation: '操作',
      
      // 時長單位
      duration_day: '天',
      duration_hour: '小時',
      duration_minute: '分鐘',
      duration_second: '秒',
      
      // 模態框
      mutes_modal_title_add: '新增規則',
      mutes_modal_title_edit: '編輯規則',
      
      // 表單字段
      mutes_form_name: '名稱',
      mutes_form_name_placeholder: '請輸入策略名稱',
      mutes_form_instance: '實例',
      mutes_form_instance_placeholder: '選擇告警實例',
      mutes_form_condition_card_title: '屏蔽條件',
      mutes_form_time_card_title: '時間與通道',
      mutes_form_field: '字段',
      mutes_form_operator: '操作符',
      mutes_form_value: '值',
      mutes_form_value_placeholder: '請輸入值',
      mutes_form_operation: '操作',
      mutes_form_start_time: '開始時間',
      mutes_form_duration: '屏蔽時長',
      mutes_form_end_time: '結束時間',
      mutes_form_mute_channels: '屏蔽渠道',
      mutes_form_mute_note: '屏蔽原因',
      mutes_form_mute_note_placeholder: '請輸入屏蔽原因',
      
      // 字段選項
      mutes_field_hostname: '主機名',
      mutes_field_hostgroup: '主機組',
      mutes_field_item_name: '指標名稱',
      mutes_field_item_key: '指標Key',
      mutes_field_trigger_name: '觸發器名稱',
      mutes_field_severity: '告警級別',
      
      // 操作符選項
      mutes_operator_equal: '等於',
      mutes_operator_contain: '包含',
      mutes_operator_not_equal: '不等於',
      
      // 時長選項
      mutes_duration_1h: '1小時',
      mutes_duration_2h: '2小時',
      mutes_duration_5h: '5小時',
      mutes_duration_8h: '8小時',
      mutes_duration_12h: '12小時',
      mutes_duration_1d: '1天',
      mutes_duration_2d: '2天',
      mutes_duration_5d: '5天',
      mutes_duration_7d: '7天',
      mutes_duration_14d: '14天',
      mutes_duration_30d: '30天',
      mutes_duration_60d: '60天',
      mutes_duration_90d: '90天',
      mutes_duration_forever: '永久',
      
      // 分頁
      mutes_pagination_total: '共 {total} 條數據',
      
      // query.vue 額外翻譯
      msg_load_instances_failed: '加載實例列表失敗',
      msg_unknown: '未知',
      msg_analysis_prompt: '請分析以下告警詳情，說明可能的原因並給出具體的解決方案：',
      msg_unknown_error: '未知錯誤',
      msg_request_timeout: '請求超時，請稍後重試',
      
      // rule.vue 額外翻譯
      msg_save_success: '保存成功',
      msg_save_failed: '保存失敗',
    },
  },
};
