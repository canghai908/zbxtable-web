const messages = {
  CN: {
    step1_title: '欢迎使用',
    step2_title: '配置Webhook',
    step3_title: '添加Zabbix实例',
    step1_desc: '欢迎使用ZbxTable监控系统！让我们快速完成初始配置。',
    step2_desc: '配置Webhook回调地址，用于接收Zabbix告警信息。',
    step3_desc: '添加Zabbix实例，连接您的Zabbix监控服务器。',
    welcome_message: '首次使用需要完成以下配置',
    checklist_1: '配置Webhook回调地址（系统管理 → 参数配置）',
    checklist_2: '添加Zabbix实例（系统管理 → Zabbix管理）',
    webhook_hint: '请在参数配置页面找到"Webhook回调地址"配置项，点击"获取当前地址"按钮自动填充。',
    webhook_location: '位置：系统管理 → 参数配置 → 系统配置标签页',
    zabbix_hint: '请在Zabbix管理页面点击"新增实例"按钮，填写Zabbix服务器信息并测试连接。',
    zabbix_location: '位置：系统管理 → Zabbix管理',
    next: '下一步',
    previous: '上一步',
    finish: '完成配置',
    skip: '跳过引导',
    skip_confirm_title: '确认跳过引导？',
    skip_confirm_content: '您可以稍后在系统管理中手动完成配置。确定要跳过引导吗？',
    skip_confirm_ok: '确定跳过',
    skip_confirm_cancel: '继续引导'
  },
  HK: {
    step1_title: '歡迎使用',
    step2_title: '配置Webhook',
    step3_title: '添加Zabbix實例',
    step1_desc: '歡迎使用ZbxTable監控系統！讓我們快速完成初始配置。',
    step2_desc: '配置Webhook回調地址，用於接收Zabbix告警信息。',
    step3_desc: '添加Zabbix實例，連接您的Zabbix監控服務器。',
    welcome_message: '首次使用需要完成以下配置',
    checklist_1: '配置Webhook回調地址（系統管理 → 參數配置）',
    checklist_2: '添加Zabbix實例（系統管理 → Zabbix管理）',
    webhook_hint: '請在參數配置頁面找到"Webhook回調地址"配置項，點擊"獲取當前地址"按鈕自動填充。',
    webhook_location: '位置：系統管理 → 參數配置 → 系統配置標籤頁',
    zabbix_hint: '請在Zabbix管理頁面點擊"新增實例"按鈕，填寫Zabbix服務器信息並測試連接。',
    zabbix_location: '位置：系統管理 → Zabbix管理',
    next: '下一步',
    previous: '上一步',
    finish: '完成配置',
    skip: '跳過引導',
    skip_confirm_title: '確認跳過引導？',
    skip_confirm_content: '您可以稍後在系統管理中手動完成配置。確定要跳過引導嗎？',
    skip_confirm_ok: '確定跳過',
    skip_confirm_cancel: '繼續引導'
  },
  US: {
    step1_title: 'Welcome',
    step2_title: 'Configure Webhook',
    step3_title: 'Add Zabbix Instance',
    step1_desc: 'Welcome to ZbxTable Monitoring System! Let\'s complete the initial setup quickly.',
    step2_desc: 'Configure the Webhook callback URL to receive Zabbix alert notifications.',
    step3_desc: 'Add a Zabbix instance to connect to your Zabbix monitoring server.',
    welcome_message: 'First-time setup requires the following configuration',
    checklist_1: 'Configure Webhook callback URL (System → Configuration)',
    checklist_2: 'Add Zabbix instance (System → Zabbix Management)',
    webhook_hint: 'Find the "Webhook Callback URL" configuration item on the Configuration page and click "Get Current URL" button to auto-fill.',
    webhook_location: 'Location: System → Configuration → System Settings Tab',
    zabbix_hint: 'Click the "Add Instance" button on the Zabbix Management page, fill in the Zabbix server information and test the connection.',
    zabbix_location: 'Location: System → Zabbix Management',
    next: 'Next',
    previous: 'Previous',
    finish: 'Finish Setup',
    skip: 'Skip Guide',
    skip_confirm_title: 'Skip the guide?',
    skip_confirm_content: 'You can manually complete the configuration in System Management later. Are you sure you want to skip?',
    skip_confirm_ok: 'Skip',
    skip_confirm_cancel: 'Continue'
  }
}

messages['zh-CN'] = messages.CN
messages['zh-TW'] = messages.HK
messages['en-US'] = messages.US

module.exports = {
  messages
}
