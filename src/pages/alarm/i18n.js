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
      col_receiving_channel: '接收渠道',
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
      text_analyzing: '分析中...',
      text_abort_analysis: '中止分析',
      text_close: '关闭',
      text_confirm: '确定',
      confirm_abort_title: '确认中止',
      confirm_abort_content: '是否确认中止当前分析？',
      
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
      mute_channel: '屏蔽通道',
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
    },
    US: {
      // Search form
      label_search: 'Search',
      label_hostname: 'Hostname',
      label_host_ip: 'Host IP',
      label_ip: 'IP',
      label_select_instance: 'Select Instance',
      label_all_instances: 'All Instances',
      label_alarm_type: 'Alarm Type',
      label_alarm_level: 'Alarm Level',
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
      col_alarm_type: 'Alarm Type',
      col_device_name: 'Device Name',
      col_hostname: 'Hostname',
      col_ip: 'IP',
      col_alarm_level: 'Alarm Level',
      col_alarm_description: 'Alarm Description',
      col_alarm_detail: 'Alarm Detail',
      col_occurrence_time: 'Occurrence Time',
      col_notification_status: 'Notification Status',
      col_operation: 'Operation',
      col_rule_name: 'Rule Name',
      col_receiving_channel: 'Receiving Channel',
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
      btn_ai_analysis: 'AI Assistant Analysis',
      btn_view_detail: 'View Detail',
      
      // AI analysis modal
      modal_title_ai_analysis: 'AI Assistant Analysis Result',
      text_analyzing: 'Analyzing...',
      text_abort_analysis: 'Abort Analysis',
      text_close: 'Close',
      text_confirm: 'Confirm',
      confirm_abort_title: 'Confirm Abort',
      confirm_abort_content: 'Are you sure to abort the current analysis?',
      
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
      rule_name_placeholder: 'Policy Name',
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
      mute_reason: 'Mute Reason',
      mute_reason_placeholder: 'Please Enter Mute Reason',
      mute_duration: 'Mute Duration',
      mute_condition: 'Mute Condition',
      mute_channel: 'Mute Channel',
      start_time: 'Start Time',
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
      col_receiving_channel: '接收渠道',
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
      text_analyzing: '分析中...',
      text_abort_analysis: '中止分析',
      text_close: '關閉',
      text_confirm: '確定',
      confirm_abort_title: '確認中止',
      confirm_abort_content: '是否確認中止當前分析？',
      
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
      mute_channel: '屏蔽通道',
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
    },
  },
};
