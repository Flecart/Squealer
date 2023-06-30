import Vue, { createApp, ref } from 'vue'
import App from './App.vue'
import { BootstrapVue, IconsPlugin } from 'bootstrap-vue'
import { getClientsRoute, router, redirectToLogin, getUserBaseRoute } from './routes'
import { authInject, clientInject, currentClientInject, smmUserInject } from './keys'

import './assets/app.scss'
import { UserRoles, type IUser } from '@model/user'

// gently provided by https://stackoverflow.com/questions/51292406/check-if-token-expired-using-this-jwt-library
const isTokenExpired = (token: string) =>
  Date.now() >= JSON.parse(window.atob(token.split('.')[1])).exp * 1000

const app = createApp(App)

const authState = JSON.parse(localStorage.getItem('auth') ?? 'null')
if (authState != null) {
  if (isTokenExpired(authState.token)) {
    redirectToLogin()
  }

  fetch(`${getUserBaseRoute}/${authState.username}`)
    .then((response) => response.json())
    .then((data: IUser) => {
      if (data.role !== UserRoles.SMM) {
        redirectToLogin() // TODO: set message of redirect
      } else {
        app.provide(smmUserInject, data)
      }
    })

  app.provide(authInject, authState)
  console.log(authState)
  const response = await fetch(getClientsRoute, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + authState.token
    }
  })
  const clients: IUser[] = await (response as Response).json()
  app.provide(clientInject, clients)

  if (clients.length === 0) {
    // TODO: if a smm user has no clients redirect to page that tells him
    // how to gain clients and handle them.
  } else {
    let currentClient = ref<IUser>(clients[0] as IUser)
    const setClient = (client: IUser) => {
      currentClient.value = client
    }
    app.provide(currentClientInject, { currentClient, setClient })
  }
}

// @ts-ignore
Vue.use(BootstrapVue).use(IconsPlugin)

app.use(router).mount('#app')
