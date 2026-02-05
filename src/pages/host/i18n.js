module.exports = {
  messages: {
    CN: {
      // 搜索表单
      label_hostname: '主机名',
      label_search: '搜索',
      label_model: '型号',
      label_ip: 'IP',
      label_ipmi: 'IPMI',
      label_management_address: '管理地址',
      label_collection_status: '采集状态',
      btn_query: '查询',
      btn_reset: '重置',
      btn_export: '导出',
      
      // 采集状态选项
      status_normal: '正常',
      status_abnormal: '异常',
      status_unknown: '未知',
      
      // 表格列
      col_hostid: '主机ID',
      col_hostname: '主机名',
      col_instance: '所属实例',
      col_model: '型号',
      col_serial_no: '序列号',
      col_os: '操作系统',
      col_management_address: '管理地址',
      col_ipmi_address: 'IPMI地址',
      col_location: '位置',
      col_device_location: '设备位置',
      col_ip_address: 'IP地址',
      col_ipmi: 'IPMI',
      col_kernel_version: '内核版本',
      col_os_version: '系统版本',
      col_uptime: '运行时长',
      col_cpu_usage: 'CPU使用率',
      col_memory_usage: '内存使用率',
      col_disk_usage: '磁盘使用率',
      col_ping: 'Ping(Sec/Loss)',
      col_collection_status: '采集状态',
      col_operation: '操作',
      
      // 操作按钮
      btn_view_graph: '查看图形',
      btn_view_detail: '详细信息',
      
      // 标签
      tag_unknown: '未知',
      tag_up: 'Up',
      tag_down: 'Down',
      
      // 图形查看模态框
      modal_title_graph: '图形查看',
      label_time: '时间',
      btn_ok: '确定',
      btn_cancel: '取消',
      
      // 空状态
      empty_graph_data: '暂无图形数据',
      
      // 分页
      pagination_total: '共 {total} 条数据',
      
      // 消息提示
      msg_password_not_configured: '密码没有配置，无法查看图形',
      msg_get_graph_failed: '获取图形数据失败',
      msg_request_failed: '请求失败，请稍后重试',
      
      // 设备信息弹窗
      title_device_info: '设备信息',
      label_instance_name: '实例名称',
      label_IP: 'IP地址',
      label_cpu_utilization: 'CPU使用率',
      label_memory_utilization: '内存使用率',
      label_num_errors: '错误数',
      label_num_alarms: '告警数',
      
      // 详情页面
      detail_host_id: '主机ID',
      detail_instance_name: '实例名称',
      detail_cpu_cores: 'CPU核心数',
      detail_type: '类型',
      detail_total_memory: '总内存',
      detail_uptime: '运行时长',
      detail_kernel_version: '内核版本',
      detail_remarks: '备注',
      detail_unknown: '未知',
      
      // 标签页
      tab_runtime_info: '运行信息',
      
      // 卡片标题
      card_cpu_usage: 'CPU使用率',
      card_memory_usage: '内存使用率',
      card_network_packet_loss: '网络丢包',
      card_network_latency: '网络延时',
      card_disk_partitions: '磁盘分区',
      card_network_interfaces: '网卡',
      
      // 磁盘分区表格
      disk_mount_point: '挂载点',
      disk_total_space: '总空间',
      disk_used_space: '已使用',
      disk_space_utilization: '空间使用率',
      disk_inodes_utilization: 'Inodes使用率',
      disk_collection_time: '采集时间',
      
      // 网卡表格
      interface_status: '状态',
      interface_name: '接口名',
      interface_received_traffic: '接收流量(Kbps)',
      interface_sent_traffic: '发送流量(Kbps)',
      interface_in_discarded_errors: '进丢包/错包',
      interface_out_discarded_errors: '出丢包/错包',
      interface_port_speed: '端口速率',
      interface_collection_time: '采集时间',
      interface_operation: '操作',
      interface_detail_btn: '详情',
      
      // 接口详情模态框
      modal_interface_detail: '接口详情',
      modal_time_label: '时间',
      modal_query_btn: '查询',
      modal_reset_btn: '重置',
      modal_close_btn: '关闭',
      
      // 图表标题
      chart_traffic: '流量',
      chart_packet_loss: '丢包',
      chart_error_packets: '错包',
      chart_port_status: '端口状态',
      chart_interface_prefix: '接口',
      
      // 表格列
      table_type: '类型',
      table_min: '最小',
      table_max: '最大',
      table_avg: '平均',
      table_95th_perc_avg: '95th PercAvg',
      
      // 详情按钮
      btn_detail: '详情',
      
      // 模态框
      modal_close: '关闭',
      
      // 表格列标题（硬编码）
      col_mount_point: '挂载点',
      col_total_space: '总空间',
      col_used_space: '已使用',
      col_space_utilization: '空间使用率',
      col_inodes_utilization: 'Inodes使用率',
      col_collection_time: '采集时间',
      col_status: '状态',
      col_interface_name: '接口名',
      col_received_traffic: '接收流量(Kbps)',
      col_sent_traffic: '发送流量(Kbps)',
      col_in_discarded_errors: '进丢包/错包',
      col_out_discarded_errors: '出丢包/错包',
      col_port_speed: '端口速率',
      
      // 图表标题
      chart_interface_traffic: '接口{name}流量',
      chart_interface_packet_loss: '接口{name}丢包',
      chart_interface_error_packets: '接口{name}错误包',
      chart_interface_port_status: '接口{name}端口状态',
      
      // 工具栏
      toolbar_data_view: '数据视图',
      toolbar_close: '关闭',
      toolbar_export_excel: '导出Excel',
      
      // 查询表单
      form_time_label: '时间',
      form_query_btn: '查询',
      form_reset_btn: '重置',
      
      // 图表数据字段名（后端返回的中文字段）
      chart_data_receive_traffic: '接收流量',
      chart_data_send_traffic: '发送流量',
      chart_data_receive_discard: '接收丢弃包',
      chart_data_send_discard: '发送丢弃包',
      chart_data_receive_error: '接收错包',
      chart_data_send_error: '发送错包',
      chart_data_port_status: '端口状态',
      
      // 网络设备详情页
      net_card_basic_info: '主机基本信息',
      net_label_host_id: '主机ID',
      net_label_device_location: '设备位置',
      net_label_department: '所属部门',
      net_label_uptime: '运行时间',
      net_label_install_date: '设备安装时间',
      net_label_expiry_date: '维保到期时间',
      net_label_asset_no: '资产编号',
      net_label_device_model: '设备型号',
      net_label_ip_address: 'IP地址',
      net_label_remarks: '备注',
      net_tab_runtime_info: '运行信息',
      net_tab_interface: '接口',
      net_card_interface_list: '网卡列表',
      net_col_interface_index: '接口索引',
      
      // Windows详情页
      win_card_basic_info: '主机基本信息',
      win_label_host_id: '主机ID',
      win_label_cpu_cores: 'CPU核心数',
      win_label_type: '类型',
      win_label_total_memory: '总内存',
      win_label_os: '操作系统',
      win_label_uptime: '运行时间',
      win_label_remarks: '备注',
      win_tab_runtime_info: '运行信息',
      win_card_disk_usage: '磁盘使用情况',
      win_card_network_card: '网卡',
      win_col_disk: '磁盘',
      win_col_total_space: '总空间',
      win_col_used_space: '已使用',
      win_col_usage_rate: '使用率',
      win_col_collection_time: '采集时间',
      
      // 服务器详情页
      ser_card_basic_info: '主机基本信息',
      ser_label_host_id: '主机ID',
      ser_label_device_location: '设备位置',
      ser_label_department: '部门',
      ser_label_uptime: '运行时间',
      ser_label_device_model: '设备型号',
      ser_label_serial_no: '序列号',
      ser_label_install_date: '设备安装时间',
      ser_label_expiry_date: '维保到期时间',
      ser_label_asset_no: '资产编号',
      ser_label_remarks: '备注',
      ser_tab_runtime_info: '运行信息',
      ser_card_cpu_count: 'CPU数量',
      ser_card_total_memory: '总内存',
      ser_card_total_storage: '总存储',
      ser_card_os: '操作系统',
      ser_unit_core: '核',
      ser_unit_gb: 'G',
      ser_unit_tb: 'T'
    },
    US: {
      // Search form
      label_hostname: 'Hostname',
      label_search: 'Search',
      label_model: 'Model',
      label_ip: 'IP',
      label_ipmi: 'IPMI',
      label_management_address: 'Management Address',
      label_collection_status: 'Collection Status',
      btn_query: 'Query',
      btn_reset: 'Reset',
      btn_export: 'Export',
      
      // Collection status options
      status_normal: 'Normal',
      status_abnormal: 'Abnormal',
      status_unknown: 'Unknown',
      
      // Table columns
      col_hostid: 'Host ID',
      col_hostname: 'Hostname',
      col_instance: 'Instance',
      col_model: 'Model',
      col_serial_no: 'Serial Number',
      col_os: 'Operating System',
      col_management_address: 'Management Address',
      col_ipmi_address: 'IPMI Address',
      col_location: 'Location',
      col_device_location: 'Device Location',
      col_ip_address: 'IP Address',
      col_ipmi: 'IPMI',
      col_kernel_version: 'Kernel Version',
      col_os_version: 'OS Version',
      col_uptime: 'Uptime',
      col_cpu_usage: 'CPU Usage',
      col_memory_usage: 'Memory Usage',
      col_disk_usage: 'Disk Usage',
      col_ping: 'Ping(Sec/Loss)',
      col_collection_status: 'Collection Status',
      col_operation: 'Operation',
      
      // Operation buttons
      btn_view_graph: 'View Graph',
      btn_view_detail: 'View Detail',
      
      // Tags
      tag_unknown: 'Unknown',
      tag_up: 'Up',
      tag_down: 'Down',
      
      // Graph view modal
      modal_title_graph: 'Graph View',
      label_time: 'Time',
      btn_ok: 'OK',
      btn_cancel: 'Cancel',
      
      // Empty state
      empty_graph_data: 'No Graph Data',
      
      // Pagination
      pagination_total: 'Total {total} Items',
      
      // Messages
      msg_password_not_configured: 'Password Not Configured, Cannot View Graph',
      msg_get_graph_failed: 'Failed to Get Graph Data',
      msg_request_failed: 'Request Failed, Please Try Again Later',
      
      // Device info popover
      title_device_info: 'Device Info',
      label_instance_name: 'Instance Name',
      label_IP: 'IP Address',
      label_cpu_utilization: 'CPU Usage',
      label_memory_utilization: 'Memory Usage',
      label_num_errors: 'Errors',
      label_num_alarms: 'Alarms',
      
      // Detail page
      detail_host_id: 'Host ID',
      detail_instance_name: 'Instance Name',
      detail_cpu_cores: 'CPU Cores',
      detail_type: 'Type',
      detail_total_memory: 'Total Memory',
      detail_uptime: 'Uptime',
      detail_kernel_version: 'Kernel Version',
      detail_remarks: 'Remarks',
      detail_unknown: 'Unknown',
      
      // Tabs
      tab_runtime_info: 'Runtime Info',
      
      // Card titles
      card_cpu_usage: 'CPU Usage',
      card_memory_usage: 'Memory Usage',
      card_network_packet_loss: 'Network Packet Loss',
      card_network_latency: 'Network Latency',
      card_disk_partitions: 'Disk Partitions',
      card_network_interfaces: 'Network Interfaces',
      
      // Disk partition table
      disk_mount_point: 'Mount Point',
      disk_total_space: 'Total Space',
      disk_used_space: 'Used Space',
      disk_space_utilization: 'Space Utilization',
      disk_inodes_utilization: 'Inodes Utilization',
      disk_collection_time: 'Collection Time',
      
      // Network interface table
      interface_status: 'Status',
      interface_name: 'Interface Name',
      interface_received_traffic: 'Received Traffic(Kbps)',
      interface_sent_traffic: 'Sent Traffic(Kbps)',
      interface_in_discarded_errors: 'In Discarded/Errors',
      interface_out_discarded_errors: 'Out Discarded/Errors',
      interface_port_speed: 'Port Speed',
      interface_collection_time: 'Collection Time',
      interface_operation: 'Operation',
      interface_detail_btn: 'Detail',
      
      // Interface detail modal
      modal_interface_detail: 'Interface Detail',
      modal_time_label: 'Time',
      modal_query_btn: 'Query',
      modal_reset_btn: 'Reset',
      modal_close_btn: 'Close',
      
      // Chart titles
      chart_traffic: 'Traffic',
      chart_packet_loss: 'Packet Loss',
      chart_error_packets: 'Error Packets',
      chart_port_status: 'Port Status',
      chart_interface_prefix: 'Interface',
      
      // Table columns
      table_type: 'Type',
      table_min: 'Min',
      table_max: 'Max',
      table_avg: 'Avg',
      table_95th_perc_avg: '95th PercAvg',
      
      // Detail button
      btn_detail: 'Detail',
      
      // Modal
      modal_close: 'Close',
      
      // Table column headers (hardcoded)
      col_mount_point: 'Mount Point',
      col_total_space: 'Total Space',
      col_used_space: 'Used Space',
      col_space_utilization: 'Space Utilization',
      col_inodes_utilization: 'Inodes Utilization',
      col_collection_time: 'Collection Time',
      col_status: 'Status',
      col_interface_name: 'Interface Name',
      col_received_traffic: 'Received Traffic(Kbps)',
      col_sent_traffic: 'Sent Traffic(Kbps)',
      col_in_discarded_errors: 'In Discarded/Errors',
      col_out_discarded_errors: 'Out Discarded/Errors',
      col_port_speed: 'Port Speed',
      
      // Chart titles
      chart_interface_traffic: 'Interface {name} Traffic',
      chart_interface_packet_loss: 'Interface {name} Packet Loss',
      chart_interface_error_packets: 'Interface {name} Error Packets',
      chart_interface_port_status: 'Interface {name} Port Status',
      
      // Toolbar
      toolbar_data_view: 'Data View',
      toolbar_close: 'Close',
      toolbar_export_excel: 'Export Excel',
      
      // Query form
      form_time_label: 'Time',
      form_query_btn: 'Query',
      form_reset_btn: 'Reset',
      
      // Chart data field names (Chinese fields returned by backend)
      chart_data_receive_traffic: 'Receive Traffic',
      chart_data_send_traffic: 'Send Traffic',
      chart_data_receive_discard: 'Receive Discarded',
      chart_data_send_discard: 'Send Discarded',
      chart_data_receive_error: 'Receive Errors',
      chart_data_send_error: 'Send Errors',
      chart_data_port_status: 'Port Status',
      
      // Network device detail page
      net_card_basic_info: 'Basic Information',
      net_label_host_id: 'Host ID',
      net_label_device_location: 'Device Location',
      net_label_department: 'Department',
      net_label_uptime: 'Uptime',
      net_label_install_date: 'Installation Date',
      net_label_expiry_date: 'Warranty Expiry Date',
      net_label_asset_no: 'Asset Number',
      net_label_device_model: 'Device Model',
      net_label_ip_address: 'IP Address',
      net_label_remarks: 'Remarks',
      net_tab_runtime_info: 'Runtime Info',
      net_tab_interface: 'Interface',
      net_card_interface_list: 'Interface List',
      net_col_interface_index: 'Interface Index',
      
      // Windows detail page
      win_card_basic_info: 'Basic Information',
      win_label_host_id: 'Host ID',
      win_label_cpu_cores: 'CPU Cores',
      win_label_type: 'Type',
      win_label_total_memory: 'Total Memory',
      win_label_os: 'Operating System',
      win_label_uptime: 'Uptime',
      win_label_remarks: 'Remarks',
      win_tab_runtime_info: 'Runtime Info',
      win_card_disk_usage: 'Disk Usage',
      win_card_network_card: 'Network Card',
      win_col_disk: 'Disk',
      win_col_total_space: 'Total Space',
      win_col_used_space: 'Used Space',
      win_col_usage_rate: 'Usage Rate',
      win_col_collection_time: 'Collection Time',
      
      // Server detail page
      ser_card_basic_info: 'Basic Information',
      ser_label_host_id: 'Host ID',
      ser_label_device_location: 'Device Location',
      ser_label_department: 'Department',
      ser_label_uptime: 'Uptime',
      ser_label_device_model: 'Device Model',
      ser_label_serial_no: 'Serial Number',
      ser_label_install_date: 'Installation Date',
      ser_label_expiry_date: 'Warranty Expiry Date',
      ser_label_asset_no: 'Asset Number',
      ser_label_remarks: 'Remarks',
      ser_tab_runtime_info: 'Runtime Info',
      ser_card_cpu_count: 'CPU Count',
      ser_card_total_memory: 'Total Memory',
      ser_card_total_storage: 'Total Storage',
      ser_card_os: 'Operating System',
      ser_unit_core: 'Core',
      ser_unit_gb: 'G',
      ser_unit_tb: 'T'
    },
    HK: {
      // 搜索表單
      label_hostname: '主機名',
      label_search: '搜索',
      label_model: '型號',
      label_ip: 'IP',
      label_ipmi: 'IPMI',
      label_management_address: '管理地址',
      label_collection_status: '採集狀態',
      btn_query: '查詢',
      btn_reset: '重置',
      btn_export: '導出',
      
      // 採集狀態選項
      status_normal: '正常',
      status_abnormal: '異常',
      status_unknown: '未知',
      
      // 表格列
      col_hostid: '主機ID',
      col_hostname: '主機名',
      col_instance: '所屬實例',
      col_model: '型號',
      col_serial_no: '序列號',
      col_os: '操作系統',
      col_management_address: '管理地址',
      col_ipmi_address: 'IPMI地址',
      col_location: '位置',
      col_device_location: '設備位置',
      col_ip_address: 'IP地址',
      col_ipmi: 'IPMI',
      col_kernel_version: '內核版本',
      col_os_version: '系統版本',
      col_uptime: '運行時長',
      col_cpu_usage: 'CPU使用率',
      col_memory_usage: '內存使用率',
      col_disk_usage: '磁盤使用率',
      col_ping: 'Ping(Sec/Loss)',
      col_collection_status: '採集狀態',
      col_operation: '操作',
      
      // 操作按鈕
      btn_view_graph: '查看圖形',
      btn_view_detail: '詳細信息',
      
      // 標籤
      tag_unknown: '未知',
      tag_up: 'Up',
      tag_down: 'Down',
      
      // 圖形查看模態框
      modal_title_graph: '圖形查看',
      label_time: '時間',
      btn_ok: '確定',
      btn_cancel: '取消',
      
      // 空狀態
      empty_graph_data: '暫無圖形數據',
      
      // 分頁
      pagination_total: '共 {total} 條數據',
      
      // 消息提示
      msg_password_not_configured: '密碼沒有配置，無法查看圖形',
      msg_get_graph_failed: '獲取圖形數據失敗',
      msg_request_failed: '請求失敗，請稍後重試',
      
      // 設備信息彈窗
      title_device_info: '設備信息',
      label_instance_name: '實例名稱',
      label_IP: 'IP地址',
      label_cpu_utilization: 'CPU使用率',
      label_memory_utilization: '內存使用率',
      label_num_errors: '錯誤數',
      label_num_alarms: '告警數',
      
      // 詳情頁面
      detail_host_id: '主機ID',
      detail_instance_name: '實例名稱',
      detail_cpu_cores: 'CPU核心數',
      detail_type: '類型',
      detail_total_memory: '總內存',
      detail_uptime: '運行時長',
      detail_kernel_version: '內核版本',
      detail_remarks: '備註',
      detail_unknown: '未知',
      
      // 標籤頁
      tab_runtime_info: '運行信息',
      
      // 卡片標題
      card_cpu_usage: 'CPU使用率',
      card_memory_usage: '內存使用率',
      card_network_packet_loss: '網絡丟包',
      card_network_latency: '網絡延時',
      card_disk_partitions: '磁盤分區',
      card_network_interfaces: '網卡',
      
      // 磁盤分區表格
      disk_mount_point: '掛載點',
      disk_total_space: '總空間',
      disk_used_space: '已使用',
      disk_space_utilization: '空間使用率',
      disk_inodes_utilization: 'Inodes使用率',
      disk_collection_time: '採集時間',
      
      // 網卡表格
      interface_status: '狀態',
      interface_name: '接口名',
      interface_received_traffic: '接收流量(Kbps)',
      interface_sent_traffic: '發送流量(Kbps)',
      interface_in_discarded_errors: '進丟包/錯包',
      interface_out_discarded_errors: '出丟包/錯包',
      interface_port_speed: '端口速率',
      interface_collection_time: '採集時間',
      interface_operation: '操作',
      interface_detail_btn: '詳情',
      
      // 接口詳情模態框
      modal_interface_detail: '接口詳情',
      modal_time_label: '時間',
      modal_query_btn: '查詢',
      modal_reset_btn: '重置',
      modal_close_btn: '關閉',
      
      // 圖表標題
      chart_traffic: '流量',
      chart_packet_loss: '丟包',
      chart_error_packets: '錯包',
      chart_port_status: '端口狀態',
      chart_interface_prefix: '接口',
      
      // 表格列
      table_type: '類型',
      table_min: '最小',
      table_max: '最大',
      table_avg: '平均',
      table_95th_perc_avg: '95th PercAvg',
      
      // 詳情按鈕
      btn_detail: '詳情',
      
      // 模態框
      modal_close: '關閉',
      
      // 表格列標題（硬編碼）
      col_mount_point: '掛載點',
      col_total_space: '總空間',
      col_used_space: '已使用',
      col_space_utilization: '空間使用率',
      col_inodes_utilization: 'Inodes使用率',
      col_collection_time: '採集時間',
      col_status: '狀態',
      col_interface_name: '接口名',
      col_received_traffic: '接收流量(Kbps)',
      col_sent_traffic: '發送流量(Kbps)',
      col_in_discarded_errors: '進丟包/錯包',
      col_out_discarded_errors: '出丟包/錯包',
      col_port_speed: '端口速率',
      
      // 圖表標題
      chart_interface_traffic: '接口{name}流量',
      chart_interface_packet_loss: '接口{name}丟包',
      chart_interface_error_packets: '接口{name}錯誤包',
      chart_interface_port_status: '接口{name}端口狀態',
      
      // 工具欄
      toolbar_data_view: '數據視圖',
      toolbar_close: '關閉',
      toolbar_export_excel: '導出Excel',
      
      // 查詢表單
      form_time_label: '時間',
      form_query_btn: '查詢',
      form_reset_btn: '重置',
      
      // 圖表數據字段名（後端返回的中文字段）
      chart_data_receive_traffic: '接收流量',
      chart_data_send_traffic: '發送流量',
      chart_data_receive_discard: '接收丟棄包',
      chart_data_send_discard: '發送丟棄包',
      chart_data_receive_error: '接收錯包',
      chart_data_send_error: '發送錯包',
      chart_data_port_status: '端口狀態',
      
      // 網絡設備詳情頁
      net_card_basic_info: '主機基本信息',
      net_label_host_id: '主機ID',
      net_label_device_location: '設備位置',
      net_label_department: '所屬部門',
      net_label_uptime: '運行時間',
      net_label_install_date: '設備安裝時間',
      net_label_expiry_date: '維保到期時間',
      net_label_asset_no: '資產編號',
      net_label_device_model: '設備型號',
      net_label_ip_address: 'IP地址',
      net_label_remarks: '備註',
      net_tab_runtime_info: '運行信息',
      net_tab_interface: '接口',
      net_card_interface_list: '網卡列表',
      net_col_interface_index: '接口索引',
      
      // Windows詳情頁
      win_card_basic_info: '主機基本信息',
      win_label_host_id: '主機ID',
      win_label_cpu_cores: 'CPU核心數',
      win_label_type: '類型',
      win_label_total_memory: '總內存',
      win_label_os: '操作系統',
      win_label_uptime: '運行時長',
      win_label_remarks: '備註',
      win_tab_runtime_info: '運行信息',
      win_card_disk_usage: '磁盤使用情況',
      win_card_network_card: '網卡',
      win_col_disk: '磁盤',
      win_col_total_space: '總空間',
      win_col_used_space: '已使用',
      win_col_usage_rate: '使用率',
      win_col_collection_time: '採集時間',
      
      // 服務器詳情頁
      ser_card_basic_info: '主機基本信息',
      ser_label_host_id: '主機ID',
      ser_label_device_location: '設備位置',
      ser_label_department: '部門',
      ser_label_uptime: '運行時間',
      ser_label_device_model: '設備型號',
      ser_label_serial_no: '序列號',
      ser_label_install_date: '設備安裝時間',
      ser_label_expiry_date: '維保到期時間',
      ser_label_asset_no: '資產編號',
      ser_label_remarks: '備註',
      ser_tab_runtime_info: '運行信息',
      ser_card_cpu_count: 'CPU數量',
      ser_card_total_memory: '總內存',
      ser_card_total_storage: '總存儲',
      ser_card_os: '操作系統',
      ser_unit_core: '核',
      ser_unit_gb: 'G',
      ser_unit_tb: 'T'
    }
  }
}
