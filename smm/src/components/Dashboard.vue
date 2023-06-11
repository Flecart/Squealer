<script setup lang="ts">
import { ref, inject, onMounted } from 'vue'
import { getClientsRoute, getClientMessageBaseRoute } from '@/routes'
import type { IUser } from '@model/user'
import type { IMessage } from '@model/message'
import BuyModal from './BuyModal.vue'
import Post from './Post.vue'
defineProps<{
  msg: string
}>()

const authState: { token: string } = inject('auth')!
const clients = ref<IUser[]>([])
const selectedClient = ref<string>('loading...')
const hasFetchedClients = ref<boolean>(false)

const messages = ref<IMessage[]>([])
// const hasFetchedMessages = ref<boolean>(false)

const selectClient = (client: string) => {
  selectedClient.value = client
}

onMounted(async () => {
  const response = await fetch(getClientsRoute, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + authState.token
    }
  })
  const jsonResponse = await response.json()

  clients.value = jsonResponse
  selectedClient.value = jsonResponse[0].username
  hasFetchedClients.value = true

  const messagesResponse = await fetch(`${getClientMessageBaseRoute}/${selectedClient.value}`)
  const messagesJsonResponse = await messagesResponse.json()
  messages.value = messagesJsonResponse
  console.log(messages.value)
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

  <Post
    v-for="message in messages"
    :key="message._id"
    :message="message"
    :author="clients.find((c) => c.username === selectedClient)"
  />
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
