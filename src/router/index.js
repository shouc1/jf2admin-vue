import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue'),
    meta: {requiredAuth:false}
  },
  {
    path: '/',
    component: () => import('../views/Home.vue'),
    meta: {requiredAuth:true},
    children:[
      { path: '', redirect: 'index' },
      { path: 'index', name: 'Home', component: () => import('../views/Index.vue') },
      { path: 'member', component: ()=>import('../views/Member.vue') },
      { path: 'dept', component: ()=>import('../views/Dept.vue') },
      { path: 'admin', component: () => import('../views/Admin.vue') },
      { path: 'report', component: () => import('../views/Report.vue') },
      { path: 'my', component: () => import('../views/My.vue') }
    ]
  }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

router.beforeEach((to, from, next) => {
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  const isLoggedIn = localStorage.getItem('accessToken') // 或从 Pinia 中获取

  if (requiresAuth && !isLoggedIn) {
    next('/login')
  } else {
    next()
  }
})

export default router