import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'home',
    component: () => import('../views/HomeView.vue')
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('../views/LoginView.vue')
  },
  {
    path: '/create-token',
    name: 'createToken',
    component: () => import('../views/CreateToken.vue')
  },
  {
    path: '/create-nft-token',
    name: 'createNFTToken',
    component: () => import('../views/CreateNFTToken.vue')
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
