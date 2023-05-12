import Vue, { createApp } from 'vue'
import App from './App.vue'
import { BootstrapVue, IconsPlugin } from 'bootstrap-vue'

import './assets/app.scss'

// Make BootstrapVue available throughout your project
// @ts-ignore BootstrapVue is not compatible with Vue 3, see vite config for the workaround
Vue.use(BootstrapVue)
// Optionally install the BootstrapVue icon components plugin
// @ts-ignore BootstrapVue is not compatible with Vue 3, see vite config for the workaround
Vue.use(IconsPlugin)

createApp(App).mount('#app')
