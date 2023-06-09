import { createApp } from 'vue'
import App from './App.vue'
import { BootstrapVue, IconsPlugin } from 'bootstrap-vue'
import * as VueRouter from 'vue-router'
import Dashboard from './components/Dashboard.vue'
import { squealerBaseURL } from './routes'
// @ts-ignore outside of root directory
import endpoints from '../../config/endpoints.json'

import './assets/app.scss'

const routes = [
  { path: `/${endpoints.SMM}`, name: 'main', component: Dashboard },
  { path: `/${endpoints.SMM}/about`, name: 'about', component: Dashboard }
]

const router = VueRouter.createRouter({
  history: VueRouter.createWebHistory(),
  routes
})

const baseUrl = process.env.NODE_ENV === 'development' ? 'http://localhost:5173' : squealerBaseURL

const app = createApp(App)

router.beforeEach((to, _) => {
  const targetPath = to.path
  const authState = JSON.parse(localStorage.getItem('auth') ?? 'null')

  if (authState == null) {
    // in dev mode set the auth by hand, localstorage won't work with different ports
    window.location.replace(
      `${squealerBaseURL}/login?redirect=${encodeURIComponent(baseUrl + targetPath)}`
    )
  } else {
    app.provide('auth', authState)
  }

  if (targetPath == '/logout') {
    // redirect to main after logout, ci sono cose brutte col localstorage :(
    window.location.replace(`${squealerBaseURL}/logout?redirect=${encodeURIComponent(baseUrl)}`)
  }
})

app.use(BootstrapVue).use(IconsPlugin).use(router).mount('#app')
