# unslop 八项修复完成记录

按 [检查报告](unslop-audit-2026-11-20.md) 实施。方向：面向运维值班控制台，克制、准确、可靠；保留既有品牌色、真实 logo、中文字体及紧凑布局，告警和排班状态使用语义标记。

使用 unslop by Damir Sokolovsky (@heydamir)，https://github.com/heydamir/unslop，CC BY 4.0。未新增依赖。

## 八项对应结果

| 检查项 | 修改及验证 |
| --- | --- |
| 手机日历文字过小 | 人名12px、班次数11px；移除9px“今天”视觉文字，以高亮和日期 aria-label 说明今天。保持周一至周日七列和76px日格，日期摘要仍可打开完整班次。 |
| 小按钮触控区域 | 翻月、回本月、成员排序使用 touch-action，在粗指针设备上至少40px；桌面保留紧凑尺寸。实测翻月与排序均40px。 |
| 文字对比度与主题 | 公共角色 --ops-text/--ops-muted 直接使用既有主题 heading/text 颜色；关键接收人恢复正文色，颜色保留在状态点且有文字说明。登录说明/页脚使用正文可读色。真实构建验证夜间切换：文本与角色变量正确从黑色切为白色。 |
| 全局彩色滚动条 | beauty-scroll 改为中性色滑块、透明轨道，保持正常滚动能力，不使用隐藏溢出的方式掩盖宽表格。 |
| 登录页重复装饰 | 删除色斑、光晕、漂浮网格、渐变文字、按钮渐变和死 keyframes；保留 logo、名称、文案、表单/API，按钮沿用现有主色。卡片仍440px，收紧内边距，手机无横向溢出。 |
| 间距尺度 | 排班分组/说明、条件组和条件预览优先统一4/8/12px尺度；保留控件内部2px级微调，不全局放大边距。 |
| dashboard/框架动效 | 删除装饰卡片上浮、数字/图标缩放、彩色悬停阴影、重复入场和死 CSS；精确列出过渡属性，常规反馈160ms；保留有意义的告警pulse。全局支持prefers-reduced-motion，验证告警动画在该偏好下单次0.01ms。 |
| 规则编辑纵向效率 | 名称/实例并排，时间/渠道并排；手机自动恢复单列；缩减重复说明、压缩标题与预览占用，保留条件→时间渠道→接收人→测试顺序及折叠测试入口。桌面内容高度由约1023px降至879px，表单仍完整可滚动。并列字段加宽label，英文Time Range/Notification Channel均无截断。 |

## 主要修改文件

- `src/components/OnCall/ScheduleCalendar.vue`、`src/pages/alarm/OnCallSchedules.vue`
- `src/components/RuleConditions/ConditionGroup.vue`、`ConditionEditor.vue`、`src/pages/alarm/rule.vue`
- `src/theme/antd/compact.less`、`src/theme/default/style.less`
- `src/pages/login/Login.vue`
- `src/pages/dashboard/index.vue`、`overview.vue`
- `src/layouts/AdminLayout.vue`、`src/layouts/header/HeaderNotice.vue`、`src/layouts/tabs/TabsHead.vue`、`src/layouts/footer/PageFooter.vue`

## 验证结果

- `node --test tests/*.test.js`：33项通过，覆盖旧规则/AND/OR、排班数据、时区/DST、月预览、审计分页及长文本等。
- `yarn lint --no-fix`：通过。
- `yarn build`：通过。
- 后端 `go test ./... -count=1`：通过。
- 指定隔离PostgreSQL后，`go test -race ./internal/model ./internal/handler -count=1`：通过，数据库集成实际运行，包括23组分发/排班场景、Webhook、SMTP、机器人投递及失败回归。
- 已跟踪和新增Go文件的gofmt检查均无输出；`git diff --check`通过。
- 未修改依赖清单；构建输出不加入版本控制。

浏览器：真实生产构建登录页在1366×768浅色和390×844夜间检查；实际Vue组件、真实构建全局主题配隔离数据检查日历、排班编辑、规则编辑与dashboard。

- 手机日历宽度clientWidth与scrollWidth一致，七列无横向溢出。
- 手机规则编辑与排班编辑弹窗均clientWidth=scrollWidth=374px。
- 翻月正确加载对应月份；班次详情保留2个模拟班次。
- 审计每页10行，摘要最高42px，20022字符完整详情可访问。
- 条件AND改OR正常传递到页面模型，排班选择保留，模拟分发测试返回当班与固定接收人。
- 英文并列字段label宽约112–157px，未截断；内容高度仍879px。
- dashboard实际组件显示统计与设备状态，保留告警pulse；减少动画设置生效。

## 验证边界

前端浏览器使用隔离数据，未连接生产系统或提交真实配置。后端集成使用独立schema和本地SMTP/HTTP接收端，不代表外部通知账号已配置成功。前端未建立新的图像快照测试体系；本轮没有新增依赖。后续改动仍需保护七列日历、完整详情和紧凑弹窗边界。
