export default {
  'zh-CN': {
    title: 'ZbxTable 安装向导',
    subtitle: '欢迎使用 ZbxTable，请按照以下步骤完成安装配置',
    
    // 步骤
    steps: {
      database: '数据库配置',
      system: '系统配置',
      confirm: '确认配置',
      complete: '完成安装',
    },
    
    // 数据库配置
    database: {
      type: '数据库类型',
      typePlaceholder: '请选择数据库类型',
      host: '数据库地址',
      hostPlaceholder: 'localhost',
      port: '数据库端口',
      name: '数据库名称',
      namePlaceholder: 'zbxtable',
      user: '数据库用户',
      userPlaceholder: 'zbxtable',
      password: '数据库密码',
      passwordPlaceholder: '请输入数据库密码',
      path: '数据库路径',
      pathPlaceholder: './data/zbxtable.db',
      pathHint: 'SQLite 数据库文件路径，支持相对路径和绝对路径。例如：./data/zbxtable.db',
      testConnection: '测试连接',
      testSuccess: '数据库连接成功',
      testFailed: '数据库连接失败',
      testRequired: '请先测试数据库连接',
    },
    
    // 系统配置
    system: {
      httpPort: 'HTTP 端口',
      runMode: '运行模式',
      runModeProd: '生产环境',
      runModeDev: '开发环境',
      runModePlaceholder: '请选择运行模式',
      sessionTimeout: '会话超时(小时)',
    },
    
    // 确认配置
    confirm: {
      title: '请确认以下配置信息',
      description: '请仔细检查配置信息，确认无误后点击开始安装按钮进行安装',
      databaseConfig: '数据库配置',
      systemConfig: '系统配置',
      dbType: '数据库类型',
      dbHost: '数据库地址',
      dbPort: '数据库端口',
      dbName: '数据库名称/路径',
      dbUser: '数据库用户',
      dbPassword: '数据库密码',
      connectionStatus: '连接状态',
      connected: '连接成功',
      notTested: '未测试',
      httpPort: 'HTTP 端口',
      runMode: '运行模式',
      sessionTimeout: '会话超时',
      hours: '小时',
      warning: '提示',
      warningMessage: '安装过程将创建数据库表结构并初始化系统数据，请确保数据库配置正确且有足够的权限。',
    },
    
    // 完成安装
    complete: {
      title: '安装完成！',
      subtitle: '配置文件已生成，数据库已初始化，请重启程序以加载配置',
      restartTitle: '请重启程序以加载配置',
      configGenerated: '配置文件已生成',
      databaseInitialized: '数据库已初始化',
      portChanged: 'HTTP 端口',
      restartCommand: '请使用 systemd 重启程序：',
      restartHint: '重启完成后，点击下方按钮跳转到登录页面',
      defaultAccount: '提示：默认管理员账号 admin，密码 Zbxtable',
      goToLogin: '前往登录页面',
      loginAddress: '登录地址',
    },
    
    // 按钮
    buttons: {
      previous: '上一步',
      next: '下一步',
      install: '开始安装',
      installing: '安装中...',
    },
    
    // 验证消息
    validation: {
      dbTypeRequired: '请选择数据库类型',
      dbHostRequired: '请输入数据库地址',
      dbPortRequired: '请输入数据库端口',
      dbNameRequired: '请输入数据库名称或文件路径',
      dbUserRequired: '请输入数据库用户',
      dbPasswordRequired: '请输入数据库密码',
      httpPortRequired: '请输入 HTTP 端口',
      runModeRequired: '请选择运行模式',
      sessionTimeoutRequired: '请输入会话超时时间',
    },
    
    // 消息提示
    messages: {
      installSuccess: '安装成功！请重启程序以加载配置',
      installFailed: '安装失败',
      checkingStatus: '检查安装状态失败，继续安装流程',
    },
    
    // 语言选择器
    language: {
      zhCN: '简体中文',
      enUS: 'English',
      zhTW: '繁體中文',
    },
  },
  
  'en-US': {
    title: 'ZbxTable Installation Wizard',
    subtitle: 'Welcome to ZbxTable, please follow the steps below to complete the installation',
    
    // Steps
    steps: {
      database: 'Database',
      system: 'System',
      confirm: 'Confirm',
      complete: 'Complete',
    },
    
    // Database Configuration
    database: {
      type: 'Database Type',
      typePlaceholder: 'Please select database type',
      host: 'Database Host',
      hostPlaceholder: 'localhost',
      port: 'Database Port',
      name: 'Database Name',
      namePlaceholder: 'zbxtable',
      user: 'Database User',
      userPlaceholder: 'zbxtable',
      password: 'Database Password',
      passwordPlaceholder: 'Please input database password',
      path: 'Database Path',
      pathPlaceholder: './data/zbxtable.db',
      pathHint: 'SQLite database file path, supports relative and absolute paths. Example: ./data/zbxtable.db',
      testConnection: 'Test Connection',
      testSuccess: 'Database connection successful',
      testFailed: 'Database connection failed',
      testRequired: 'Please test database connection first',
    },
    
    // System Configuration
    system: {
      httpPort: 'HTTP Port',
      runMode: 'Run Mode',
      runModeProd: 'Production',
      runModeDev: 'Development',
      runModePlaceholder: 'Please select run mode',
      sessionTimeout: 'Session Timeout (hours)',
    },
    
    // Confirm Configuration
    confirm: {
      title: 'Please confirm the following configuration',
      description: 'Please check the configuration carefully, and click the install button to proceed',
      databaseConfig: 'Database Configuration',
      systemConfig: 'System Configuration',
      dbType: 'Database Type',
      dbHost: 'Database Host',
      dbPort: 'Database Port',
      dbName: 'Database Name/Path',
      dbUser: 'Database User',
      dbPassword: 'Database Password',
      connectionStatus: 'Connection Status',
      connected: 'Connected',
      notTested: 'Not Tested',
      httpPort: 'HTTP Port',
      runMode: 'Run Mode',
      sessionTimeout: 'Session Timeout',
      hours: 'hours',
      warning: 'Warning',
      warningMessage: 'The installation process will create database tables and initialize system data. Please ensure the database configuration is correct and has sufficient permissions.',
    },
    
    // Complete Installation
    complete: {
      title: 'Installation Complete!',
      subtitle: 'Configuration file has been generated, database has been initialized, please restart the program to load the configuration',
      restartTitle: 'Please restart the program to load the configuration',
      configGenerated: 'Configuration file generated',
      databaseInitialized: 'Database initialized',
      portChanged: 'HTTP Port',
      restartCommand: 'Please use systemd to restart the program:',
      restartHint: 'After restarting, click the button below to go to the login page',
      defaultAccount: 'Tip: Default admin account is admin, password is Zbxtable',
      goToLogin: 'Go to Login Page',
      loginAddress: 'Login Address',
    },
    
    // Buttons
    buttons: {
      previous: 'Previous',
      next: 'Next',
      install: 'Start Installation',
      installing: 'Installing...',
    },
    
    // Validation Messages
    validation: {
      dbTypeRequired: 'Please select database type',
      dbHostRequired: 'Please input database host',
      dbPortRequired: 'Please input database port',
      dbNameRequired: 'Please input database name or file path',
      dbUserRequired: 'Please input database user',
      dbPasswordRequired: 'Please input database password',
      httpPortRequired: 'Please input HTTP port',
      runModeRequired: 'Please select run mode',
      sessionTimeoutRequired: 'Please input session timeout',
    },
    
    // Messages
    messages: {
      installSuccess: 'Installation successful! Please restart the program to load the configuration',
      installFailed: 'Installation failed',
      checkingStatus: 'Failed to check installation status, continue installation process',
    },
    
    // Language Selector
    language: {
      zhCN: '简体中文',
      enUS: 'English',
      zhTW: '繁體中文',
    },
  },
  
  'zh-TW': {
    title: 'ZbxTable 安裝嚮導',
    subtitle: '歡迎使用 ZbxTable，請按照以下步驟完成安裝配置',
    
    // 步驟
    steps: {
      database: '數據庫配置',
      system: '系統配置',
      confirm: '確認配置',
      complete: '完成安裝',
    },
    
    // 數據庫配置
    database: {
      type: '數據庫類型',
      typePlaceholder: '請選擇數據庫類型',
      host: '數據庫地址',
      hostPlaceholder: 'localhost',
      port: '數據庫端口',
      name: '數據庫名稱',
      namePlaceholder: 'zbxtable',
      user: '數據庫用戶',
      userPlaceholder: 'zbxtable',
      password: '數據庫密碼',
      passwordPlaceholder: '請輸入數據庫密碼',
      path: '數據庫路徑',
      pathPlaceholder: './data/zbxtable.db',
      pathHint: 'SQLite 數據庫文件路徑，支持相對路徑和絕對路徑。例如：./data/zbxtable.db',
      testConnection: '測試連接',
      testSuccess: '數據庫連接成功',
      testFailed: '數據庫連接失敗',
      testRequired: '請先測試數據庫連接',
    },
    
    // 系統配置
    system: {
      httpPort: 'HTTP 端口',
      runMode: '運行模式',
      runModeProd: '生產環境',
      runModeDev: '開發環境',
      runModePlaceholder: '請選擇運行模式',
      sessionTimeout: '會話超時(小時)',
    },
    
    // 確認配置
    confirm: {
      title: '請確認以下配置信息',
      description: '請仔細檢查配置信息，確認無誤後點擊開始安裝按鈕進行安裝',
      databaseConfig: '數據庫配置',
      systemConfig: '系統配置',
      dbType: '數據庫類型',
      dbHost: '數據庫地址',
      dbPort: '數據庫端口',
      dbName: '數據庫名稱/路徑',
      dbUser: '數據庫用戶',
      dbPassword: '數據庫密碼',
      connectionStatus: '連接狀態',
      connected: '連接成功',
      notTested: '未測試',
      httpPort: 'HTTP 端口',
      runMode: '運行模式',
      sessionTimeout: '會話超時',
      hours: '小時',
      warning: '提示',
      warningMessage: '安裝過程將創建數據庫表結構並初始化系統數據，請確保數據庫配置正確且有足夠的權限。',
    },
    
    // 完成安裝
    complete: {
      title: '安裝完成！',
      subtitle: '配置文件已生成，數據庫已初始化，請重啟程序以加載配置',
      restartTitle: '請重啟程序以加載配置',
      configGenerated: '配置文件已生成',
      databaseInitialized: '數據庫已初始化',
      portChanged: 'HTTP 端口',
      restartCommand: '請使用 systemd 重啟程序：',
      restartHint: '重啟完成後，點擊下方按鈕跳轉到登錄頁面',
      defaultAccount: '提示：默認管理員賬號 admin，密碼 Zbxtable',
      goToLogin: '前往登錄頁面',
      loginAddress: '登錄地址',
    },
    
    // 按鈕
    buttons: {
      previous: '上一步',
      next: '下一步',
      install: '開始安裝',
      installing: '安裝中...',
    },
    
    // 驗證消息
    validation: {
      dbTypeRequired: '請選擇數據庫類型',
      dbHostRequired: '請輸入數據庫地址',
      dbPortRequired: '請輸入數據庫端口',
      dbNameRequired: '請輸入數據庫名稱或文件路徑',
      dbUserRequired: '請輸入數據庫用戶',
      dbPasswordRequired: '請輸入數據庫密碼',
      httpPortRequired: '請輸入 HTTP 端口',
      runModeRequired: '請選擇運行模式',
      sessionTimeoutRequired: '請輸入會話超時時間',
    },
    
    // 消息提示
    messages: {
      installSuccess: '安裝成功！請重啟程序以加載配置',
      installFailed: '安裝失敗',
      checkingStatus: '檢查安裝狀態失敗，繼續安裝流程',
    },
    
    // 語言選擇器
    language: {
      zhCN: '简体中文',
      enUS: 'English',
      zhTW: '繁體中文',
    },
  },
}

