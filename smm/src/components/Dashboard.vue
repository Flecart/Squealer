<script setup lang="ts">
import { ref, inject, watch } from 'vue'
import { getClientMessageBaseRoute } from '@/routes'
import { clientInject } from '@/keys'
import type { IUser } from '@model/user'
import type { IMessage } from '@model/message'
import BuyModal from './BuyModal.vue'
import Post from './Post.vue'

defineProps<{
  msg: string
}>()

const selectedClient = ref<string>('loading...')
watch(selectedClient, (newValue, oldValue) => {
  if (newValue !== oldValue) {
    fetchMessages(newValue).then((data) => {
      messages.value = data
    })
  }
})
const hasFetchedClients = ref<boolean>(false)

const messages = ref<IMessage[]>([])

const selectClient = (client: string) => {
  selectedClient.value = client
}

const clients = inject<IUser[]>(clientInject)!
selectedClient.value = clients[0].username
hasFetchedClients.value = true

function fetchMessages(currentClient: string) {
  return fetch(`${getClientMessageBaseRoute}/${currentClient}`).then((response) => response.json())
}
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

  <div class="posts">
    <template v-if="messages.length === 0">
      <b-alert variant="info" show> No posts found for this client. </b-alert>
    </template>
    <Post
      v-for="message in messages"
      :key="message._id.toString()"
      :message="message"
      :author="(clients.find((c) => c.username === selectedClient) as IUser)"
    />
  </div>
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

.posts {
  margin-top: 2rem;
  margin-right: 2rem;
  display: flex;
  flex-wrap: wrap;
  width: 100%;
}
</style>
