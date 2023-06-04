import { createApp } from 'vue'
import App from './App.vue'
import { BootstrapVue, IconsPlugin } from 'bootstrap-vue'
import * as VueRouter from 'vue-router'
import HelloWorldVue from './components/HelloWorld.vue'
// @ts-ignore outside of root directory
import endpoints from '../../config/endpoints.json'

import './assets/app.scss'

const app = createApp(App)

const routes = [
  { path: `/`, name: 'main', component: HelloWorldVue },
  { path: `/about`, name: 'about', component: HelloWorldVue }
]

const router = VueRouter.createRouter({
  history: VueRouter.createWebHistory(endpoints.SMM),
  routes
})

console.log('endpoints', endpoints.SMM)

// Make BootstrapVue available throughout your project
app.use(BootstrapVue)
// Optionally install the BootstrapVue icon components plugin
app.use(IconsPlugin)

app.use(router)

app.mount('#app')
