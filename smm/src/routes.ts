import * as VueRouter from 'vue-router'
import Dashboard from './components/Dashboard.vue'
import BuyQuotaVue from './views/BuyQuotaView.vue'

// @ts-ignore outside of root directory
import endpoints from '../../config/endpoints.json'

// TODO: mettere l'indirizzo del server di squealer se non dev, quando si saprà l'indirizzo di squealer
export const squealerBaseURL = process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : ''

export const getClientsRoute = `${squealerBaseURL}/api/smm/clients`
export const buyQuotaBaseRoute = `${squealerBaseURL}/api/smm/buy-quota`
export const getClientMessageBaseRoute = `${squealerBaseURL}/api/message/user`
export const getUserBaseRoute = `${squealerBaseURL}/api/user`

const baseUrl = process.env.NODE_ENV === 'development' ? 'http://localhost:5173' : squealerBaseURL
export const redirectToLogin = () => {
  // in dev mode set the auth by hand, localstorage won't work with different ports
  window.location.replace(`${squealerBaseURL}/logout?redirect=${encodeURIComponent(baseUrl)}`)
}

const routes = [
  { path: `/${endpoints.SMM}`, name: 'main', component: Dashboard },
  { path: `/${endpoints.SMM}/buy-quota`, name: 'about', component: BuyQuotaVue }
]

export const router = VueRouter.createRouter({
  history: VueRouter.createWebHistory(),
  routes
})

router.beforeEach((to, _) => {
  const targetPath = to.path
  const authState = JSON.parse(localStorage.getItem('auth') ?? 'null')

  if (authState == null) {
    redirectToLogin()
  }

  if (targetPath == '/logout') {
    // redirect to main after logout, ci sono cose brutte col localstorage :(
    localStorage.removeItem('auth')
    redirectToLogin()
  }
})
