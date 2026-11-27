import HomeView from '../views/HomeView.vue'
import { createRouter, createWebHistory } from 'vue-router'
import DeviceListView from '../views/DeviceListView.vue'
import DeviceDetailView from '../views/DeviceDetailView.vue'

// 路由表：一个 URL 对应一个页面组件
const routes = [
  // 访问根路径时自动跳到设备列表
    { path: '/', name: 'home', component: HomeView },

  // name 是路由名，后面代码里跳转用 router.push({ name: 'device-detail', ... })
  { path: '/devices', name: 'device-list', component: DeviceListView },

  // :id 是动态参数，/devices/3 里的 3 会被当成 id
  // props: true 表示把 id 作为 prop 传给组件，组件里就不用写 route.params.id
  { path: '/devices/:id', name: 'device-detail', component: DeviceDetailView, props: true },

  // 兜底：以上都不匹配时回列表，避免用户看到空白页
  { path: '/:pathMatch(.*)*', redirect: '/devices' },
]

const router = createRouter({
  // createWebHistory 用真实 URL（/devices），比 /#/devices 好看
  history: createWebHistory(),
  routes,
})

export default router
