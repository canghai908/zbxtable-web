const messages = {
    CN: {
      theme: {
        title: '整体风格设置',
        light: '亮色菜单风格',
        dark: '暗色菜单风格',
        night: '深夜模式',
        color: '主题色'
      },
      navigate: {
        title: '导航设置',
        side: '侧边导航',
        head: '顶部导航',
        mix: '混合导航',
        content: {
          title: '内容区域宽度',
          fluid: '流式',
          fixed: '定宽'
        },
        fixedHeader: '固定Header',
        fixedSideBar: '固定侧边栏',
      },
      other: {
        title: '其他设置',
        weekMode: '色弱模式',
        multiPages: '多页签模式',
        hideSetting: '隐藏设置抽屉'
      },
      animate: {
        title: '页面切换动画',
        disable: '禁用动画',
        effect: '动画效果',
        direction: '动画方向',
        effects: {
          back: '渐近',
          bounce: '弹跳',
          fade: '淡化',
          flip: '翻转',
          lightSpeed: '光速',
          rotate: '旋转',
          roll: '翻滚',
          zoom: '缩放',
          slide: '滑动'
        },
        directions: {
          left: '左',
          right: '右',
          down: '下',
          up: '上',
          downBig: '向下(大)',
          upBig: '向上(大)',
          leftBig: '向左(大)',
          rightBig: '向右(大)',
          topLeft: '左上',
          bottomRight: '右下',
          topRight: '右上',
          bottomLeft: '左下',
          downLeft: '左下',
          upRight: '右上',
          downRight: '右下',
          upLeft: '左上',
          default: '默认',
          x: 'X轴',
          y: 'Y轴'
        }
      },
      save_default: '设置为默认',
      last_saved: '上次保存: {time}',
      copy_empty: '抱歉，暂时没有可拷贝的内容 O(∩_∩)O~',
      copy_config_comment: '自定义配置，参考 ./default/setting.config.js，需要自定义的属性在这里配置即可',
      copy_success: '复制成功，覆盖文件 src/config/config.js 然后重启项目即可生效',
      copy_warn_local_config: '检测到本地有历史保存的主题配置，想要要拷贝的配置代码生效，您可能需要先重置配置',
      saving_local: '正在保存到本地，请稍后...',
      user_missing: '用户信息不存在',
      save_server_success: '主题配置已保存到服务器',
      save_failed: '保存失败',
      save_server_failed_with_reason: '保存到服务器失败: {reason}',
      network_error: '网络错误',
      reset_confirm: '重置主题会刷新页面，当前页面内容不会保留，确认重置？',
      alert: '拷贝配置后，直接覆盖文件 src/config/config.js 中的全部内容，然后重启即可。（注意：仅会拷贝与默认配置不同的项）',
      copy: '拷贝配置',
      save: '保存配置',
      reset: '重置配置'
    },
    HK: {
      theme: {
        title: '整體風格設置',
        light: '亮色菜單風格',
        dark: '暗色菜單風格',
        night: '深夜模式',
        color: '主題色'
      },
      navigate: {
        title: '導航設置',
        side: '側邊導航',
        head: '頂部導航',
        mix: '混合導航',
        content: {
          title: '內容區域寬度',
          fluid: '流式',
          fixed: '定寬'
        },
        fixedHeader: '固定Header',
        fixedSideBar: '固定側邊欄',
      },
      other: {
        title: '其他設置',
        weekMode: '色弱模式',
        multiPages: '多頁簽模式',
        hideSetting: '隱藏設置抽屜'
      },
      animate: {
        title: '頁面切換動畫',
        disable: '禁用動畫',
        effect: '動畫效果',
        direction: '動畫方向',
        effects: {
          back: '漸近',
          bounce: '彈跳',
          fade: '淡化',
          flip: '翻轉',
          lightSpeed: '光速',
          rotate: '旋轉',
          roll: '翻滾',
          zoom: '縮放',
          slide: '滑動'
        },
        directions: {
          left: '左',
          right: '右',
          down: '下',
          up: '上',
          downBig: '向下(大)',
          upBig: '向上(大)',
          leftBig: '向左(大)',
          rightBig: '向右(大)',
          topLeft: '左上',
          bottomRight: '右下',
          topRight: '右上',
          bottomLeft: '左下',
          downLeft: '左下',
          upRight: '右上',
          downRight: '右下',
          upLeft: '左上',
          default: '默認',
          x: 'X軸',
          y: 'Y軸'
        }
      },
      save_default: '設置為默認',
      last_saved: '上次保存: {time}',
      copy_empty: '抱歉，暫時沒有可拷貝的內容 O(∩_∩)O~',
      copy_config_comment: '自定義配置，參考 ./default/setting.config.js，需要自定義的屬性在這裡配置即可',
      copy_success: '拷貝成功，覆蓋文件 src/config/config.js 然後重啟項目即可生效',
      copy_warn_local_config: '檢測到本地有歷史保存的主題配置，想要要拷貝的配置代碼生效，您可能需要先重置配置',
      saving_local: '正在保存到本地，請稍後...',
      user_missing: '用戶信息不存在',
      save_server_success: '主題配置已保存到服務器',
      save_failed: '保存失敗',
      save_server_failed_with_reason: '保存到服務器失敗: {reason}',
      network_error: '網絡錯誤',
      reset_confirm: '重置主題會刷新頁面，當前頁面內容不會保留，確認重置？',
      alert: '拷貝配置后，直接覆蓋文件 src/config/config.js 中的全部內容，然後重啟即可。（注意：僅會拷貝與默認配置不同的項）',
      copy: '拷貝配置',
      save: '保存配置',
      reset: '重置配置'
    },
    US: {
      theme: {
        title: 'Page Style Setting',
        light: 'Light Style',
        dark: 'Dark Style',
        night: 'Night Style',
        color: 'Theme Color'
      },
      navigate: {
        title: 'Navigation Mode',
        side: 'Side Menu Layout',
        head: 'Top Menu Layout',
        mix: 'Mix Menu Layout',
        content: {
          title: 'Content Width',
          fluid: 'Fluid',
          fixed: 'Fixed'
        },
        fixedHeader: 'Fixed Header',
        fixedSideBar: 'Fixed SideBar',
      },
      other: {
        title: 'Other Setting',
        weekMode: 'Week Mode',
        multiPages: 'Multi Pages',
        hideSetting: 'Hide Setting Drawer'
      },
      animate: {
        title: 'Page Toggle Animation',
        disable: 'Disable',
        effect: 'Effect',
        direction: 'Direction',
        effects: {
          back: 'Back',
          bounce: 'Bounce',
          fade: 'Fade',
          flip: 'Flip',
          lightSpeed: 'Light Speed',
          rotate: 'Rotate',
          roll: 'Roll',
          zoom: 'Zoom',
          slide: 'Slide'
        },
        directions: {
          left: 'Left',
          right: 'Right',
          down: 'Down',
          up: 'Up',
          downBig: 'Down (Big)',
          upBig: 'Up (Big)',
          leftBig: 'Left (Big)',
          rightBig: 'Right (Big)',
          topLeft: 'Top Left',
          bottomRight: 'Bottom Right',
          topRight: 'Top Right',
          bottomLeft: 'Bottom Left',
          downLeft: 'Down Left',
          upRight: 'Up Right',
          downRight: 'Down Right',
          upLeft: 'Up Left',
          default: 'Default',
          x: 'X',
          y: 'Y'
        }
      },
      save_default: 'Set as Default',
      last_saved: 'Last saved: {time}',
      copy_empty: 'Sorry, there is nothing to copy O(∩_∩)O~',
      copy_config_comment: 'Custom config. See ./default/setting.config.js. Put overrides here.',
      copy_success: 'Copied. Replace src/config/config.js and restart to apply.',
      copy_warn_local_config: 'Local saved theme config detected. You may need to reset before the copied config takes effect.',
      saving_local: 'Saving locally, please wait...',
      user_missing: 'User info is missing',
      save_server_success: 'Theme settings saved to server',
      save_failed: 'Save failed',
      save_server_failed_with_reason: 'Failed to save to server: {reason}',
      network_error: 'Network error',
      reset_confirm: 'Resetting the theme will refresh the page and discard current content. Continue?',
      alert: 'After copying the configuration code, directly cover all contents in the file src/config/config.js, then restart the server. (Note: only items that are different from the default configuration will be copied)',
      copy: 'Copy Setting',
      save: 'Save',
      reset: 'Reset'
    }
}

messages['zh-CN'] = messages.CN
messages['zh-TW'] = messages.HK
messages['en-US'] = messages.US

module.exports = {
  messages
}
