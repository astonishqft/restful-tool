import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router'
import AllTestsView from '../viewers/AllTestsView.vue'
import SingleTestView from '../viewers/SingleTestView.vue'

const routes: RouteRecordRaw[] = [
  { path: '/', name: 'home', component: AllTestsView },
  { path: '/cases/:caseId', name: 'case', component: AllTestsView, props: true },
  { path: '/cases/:caseId/apis/:apiId', name: 'api', component: SingleTestView, props: true }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
