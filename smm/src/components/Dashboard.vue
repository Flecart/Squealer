<script setup lang="ts">
import { ref, inject } from 'vue'
import { getClientsRoute } from '@/routes'
import type { IUser } from '@model/user'
import BuyModal from './BuyModal.vue'
defineProps<{
  msg: string
}>()

const authState: { token: string } = inject('auth')!
const clients = ref<IUser[]>([])
const selectedClient = ref<string>('loading...')
const hasFetchedClients = ref<boolean>(false)

const selectClient = (client: string) => {
  selectedClient.value = client
}

fetch(getClientsRoute, {
  headers: {
    'Content-Type': 'application/json',
    Authorization: 'Bearer ' + authState.token
  }
})
  .then((response) => response.json())
  .then((data) => {
    clients.value = data
    selectedClient.value = data[0].username
    hasFetchedClients.value = true
  })
</script>

<template>
  <h1>SMM Dashboard</h1>
  <div class="client-name">
    <span> Current client: </span>
    <b-dropdown :text="selectedClient" class="m-md-2">
      <b-dropdown-item
        v-for="client in clients"
        :key="client.username"
        @click="selectClient(client.username)"
      >
        {{ client.username }}
      </b-dropdown-item>
    </b-dropdown>
  </div>
  <template v-if="hasFetchedClients">
    <BuyModal :username="selectedClient" />
  </template>
  <template v-else>
    <b-spinner label="Loading..."></b-spinner>
  </template>
</template>

<style scoped>
h1 {
  font-weight: 500;
  font-size: 2.4rem;
}

.client-name {
  font-weight: 400;
  font-size: 1.8rem;

  display: flex;
  align-items: center;
}
</style>
