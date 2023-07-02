import * as VueRouter from 'vue-router'
import Dashboard from './components/Dashboard.vue'
import BuyQuotaVue from './views/BuyQuotaView.vue'
import GeolocalizationViewVue from './views/GeolocalizationView.vue'
import GraphViewVue from './views/GraphView.vue'
import PostMessageViewVue from '@/views/PostMessageView.vue'
import NoClientsViewVue from '@/views/NoClientsView.vue'

// @ts-ignore outside of root directory
import endpoints from '../../config/endpoints.json'
import { injectAuth, injectClients } from './keys'

// TODO: mettere l'indirizzo del server di squealer se non dev, quando si saprà l'indirizzo di squealer
export const squealerBaseURL = process.env.NODE_ENV === 'development' ? 'http://localhost:8000' : ''

// API routes
export const getClientsRoute = `${squealerBaseURL}/api/smm/clients`
export const buyQuotaRoute = `${squealerBaseURL}/api/smm/buy-quota/{0}`
export const postClientMessageRoute = `${squealerBaseURL}/api/smm/message/{0}`
export const postClientMultipleMessagesRoute = `${squealerBaseURL}/api/smm/messages/{0}`
export const getClienthistoryRoute = `${squealerBaseURL}/api/smm/history/{0}`
export const getVipClientRequestRoute = `${squealerBaseURL}/api/smm/requests`
export const rejectVipClientRequestRoute = `${squealerBaseURL}/api/smm/reject-request/{0}`
export const acceptVipClientRequestRoute = `${squealerBaseURL}/api/smm/add-client/{0}`

export const getClientMessageRoute = `${squealerBaseURL}/api/message/user/{0}`
export const getUserRoute = `${squealerBaseURL}/api/user/{0}`

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
export const noClientsErrorName = 'no-clients'

const routes = [
  {
    path: `/${endpoints.SMM}`,
    name: dashboardName,
    components: {
      default: Dashboard,
      title: '<h1>SMM Dashboard</h1>'
    }
  },
  {
    path: `/${endpoints.SMM}/buy-quota`,
    name: buyQuotaName,
    components: {
      default: BuyQuotaVue
    }
  },
  {
    path: `/${endpoints.SMM}/geolocalization`,
    name: geolocalizationName,
    components: {
      default: GeolocalizationViewVue,
      title: '<h2>Geolocalization</h2>'
    }
  },
  {
    path: `/${endpoints.SMM}/graph`,
    name: graphName,
    components: {
      default: GraphViewVue,
      title: '<h2>Analytics</h2>'
    }
  },
  {
    path: `/${endpoints.SMM}/send-message`,
    name: sendMessageName,
    components: {
      default: PostMessageViewVue
    }
  },
  {
    path: `/${endpoints.SMM}/no-clients`,
    name: noClientsErrorName,
    components: {
      default: NoClientsViewVue
    }
  }
]

export const router = VueRouter.createRouter({
  history: VueRouter.createWebHistory(),
  // @ts-expect-error after the using named components we get ad ts error.
  routes
})

router.beforeEach((to, _) => {
  const targetPath = to.path
  const authState = injectAuth()
  const injectedClients = injectClients()

  if (to.name != noClientsErrorName && (!injectedClients || injectedClients.length == 0)) {
    console.log(injectedClients)
    router.push({ name: noClientsErrorName })
  }

  if (authState == undefined) {
    redirectToLogin()
  }

  if (targetPath == '/logout') {
    // redirect to main after logout, ci sono cose brutte col localstorage :(
    localStorage.removeItem('auth')
    redirectToLogin()
  }
})
