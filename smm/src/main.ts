import Vue, { createApp } from 'vue'
import App from './App.vue'
import { BootstrapVue, IconsPlugin } from 'bootstrap-vue'

import './assets/app.scss'

// // Make BootstrapVue available throughout your project
Vue.use(BootstrapVue)
// // Optionally install the BootstrapVue icon components plugin
// Vue.use(IconsPlugin)

createApp(App).mount('#app')
