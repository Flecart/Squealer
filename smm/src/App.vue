<script setup lang="ts">
import { inject, provide, ref, onMounted } from 'vue'
import SideBar from './components/SideBar.vue'
import type { IUser } from '@model/user'
import { getClientsRoute } from '@/routes'

const clients = ref<IUser[]>([])

onMounted(async () => {
  const authState: { token: string } = inject('auth')!
  console.log(authState)
  const response = await fetch(getClientsRoute, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + authState.token
    }
  })
  console.log('response', response)
  const jsonResponse = await response.json()

  clients.value = jsonResponse
  provide('clients', clients)
  console.log(clients.value)
})
</script>

<template>
  <SideBar />
  <main>
    <router-view></router-view>
  </main>
</template>

<style lang="scss" scoped>
@import 'bootstrap/scss/bootstrap.scss';

@media screen and (min-width: map-get($grid-breakpoints, md)) {
  main {
    margin-left: 22rem;
  }
}
</style>
