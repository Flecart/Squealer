import { createApp } from 'vue'
import App from './App.vue'
import { BootstrapVue, IconsPlugin } from 'bootstrap-vue'
import * as VueRouter from 'vue-router'
import HelloWorldVue from './components/HelloWorld.vue'
// @ts-ignore outside of root directory
import endpoints from '../../config/endpoints.json'

import './assets/app.scss'

const routes = [
  { path: `/${endpoints.SMM}`, name: 'main', component: HelloWorldVue },
  { path: `/${endpoints.SMM}/about`, name: 'about', component: HelloWorldVue }
]

const router = VueRouter.createRouter({
  history: VueRouter.createWebHistory(),
  routes
})

// TODO: mettere l'indirizzo del server di squealer se non dev
const squealerBaseURL =
  process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : 'http://localhost:3000'
const baseUrl = process.env.NODE_ENV === 'development' ? 'http://localhost:5173' : squealerBaseURL

router.beforeEach((to, _) => {
  const targetPath = to.path
  const authState = JSON.parse(localStorage.getItem('auth') ?? 'null')
  console.log(targetPath)
  console.log(authState)
  console.log(typeof authState)

  if (authState == null) {
    // window.location.replace(`${squealerBaseURL}/login?redirect=${encodeURIComponent(baseUrl + targetPath)}`)
  }

  if (targetPath == '/logout') {
    console.log('yes trying to logout')
  }
})

createApp(App).use(BootstrapVue).use(IconsPlugin).use(router).mount('#app')
