import * as VueRouter from 'vue-router'
import Dashboard from './components/Dashboard.vue'
import BuyQuotaVue from './views/BuyQuotaView.vue'
import GeolocalizationViewVue from './views/GeolocalizationView.vue'
import GraphViewVue from './views/GraphView.vue'
import PostMessageViewVue from '@/views/PostMessageView.vue'

// @ts-ignore outside of root directory
import endpoints from '../../config/endpoints.json'

// TODO: mettere l'indirizzo del server di squealer se non dev, quando si saprà l'indirizzo di squealer
export const squealerBaseURL = process.env.NODE_ENV === 'development' ? 'http://localhost:8000' : ''

// API routes
export const getClientsRoute = `${squealerBaseURL}/api/smm/clients`
export const buyQuotaRoute = `${squealerBaseURL}/api/smm/buy-quota/{0}`
export const postClientMessageRoute = `${squealerBaseURL}/api/smm/message/{0}`
export const postClientMultipleMessagesRoute = `${squealerBaseURL}/api/smm/messages/{0}`
export const getClientMessageRoute = `${squealerBaseURL}/api/message/user/{0}`
export const getUserRoute = `${squealerBaseURL}/api/user/{0}`
export const getClienthistoryRoute = `${squealerBaseURL}/api/smm/history/{0}`

export const getChannelSuggestions = `${squealerBaseURL}/api/channel/suggestions`
export const getHashtabChannelSuggestions = `${squealerBaseURL}/api/channel/suggestions/hashtag`
export const getUserChannelSuggestions = `${squealerBaseURL}/api/user/suggestions`

// ROUTER CONFIGURATION
const baseUrl = process.env.NODE_ENV === 'development' ? 'http://localhost:5173' : squealerBaseURL
export const redirectToLogin = () => {
  // in dev mode set the auth by hand, localstorage won't work with different ports
  window.location.replace(`${squealerBaseURL}/logout?redirect=${encodeURIComponent(baseUrl)}`)
}

export const dashboardName = 'dashboard'
export const buyQuotaName = 'buy-quota'
export const geolocalizationName = 'geolocalization'
export const graphName = 'graph'
export const sendMessageName = 'send-message'

const routes = [
  { path: `/${endpoints.SMM}`, name: dashboardName, component: Dashboard },
  { path: `/${endpoints.SMM}/buy-quota`, name: buyQuotaName, component: BuyQuotaVue },
  {
    path: `/${endpoints.SMM}/geolocalization`,
    name: geolocalizationName,
    component: GeolocalizationViewVue
  },
  {
    path: `/${endpoints.SMM}/graph`,
    name: graphName,
    component: GraphViewVue
  },
  { path: `/${endpoints.SMM}/send-message`, name: sendMessageName, component: PostMessageViewVue }
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
