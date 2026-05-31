// 视图组件
const view = {
	tabs: () => import('@/layouts/tabs'),
	blank: () => import('@/layouts/BlankView'),
	page: () => import('@/layouts/PageView'),
}

// 路由组件注册
const routerMap = {
	install: {
		authority: '*',
		path: '/install',
		component: () => import('@/pages/install'),
	},
	login: {
		authority: '*',
		path: '/login',
		component: () => import('@/pages/login'),
	},
	root: {
		path: '/',
		name: '根路由',
		redirect: '/login',
		component: view.tabs,
	},
	//dashboard
	dashboard: {
		name: 'Dashboard',
		component: view.blank,
	},
	workplace: {
		component: () => import('@/pages/dashboard/index'),
	},
	overview: {
		component: () => import('@/pages/dashboard/overview'),
	},
	dash: {
		component: () => import('@/pages/dashboard/dash'),
	},
	// host/net/server 父容器保留：仅用于挂载各设备详情路由（列表已并入“资产管理”）
	host: {
		component: view.blank,
	},
	linDetail: {
		component: () => import('@/pages/host/linuxDetail'),
	},
	winDetail: {
		component: () => import('@/pages/host/winDetail'),
	},
	net: {
		component: view.blank,
	},
	netDetail: {
		component: () => import('@/pages/host/netDetail'),
	},
	server: {
		component: view.blank,
	},
	srvDetail: {
		component: () => import('@/pages/host/serDetail'),
	},
	//alarm
	alarm: {
		component: view.blank,
	},
	alarmAnalysis: {
		component: () => import('@/pages/alarm/analysis'),
	},
	alarmList: {
		component: () => import('@/pages/alarm/query'),
	},
	alarmRule: {
		component: () => import('@/pages/alarm/rule'),
	},
	alarmMutes: {
		component: () => import('@/pages/alarm/mutes'),
	},
	//topology
	topology: {
		component: view.blank,
	},
	topologyList: {
		component: () => import('@/pages/topology/index'),
	},
	topologyDetail: {
		component: () => import('@/pages/topology/detail'),
	},
	topologyShow: {
		component: () => import('@/pages/topology/show'),
	},
	topologyShare: {
		authority: '*',
		path: '/share/topology',
		component: () => import('@/pages/topology/share'),
	},
	screenDashboard: {
		path: '/screen/dashboard',
		component: () => import('@/pages/screen/index'),
	},
	//report
	report: {
		component: view.blank,
	},
	hostReport: {
		component: () => import('@/pages/report/host'),
	},
	//system
	system: {
		component: view.blank,
	},
	systemUsers: {
		component: () => import('@/pages/system/users'),
	},
	systemGroups: {
		component: () => import('@/pages/system/groups'),
	},
	systemBandwidth: {
		component: () => import('@/pages/system/bandwidth'),
	},
	sysConfig: {
		component: () => import('@/pages/system/config'),
	},
	zabbix: {
		component: () => import('@/pages/system/zabbix'),
	},
	analysis: {
		name: '分析页',
		component: () => import('@/pages/dashboard/analysis'),
	},
	version: {
		component: () => import('@/pages/system/version'),
	},
	menuManagement: {
		component: () => import('@/pages/system/menu'),
	},
	assetManagement: {
		component: () => import('@/pages/system/asset-management'),
	},
	assetTypeManagement: {
		component: () => import('@/pages/system/asset-type'),
	},
	assetBinding: {
		component: () => import('@/pages/system/asset-binding'),
	},
	// 自定义设备类型通用列表（动态菜单路由使用）
	deviceList: {
		component: () => import('@/pages/host/GenericDeviceList'),
	},
	// 自定义设备类型通用详情页
	deviceDetail: {
		component: () => import('@/pages/host/GenericDeviceDetail'),
	},
	// 资产管理 一级父容器，默认进入“资产树”子页面
	assets: {
		component: view.blank,
		redirect: '/assets/tree',
	},
	// 资产树（统一资产管理浏览器，三级树形视图）
	assetBrowser: {
		component: () => import('@/pages/host/AssetBrowser'),
	},
	// 自定义设备分组 父菜单占位（group_key 作为 router name）
	custom: {
		component: view.blank,
	},

	form: {
		name: '表单页',
		icon: 'form',
		component: view.page,
	},
	basicForm: {
		path: 'basic',
		name: '基础表单',
		component: () => import('@/pages/form/basic'),
	},
	stepForm: {
		path: 'step',
		name: '分步表单',
		component: () => import('@/pages/form/step'),
	},
	advanceForm: {
		path: 'advance',
		name: '高级表单',
		component: () => import('@/pages/form/advance'),
	},
	list: {
		name: '列表页',
		icon: 'table',
		component: view.page,
	},
	queryList: {
		path: 'query',
		name: '查询表格',
		component: () => import('@/pages/list/QueryList'),
	},
	primaryList: {
		path: 'primary',
		name: '标准列表',
		component: () => import('@/pages/list/StandardList'),
	},
	cardList: {
		path: 'card',
		name: '卡片列表',
		component: () => import('@/pages/list/CardList'),
	},
	searchList: {
		path: 'search',
		name: '搜索列表',
		component: () => import('@/pages/list/search/SearchLayout'),
	},
	article: {
		name: '文章',
		component: () => import('@/pages/list/search/ArticleList'),
	},
	application: {
		name: '应用',
		component: () => import('@/pages/list/search/ApplicationList'),
	},
	project: {
		name: '项目',
		component: () => import('@/pages/list/search/ProjectList'),
	},
	details: {
		name: '详情页',
		icon: 'profile',
		component: view.blank,
	},
	basicDetails: {
		path: 'basic',
		name: '基础详情页',
		component: () => import('@/pages/detail/BasicDetail'),
	},
	advanceDetails: {
		path: 'advance',
		name: '高级详情页',
		component: () => import('@/pages/detail/AdvancedDetail'),
	},
	result: {
		name: '结果页',
		icon: 'check-circle-o',
		component: view.page,
	},
	success: {
		name: '成功',
		component: () => import('@/pages/result/Success'),
	},
	error: {
		name: '失败',
		component: () => import('@/pages/result/Error'),
	},
	exception: {
		name: '异常页',
		icon: 'warning',
		component: view.blank,
	},
	exp403: {
		authority: '*',
		name: 'exp403',
		path: '403',
		component: () => import('@/pages/exception/403'),
	},
	exp404: {
		name: 'exp404',
		path: '404',
		component: () => import('@/pages/exception/404'),
	},
	exp500: {
		name: 'exp500',
		path: '500',
		component: () => import('@/pages/exception/500'),
	},
	components: {
		name: '小组件',
		icon: 'appstore-o',
		component: view.page,
	},
	taskCard: {
		name: '任务卡片',
		component: () => import('@/pages/components/TaskCard'),
	},
	palette: {
		name: '颜色复选框',
		component: () => import('@/pages/components/Palette'),
	},
}
export default routerMap
