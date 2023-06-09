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

// TODO: use similar to fetch api!
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
  <div v-if="hasFetchedClients">
    <BuyModal :username="selectedClient" />
  </div>
  <!-- TODO: put a spinner if not fetched -->
</template>

<style scoped>
h1 {
  font-weight: 500;
  font-size: 2.4rem;
  padding-left: 2rem;
  padding-top: 1rem;
}

.client-name {
  font-weight: 400;
  font-size: 1.8rem;
  padding-left: 2rem;
  padding-top: 1rem;

  display: flex;
  align-items: center;
}
</style>
