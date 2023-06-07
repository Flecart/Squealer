<script setup lang="ts">
import { ref } from 'vue'
import { inject } from 'vue'
import { IUser } from '@model/user'

defineProps<{
  msg: string
}>()

const authState: { token: string } = inject('auth')!

const clients = ref<IUser[]>([])
const selectedClient = ref<string>('Loading')

const selectClient = (client: string) => {
  selectedClient.value = client
}

// TODO: this is just an example, you need to fix this!
fetch('http://localhost:3000/api/smm/clients', {
  headers: {
    'Content-Type': 'application/json',
    Authorization: 'Bearer ' + authState.token
  }
})
  .then((response) => response.json())
  .then((data) => {
    clients.value = data
    selectedClient.value = data[0].username
  })
</script>

<template>
  <h1>SMM Dashboard</h1>
  <div class="client-name">
    <span> Current client: </span>
    <b-dropdown :text="selectedClient" class="m-md-2">
      <!-- TODO: the client should be fetched from the backend -->
      <b-dropdown-item
        v-for="client in clients"
        :key="client.username"
        @click="selectClient(client.username)"
      >
        {{ client.username }}
      </b-dropdown-item>
    </b-dropdown>
  </div>
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

.client-name span {
}
</style>
