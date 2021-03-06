import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

/* Layout */
import Layout from '@/layout'

/* Router Modules */
import componentsRouter from './modules/components'
import chartsRouter from './modules/charts'
import tableRouter from './modules/table'
import nestedRouter from './modules/nested' 

/**
 * Note: sub-menu only appear when route children.length >= 1
 * Detail see: https://panjiachen.github.io/vue-element-admin-site/guide/essentials/router-and-nav.html
 *
 * hidden: true                   if set true, item will not show in the sidebar(default is false)
 * alwaysShow: true               if set true, will always show the root menu
 *                                if not set alwaysShow, when item has more than one children route,
 *                                it will becomes nested mode, otherwise not show the root menu
 * redirect: noRedirect           if set noRedirect will no redirect in the breadcrumb
 * name:'router-name'             the name is used by <keep-alive> (must set!!!)
 * meta : {
    roles: ['admin]    control the page roles (you can set multiple roles)
    title: 'title'               the name show in sidebar and breadcrumb (recommend set)
    icon: 'svg-name'/'el-icon-x' the icon show in the sidebar
    noCache: true                if set true, the page will no be cached(default is false)
    affix: true                  if set true, the tag will affix in the tags-view
    breadcrumb: false            if set false, the item will hidden in breadcrumb(default is true)
    activeMenu: '/example/list'  if set path, the sidebar will highlight the path you set
  }
  */

/**
 * constantRoutes
 * a base page that does not have permission requirements
 * all roles can be accessed
 */
 export const constantRoutes = [{
    path: '/redirect',
    component: Layout,
    hidden: true,
    children: [{
      path: '/redirect/:path(.*)',
      component: () => import('@/views/redirect/index')
  }]
},
{
    path: '/login',
    component: () => import('@/views/login/index'),
    hidden: true
},
{
    path: '/auth-redirect',
    component: () => import('@/views/login/auth-redirect'),
    hidden: true
},
{
    path: '/404',
    component: () => import('@/views/error-page/404'),
    hidden: true
},
{
    path: '/401',
    component: () => import('@/views/error-page/401'),
    hidden: true
},
{
    path: '/',
    component: Layout,
    redirect: '/dashboard',
    children: [{
      path: 'dashboard',
      component: () => import('@/views/dashboard/index'),
      name: 'Dashboard',
      meta: {
        title: 'Dashboard',
        icon: 'dashboard',
        affix: true
    }
}]
},
{
    path: '/permission',
    component: Layout,
    hidden: false, // will always show the root menu
    name: 'Permission',
    meta: {
      title: 'Permission',
      icon: 'lock',
      roles: ['admin', 'user'] // you can set roles in root nav
  },
  children: [{
    path: 'role',
    component: () => import('@/views/permission/role'),
    name: 'RolePermission',
    hidden : false,
    meta: {
      title: 'Role Permission',
      roles: ['admin', 'user']
  }
},
  {
    path: 'user',
    component: () => import('@/views/user'),
    name: 'user',
    hidden : false,
    meta: {
      title: 'users',
      roles: ['admin', 'user']
  }
}
]
},

{
    path: '/profile',
    component: Layout,
    redirect: '/profile/index',
    hidden: false,
    children: [{
      path: 'index',
      component: () => import('@/views/profile/index'),
      name: 'Profile',
      meta: {
        title: 'Profile',
        icon: 'user',
        noCache: true
    }
}]
},
{
    path: '/produk',
    component: Layout,
    hidden: false,
    children: [{
      path: 'index',
      component: () => import('@/views/produk'),
      name: 'Produk',
      meta: {
        title: 'Produk',
        icon: 'user',
        noCache: true
    }
}]
},
{
    path: '/serial',
    component: Layout,
    hidden: false,
    children: [{
      path: 'lisensi',
      component: () => import('@/views/serial'),
      name: 'Lisensi',
      meta: {
        title: 'Lisensi',
        icon: 'user',
        noCache: true
    }
}]
}
]

/**
 * asyncRoutes
 * the routes that need to be dynamically loaded based on user roles
 */
 export const asyncRoutes = [

 {
    path: '/penjualan',
    component: Layout,
    name: 'stok',
    meta: {
      title: 'Penjualan',
      icon: 'shopping',
      roles: ['admin', 'kasir'] // you can set roles in root nav
  },
  children: [{
      path: '/penjualan',
      component: () => import('@/views/stok_keluar'),
      name: 'PagePermission',
      meta: {
        title: 'Penjualan',
        roles: ['admin', 'kasir'] // or you can only set roles in sub nav
    }
}, 
]
},

  // 404 page must be placed at the end !!!
  {
    path: '*',
    redirect: '/404',
    hidden: true
}
]

const createRouter = () => new Router({
  // mode: 'history', // require service support
  scrollBehavior: () => ({
    y: 0
}),
  routes: constantRoutes
})

const router = createRouter()

// Detail see: https://github.com/vuejs/vue-router/issues/1234#issuecomment-357941465
export function resetRouter() {
  const newRouter = createRouter()
  router.matcher = newRouter.matcher // reset router
}

export default router
