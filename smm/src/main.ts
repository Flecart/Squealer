import Vue, { createApp } from 'vue'
import App from './App.vue'
import { BootstrapVue, IconsPlugin } from 'bootstrap-vue'
import * as VueRouter from 'vue-router'
import Dashboard from './components/Dashboard.vue'
import { getClientsRoute, squealerBaseURL } from './routes'
// @ts-ignore outside of root directory
import endpoints from '../../config/endpoints.json'
import { authInject, clientInject } from './keys'

import './assets/app.scss'
import type { IUser } from '@model/user'
import BuyQuotaVue from './views/BuyQuotaView.vue'

const routes = [
  { path: `/${endpoints.SMM}`, name: 'main', component: Dashboard },
  { path: `/${endpoints.SMM}/buy-quota`, name: 'about', component: BuyQuotaVue }
]

const router = VueRouter.createRouter({
  history: VueRouter.createWebHistory(),
  routes
})

const baseUrl = process.env.NODE_ENV === 'development' ? 'http://localhost:5173' : squealerBaseURL

const app = createApp(App)

const authState = JSON.parse(localStorage.getItem('auth') ?? 'null')
if (authState != null) {
  app.provide(authInject, authState)
  // IIFE so that i can use await in top level
  const response = await fetch(getClientsRoute, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + authState.token
    }
  })
  const jsonResponse = await response.json()
  app.provide(clientInject, jsonResponse as IUser[])
}

router.beforeEach((to, _) => {
  const targetPath = to.path
  const authState = JSON.parse(localStorage.getItem('auth') ?? 'null')

  if (authState == null) {
    // in dev mode set the auth by hand, localstorage won't work with different ports
    window.location.replace(
      `${squealerBaseURL}/login?redirect=${encodeURIComponent(baseUrl + targetPath)}`
    )
  }

  if (targetPath == '/logout') {
    // redirect to main after logout, ci sono cose brutte col localstorage :(
    window.location.replace(`${squealerBaseURL}/logout?redirect=${encodeURIComponent(baseUrl)}`)
  }
})

// @ts-ignore
Vue.use(BootstrapVue).use(IconsPlugin)

app.use(router).mount('#app')
