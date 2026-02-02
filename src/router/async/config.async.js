import routerMap from './router.map'
import {parseRoutes} from '@/utils/routerUtil'

// 异步路由配置
const routesConfig = [
  'install',
  'login',
  {
    router: 'topologyPublic',
    path: '/public/topology',
    name: '公开拓扑'
  },
  'root',
  {
    router: 'exp404',
    path: '*',
    name: '404'
  },
  {
    router: 'exp403',
    path: '/403',
    name: '403'
  }
]

const options = {
  routes: parseRoutes(routesConfig, routerMap)
}

export default options
