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
    roles: ['admin','editor']    control the page roles (you can set multiple roles)
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
 export const constantRoutes = [
 {
  path: '/redirect',
  component: Layout,
  hidden: true,
  children: [
  {
    path: '/redirect/:path(.*)',
    component: () => import('@/views/redirect/index')
  }
  ]
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
  children: [
  {
    path: 'dashboard',
    component: () => import('@/views/dashboard/index'),
    name: 'Dashboard',
    meta: { title: 'Dashboard', icon: 'dashboard', affix: true }
  }
  ]
},
{
  path: '/profile',
  component: Layout,
  redirect: '/profile/index',
  hidden : true,
  children: [
  {
    path: 'index',
    component: () => import('@/views/profile/index'),
    name: 'Profile',
    meta: { title: 'Profile', icon: 'user', noCache: true }
  }
  ]
}
]

/**
 * asyncRoutes
 * the routes that need to be dynamically loaded based on user roles
 */
 export const asyncRoutes = [

 {
  path: '/stok/keluar',
  component: Layout,
  name: 'stok',
  meta: 
  {
    title: 'Penjualan',
    icon: 'shopping',
    roles: ['admin', 'kasir'] // you can set roles in root nav
  },
  children : 
  [
  {
    path: '/stok/keluar',
    component: () => import('@/views/stok_keluar'),
    name: 'PagePermission',
    meta: {
      icon: 'component',
      title: 'Penjualan',
              roles: ['admin'] // or you can only set roles in sub nav
            }
          }
          ]
        },


        {
          path: '/stok/masuk',
          component: Layout,
          name: 'stok',
          meta: 
          {
            title: 'Pembelian',
            icon: 'shopping',
      roles: ['admin', 'kasir'] // you can set roles in root nav
    },
    children : 
    [
    {
      path: '/stok/masuk',
      component: () => import('@/views/stok_masuk'),
      name: 'PagePermission',
      meta: 
      {
        icon: 'nested',
        title: 'Pembelian',
              roles: ['admin'] // or you can only set roles in sub nav
            }
          }
          ]
        },


        {
          path: '/kon',
          component: Layout,
          name: 'kontak',
          meta: {
            title: 'Kontak',
            icon: 'example',
      roles: ['admin', 'kasir'] // you can set roles in root nav
    },
    children: [
    {
      path: '/kontak',
      component: () => import('@/views/supplier'),
      name: 'PagePermission',
      meta: {
        title: 'Kontak',
          roles: ['admin'] // or you can only set roles in sub nav
        }
      }
      ]
    },

    {
      path: '/stok',
      component: Layout,
      name: 'stok',
      meta: {
        title: 'Persedian',
        icon: 'shopping',
      roles: ['admin', 'kasir'] // you can set roles in root nav
    },
    children: [
    {
      path: '/kategori',
      component: () => import('@/views/kategori'),
      name: 'PagePermission',
      meta: {
        title: 'Kategori',
          roles: ['admin'] // or you can only set roles in sub nav
        }
      },
      {
        path: '/produk',
        component: () => import('@/views/produk'),
        name: 'PagePermission',
        meta: {
          title: 'Produk',
          roles: ['admin'] // or you can only set roles in sub nav
        }
      },
      {
        path: '/stok/masuk',
        component: () => import('@/views/stok_masuk'),
        name: 'PagePermission',
        hidden : true,

        meta: {
          title: 'Pembelian',
          roles: ['admin'] // or you can only set roles in sub nav
        }
      },
      {
        path: '/stok/keluar',
        component: () => import('@/views/stok_keluar'),
        name: 'PagePermission',
        hidden : true,

        meta: {
          title: 'Penjualan',
          roles: ['admin'] // or you can only set roles in sub nav
        }
      },
      {
        path: '/stok/keluar/detail/:id',
        component: () => import('@/views/detail_penjualan'),
        name: 'PagePermission',
        hidden : true,
        meta: {
          title: 'Detail Penjualan',
          roles: ['admin'] // or you can only set roles in sub nav
        }
      },

      {
        path: '/stok/masuk/detail/:id',
        component: () => import('@/views/detail_pembelian'),
        name: 'PagePermission',
        hidden : true,
        meta: {
          title: 'detail pembelian',
          roles: ['admin'] // or you can only set roles in sub nav
        }
      },

      ]
    },

    {
      path: '/laporan',
      component: Layout,
      name: 'laporan',
      meta: {
        title: 'Laporan',
        icon: 'excel',
      roles: ['admin', 'kasir'] // you can set roles in root nav
    },
    children: [
    {
      path: '/neraca',
      component: () => import('@/views/neraca'),
      name: 'PagePermission',
      meta: {
        title: 'Neraca',
          roles: ['admin'] // or you can only set roles in sub nav
        }
      },
      {
        path: '/laba/rugi',
        component: () => import('@/views/labarugi'),
        name: 'PagePermission',
        meta: {
          title: 'Laba Rugi',
          roles: ['admin'] // or you can only set roles in sub nav
        }
      }
      ]
    },

    {
     path: '/finansial',
     component: Layout,
     name: 'finansial',
     meta: 
     {
      title: 'Finansial',
      icon: 'people',
      roles: ['admin', 'kasir'] // you can set roles in root nav
    },
    children: 
    [

    {
      path: '/kategori/detail/:nama/:id',
      component: () => import('@/views/kategori_detail'),
      name: 'PagePermission',
      hidden: true,
      meta: 
      {
        title: 'Kategori',
              roles: ['admin'] // or you can only set roles in sub nav
            }
          },
          {
            path: '/akun',
            component: () => import('@/views/akun'),
            name: 'DirectivePermission',
            hide : true,
            meta: 
            {
              title: 'Akun',
              roles: ['admin', 'editor']
            }
          },
          {
            path: '/kas/detail/:id',
            component: () => import('@/views/kas_detail'),
            name: 'RolePermission',
            hidden: true,
            meta: 
            {
              title: 'Detail Kas',
              roles: ['admin', 'editor']
            }
          },

          {
            path: '/kas/outdetail/:id',
            component: () => import('@/views/kas_outdetail'),
            name: 'RolePermission',
            hidden: true,
            meta: 
            {
              title: 'Detail Kas',
              roles: ['admin', 'editor']
            }
          },

          {
            path: '/transfer/detail/:id',
            component: () => import('@/views/transfer_detail'),
            name: 'RolePermission',
            hidden: true,
            meta: 
            {
              title: 'Detail Transfer',
              roles: ['admin', 'editor']
            }
          }
          ]
        },

        {
          path: '/setarakas',
          component: Layout,
          name: 'Kas / Setoran Kas',
          meta: 
          {
            title: 'Kas',
            icon: 'bug',
      roles: ['admin', 'kasir'] // you can set roles in root nav
    },
    children: 
    [

    {
      path: '/kas/keluar',
      component: () => import('@/views/kas_out'),
      name: 'DirectivePermission',
      meta: 
      {
        title: 'Kas Keluar',
        roles: ['admin', 'editor']
              // if do not set roles, means: this page does not require permission
            }
          },
          {
            path: '/kas/masuk',
            component: () => import('@/views/transaksi_in'),
            name: 'RolePermission',
            meta: 
            {
              title: 'Kas Masuk',
              roles: ['admin', 'editor']
            }
          },

          {
            path: '/kas/detail/:id',
            component: () => import('@/views/kas_detail'),
            name: 'RolePermission',
            hidden: true,
            meta: 
            {
              title: 'Detail Kas',
              roles: ['admin', 'editor']
            }
          },

          {
            path: '/kas/outdetail/:id',
            component: () => import('@/views/kas_outdetail'),
            name: 'RolePermission',
            hidden: true,
            meta: 
            {
              title: 'Detail Kas',
              roles: ['admin', 'editor']
            }
          },

          {
            path: '/transfer/detail/:id',
            component: () => import('@/views/transfer_detail'),
            name: 'RolePermission',
            hidden: true,
            meta: 
            {
              title: 'Detail Transfer',
              roles: ['admin', 'editor']
            }
          },
          {
            path: '/transfer-transaksi',
            component: () => import('@/views/transfer_in'),
            name: 'RolePermission',
            meta: 
            {
              title: 'Transfer Kas',
              roles: ['admin', 'editor']
            }
          }
          ]
        },








        {
          path: '/permission',
          component: Layout,
    alwaysShow: true, // will always show the root menu
    name: 'Permission',
    meta: 
    {
      title: 'Permission',
      icon: 'lock',
      roles: ['superadmin'] // you can set roles in root nav
    },
    children: 
    [
    {
      path: 'role',
      component: () => import('@/views/permission/role'),
      name: 'RolePermission',
      meta: {
        title: 'Role Permission',
        roles: ['superadmin']
      }
    },
    {
      path: 'user',
      component: () => import('@/views/user'),
      name: 'RolePermission',
      meta: 
      {
        title: 'User',
        roles: ['superadmin']
      }
    }
    ]
  },



  {
        path: '/stok/keluar/surat/jalan/:id',
        component: () => import('@/views/pdfnota'),
        name: 'PagePermission',
        hidden : true,
        meta: {
          title: 'surat jalan',
          roles: ['admin'] // or you can only set roles in sub nav
        }
      },

        {
        path: '/stok/keluar/nota/:id',
        component: () => import('@/views/pdfnotavalid'),
        name: 'PagePermission',
        hidden : true,
        meta: {
          title: 'Nota',
          roles: ['admin'] // or you can only set roles in sub nav
        }
      },


  // 404 page must be placed at the end !!!
  { path: '*', redirect: '/404', hidden: true }
  ]

  const createRouter = () => new Router({
  // mode: 'history', // require service support
  scrollBehavior: () => ({ y: 0 }),
  routes: constantRoutes
})

  const router = createRouter()

// Detail see: https://github.com/vuejs/vue-router/issues/1234#issuecomment-357941465
export function resetRouter() {
  const newRouter = createRouter()
  router.matcher = newRouter.matcher // reset router
}

export default router
