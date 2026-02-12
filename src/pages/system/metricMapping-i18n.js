module.exports = {
	messages: {
		CN: {
			// 页面标题和按钮
			page_title: '指标映射配置',
			create_mapping: '新建映射配置',
			edit_mapping: '编辑映射配置',
			
			// 表格列
			table_id: 'ID',
			table_instance_name: '实例名称',
			table_system_type: '系统类型',
			table_auto_init: '自动初始化',
			table_status: '状态',
			table_last_success_at: '最后成功时间',
			table_operation: '操作',
			
			// 系统类型
			system_type_linux: 'Linux',
			system_type_windows: 'Windows',
			system_type_network: '网络设备',
			system_type_server: '服务器',
			
			// 状态
			status_not_initialized: '未初始化',
			status_initialized: '已初始化',
			status_failed: '初始化失败',
			auto_init_enabled: '启用',
			auto_init_disabled: '禁用',
			
			// 表单标签
			form_instance: '实例',
			form_system_type: '系统类型',
			form_host_group: '主机组',
			form_metric_config: '指标配置',
			form_automation_config: '自动化配置',
			form_enable_auto_init: '启用自动初始化',
			form_cron_expression: 'Cron表达式',
			form_new_host_auto_init: '新主机自动初始化',
			form_max_retry: '最大重试次数',
			form_icmp_template: 'ICMP模板',
			
			// 指标名称
			metric_uptime: '运行时间',
			metric_cpu_core: 'CPU核心数',
			metric_cpu_utilization: 'CPU使用率',
			metric_memory_utilization: '内存使用率',
			metric_memory_total: '内存总量',
			metric_memory_used: '内存已用',
			metric_model: '设备型号',
			metric_template: '模板',
			metric_item: '监控项',
			
			// 占位符
			placeholder_select_instance: '请选择实例',
			placeholder_select_system_type: '请选择系统类型',
			placeholder_select_host_group: '请选择主机组',
			placeholder_select_template: '选择模板',
			placeholder_select_item: '选择监控项',
			placeholder_select_icmp_template: '选择ICMP Ping模板',
			placeholder_cron_expression: '例如: 0 0 2 * * * (每天凌晨2点)',
			
			// 提示信息
			tip_cron_format: '格式：秒 分 时 日 月 周',
			tip_select_instance_first: '请先选择实例',
			
			// 按钮
			btn_execute_now: '立即执行',
			btn_edit: '编辑',
			btn_history: '历史',
			btn_delete: '删除',
			btn_save: '保存',
			btn_cancel: '取消',
			
			// 确认对话框
			confirm_execute_title: '提示',
			confirm_execute_content: '确定要立即执行此映射配置吗？',
			confirm_delete_title: '提示',
			confirm_delete_content: '确定要删除此映射配置吗？',
			
			// 历史记录
			history_title: '执行历史',
			history_id: 'ID',
			history_exec_type: '执行类型',
			history_start_time: '开始时间',
			history_duration: '耗时(秒)',
			history_status: '状态',
			history_affected_hosts: '影响主机数',
			history_error_message: '错误信息',
			history_total: '共 {total} 条数据',
			
			// 执行类型
			exec_type_manual: '手动',
			exec_type_auto: '自动',
			exec_type_retry: '重试',
			
			// 历史状态
			history_status_success: 'success',
			history_status_failed: 'failed',
			history_status_running: 'running',
			
			// 消息提示
			msg_save_success: '保存成功',
			msg_save_failed: '保存失败',
			msg_delete_success: '删除成功',
			msg_delete_failed: '删除失败',
			msg_execute_submitted: '执行任务已提交',
			msg_execute_failed: '执行失败',
			msg_get_detail_failed: '获取配置详情失败',
			msg_get_mappings_failed: '获取映射配置失败',
			msg_get_instances_failed: '获取实例列表失败',
			msg_get_host_groups_failed: '获取主机组列表失败',
			msg_get_templates_failed: '获取模板列表失败',
			msg_get_items_failed: '获取监控项列表失败',
			msg_get_history_failed: '获取历史记录失败',
			msg_parse_config_failed: '解析配置失败',
			
			// 表单验证
			validate_instance_required: '请选择实例',
			validate_system_type_required: '请选择系统类型',

			// 规则管理相关
			rule_management: '规则管理',
			btn_sync_template: '按模板同步',
			rule_table_name: '规则名称',
			rule_target_field: '目标字段',
			rule_match_type: '匹配方式',
			rule_match_value: '匹配值',
			rule_priority: '优先级',
			rule_status: '状态',
			rule_builtin: '内置',
			rule_scope_instances: '适用实例',
			rule_scope_templates: '适用模板',
			rule_type_key: 'Key完全匹配',
			rule_type_name: '名称包含',
			rule_type_regex: '正则匹配',
			placeholder_rule_name: '请输入规则名称',
			placeholder_match_value: '请输入匹配值或正则表达式',
			placeholder_select_target_field: '请选择目标字段',
			placeholder_all_instances: '全部实例',
			placeholder_all_templates: '全部模板',
			msg_sync_submitted: '模板同步任务已提交',
			msg_sync_failed: '模板同步提交失败',
			confirm_sync_template_title: '按模板同步',
			confirm_sync_template_content: '确定要根据当前规则对所有模板执行自动指标绑定吗？这会直接修改模板配置并影响关联主机。',
		},
		HK: {
			// 頁面標題和按鈕
			page_title: '指標映射配置',
			create_mapping: '新建映射配置',
			edit_mapping: '編輯映射配置',
			
			// 表格列
			table_id: 'ID',
			table_instance_name: '實例名稱',
			table_system_type: '系統類型',
			table_auto_init: '自動初始化',
			table_status: '狀態',
			table_last_success_at: '最後成功時間',
			table_operation: '操作',
			
			// 系統類型
			system_type_linux: 'Linux',
			system_type_windows: 'Windows',
			system_type_network: '網絡設備',
			system_type_server: '服務器',
			
			// 狀態
			status_not_initialized: '未初始化',
			status_initialized: '已初始化',
			status_failed: '初始化失敗',
			auto_init_enabled: '啟用',
			auto_init_disabled: '禁用',
			
			// 表單標籤
			form_instance: '實例',
			form_system_type: '系統類型',
			form_host_group: '主機組',
			form_metric_config: '指標配置',
			form_automation_config: '自動化配置',
			form_enable_auto_init: '啟用自動初始化',
			form_cron_expression: 'Cron表達式',
			form_new_host_auto_init: '新主機自動初始化',
			form_max_retry: '最大重試次數',
			form_icmp_template: 'ICMP模板',
			
			// 指標名稱
			metric_uptime: '運行時間',
			metric_cpu_core: 'CPU核心數',
			metric_cpu_utilization: 'CPU使用率',
			metric_memory_utilization: '內存使用率',
			metric_memory_total: '內存總量',
			metric_memory_used: '內存已用',
			metric_model: '設備型號',
			metric_template: '模板',
			metric_item: '監控項',
			
			// 佔位符
			placeholder_select_instance: '請選擇實例',
			placeholder_select_system_type: '請選擇系統類型',
			placeholder_select_host_group: '請選擇主機組',
			placeholder_select_template: '選擇模板',
			placeholder_select_item: '選擇監控項',
			placeholder_select_icmp_template: '選擇ICMP Ping模板',
			placeholder_cron_expression: '例如: 0 0 2 * * * (每天凌晨2點)',
			
			// 提示信息
			tip_cron_format: '格式：秒 分 時 日 月 周',
			tip_select_instance_first: '請先選擇實例',
			
			// 按鈕
			btn_execute_now: '立即執行',
			btn_edit: '編輯',
			btn_history: '歷史',
			btn_delete: '刪除',
			btn_save: '保存',
			btn_cancel: '取消',
			
			// 確認對話框
			confirm_execute_title: '提示',
			confirm_execute_content: '確定要立即執行此映射配置嗎？',
			confirm_delete_title: '提示',
			confirm_delete_content: '確定要刪除此映射配置嗎？',
			
			// 歷史記錄
			history_title: '執行歷史',
			history_id: 'ID',
			history_exec_type: '執行類型',
			history_start_time: '開始時間',
			history_duration: '耗時(秒)',
			history_status: '狀態',
			history_affected_hosts: '影響主機數',
			history_error_message: '錯誤信息',
			history_total: '共 {total} 條數據',
			
			// 執行類型
			exec_type_manual: '手動',
			exec_type_auto: '自動',
			exec_type_retry: '重試',
			
			// 歷史狀態
			history_status_success: 'success',
			history_status_failed: 'failed',
			history_status_running: 'running',
			
			// 消息提示
			msg_save_success: '保存成功',
			msg_save_failed: '保存失敗',
			msg_delete_success: '刪除成功',
			msg_delete_failed: '刪除失敗',
			msg_execute_submitted: '執行任務已提交',
			msg_execute_failed: '執行失敗',
			msg_get_detail_failed: '獲取配置詳情失敗',
			msg_get_mappings_failed: '獲取映射配置失敗',
			msg_get_instances_failed: '獲取實例列表失敗',
			msg_get_host_groups_failed: '獲取主機組列表失敗',
			msg_get_templates_failed: '獲取模板列表失敗',
			msg_get_items_failed: '獲取監控項列表失敗',
			msg_get_history_failed: '獲取歷史記錄失敗',
			msg_parse_config_failed: '解析配置失敗',
			
			// 表單驗證
			validate_instance_required: '請選擇實例',
			validate_system_type_required: '請選擇系統類型',
		},
		US: {
			// Page title and buttons
			page_title: 'Metric Mapping Configuration',
			create_mapping: 'Create',
			edit_mapping: 'Edit',
			
			// Table columns
			table_id: 'ID',
			table_instance_name: 'Instance',
			table_system_type: 'Type',
			table_auto_init: 'Auto Initialize',
			table_status: 'Status',
			table_last_success_at: 'Last Success',
			table_operation: 'Operation',
			
			// System types
			system_type_linux: 'Linux',
			system_type_windows: 'Windows',
			system_type_network: 'Network Device',
			system_type_server: 'Server',
			
			// Status
			status_not_initialized: 'Not Initialized',
			status_initialized: 'Initialized',
			status_failed: 'Initialization Failed',
			auto_init_enabled: 'Enabled',
			auto_init_disabled: 'Disabled',
			
			// Form labels
			form_instance: 'Instance',
			form_system_type: 'Type',
			form_host_group: 'Host Group',
			form_metric_config: 'Metric Configuration',
			form_automation_config: 'Automation Configuration',
			form_enable_auto_init: 'Enable Auto Initialize',
			form_cron_expression: 'Cron Expression',
			form_new_host_auto_init: 'Auto Initialize New Hosts',
			form_max_retry: 'Max Retry Count',
			form_icmp_template: 'ICMP Template',
			
			// Metric names
			metric_uptime: 'Uptime',
			metric_cpu_core: 'CPU Cores',
			metric_cpu_utilization: 'CPU Utilization',
			metric_memory_utilization: 'Memory Utilization',
			metric_memory_total: 'Total Memory',
			metric_memory_used: 'Used Memory',
			metric_model: 'Device Model',
			metric_template: 'Template',
			metric_item: 'Item',
			
			// Placeholders
			placeholder_select_instance: 'Select instance',
			placeholder_select_system_type: 'Select system type',
			placeholder_select_host_group: 'Select host group',
			placeholder_select_template: 'Select template',
			placeholder_select_item: 'Select item',
			placeholder_select_icmp_template: 'Select ICMP Ping template',
			placeholder_cron_expression: 'e.g.: 0 0 2 * * * (2 AM daily)',
			
			// Tips
			tip_cron_format: 'Format: second minute hour day month weekday',
			tip_select_instance_first: 'Please select instance first',
			
			// Buttons
			btn_execute_now: 'Execute Now',
			btn_edit: 'Edit',
			btn_history: 'Log',
			btn_delete: 'Delete',
			btn_save: 'Save',
			btn_cancel: 'Cancel',
			
			// Confirm dialogs
			confirm_execute_title: 'Confirm',
			confirm_execute_content: 'Are you sure you want to execute this mapping configuration now?',
			confirm_delete_title: 'Confirm',
			confirm_delete_content: 'Are you sure you want to delete this mapping configuration?',
			
			// History
			history_title: 'Execution History',
			history_id: 'ID',
			history_exec_type: 'Execution Type',
			history_start_time: 'Start Time',
			history_duration: 'Duration (s)',
			history_status: 'Status',
			history_affected_hosts: 'Affected Hosts',
			history_error_message: 'Error Message',
			history_total: 'Total {total} records',
			
			// Execution types
			exec_type_manual: 'Manual',
			exec_type_auto: 'Auto',
			exec_type_retry: 'Retry',
			
			// History status
			history_status_success: 'success',
			history_status_failed: 'failed',
			history_status_running: 'running',
			
			// Messages
			msg_save_success: 'Saved successfully',
			msg_save_failed: 'Save failed',
			msg_delete_success: 'Deleted successfully',
			msg_delete_failed: 'Delete failed',
			msg_execute_submitted: 'Execution task submitted',
			msg_execute_failed: 'Execution failed',
			msg_get_detail_failed: 'Failed to get configuration details',
			msg_get_mappings_failed: 'Failed to get mapping configurations',
			msg_get_instances_failed: 'Failed to get instance list',
			msg_get_host_groups_failed: 'Failed to get host group list',
			msg_get_templates_failed: 'Failed to get template list',
			msg_get_items_failed: 'Failed to get item list',
			msg_get_history_failed: 'Failed to get history records',
			msg_parse_config_failed: 'Failed to parse configuration',
			
			// Form validation
			validate_instance_required: 'Please select instance',
			validate_system_type_required: 'Please select system type',
		},
	},
}
