<script setup lang="ts">
import { ref, inject, watch, computed } from 'vue'
import { getClientMessageBaseRoute } from '@/routes'
import { clientInject } from '@/keys'
import type { IUser } from '@model/user'
import type { IMessage } from '@model/message'
import { urgentThreshold } from '@model/quota'
import BuyModal from './BuyModal.vue'
import Post from './Post.vue'
import { toEnglishString } from '@/utils'

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

const currentClient = computed<IUser>(() => {
  return clients.find((c) => c.username === selectedClient.value) as IUser
})

const quotaDay = computed<number>(() => {
  return currentClient.value.maxQuota.day - currentClient.value.usedQuota.day
})

const quotaWeek = computed<number>(() => {
  return currentClient.value.maxQuota.week - currentClient.value.usedQuota.week
})

const quotaMonth = computed<number>(() => {
  return currentClient.value.maxQuota.month - currentClient.value.usedQuota.month
})

const isUrgentQuota = computed<boolean>(() => {
  return Math.min(quotaDay.value, quotaWeek.value, quotaMonth.value) < urgentThreshold
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

  <div class="quota-groups me-2">
    <template v-if="hasFetchedClients">
      <BuyModal class="me-2 mb-1" :username="selectedClient" :urgent="isUrgentQuota" />
    </template>
    <template v-else>
      <b-spinner label="Loading..."></b-spinner>
    </template>
    <template v-if="isUrgentQuota">
      <b-alert variant="danger" show>
        You have less than {{ urgentThreshold }} characters left for today. Please buy more quota.
      </b-alert>
    </template>
  </div>

  <div class="mt-2">
    Current client quota:
    <b-badge class="mx-1" variant="primary"
      >Daily
      <span :aria-label="toEnglishString(quotaDay)"> {{ quotaDay }} </span> characters</b-badge
    >
    <b-badge class="mx-1" variant="primary"
      >Weekly
      <span :aria-label="toEnglishString(quotaWeek)"> {{ quotaWeek }} </span> characters</b-badge
    >
    <b-badge class="mx-1" variant="primary"
      >Monthly
      <span :aria-label="toEnglishString(quotaMonth)"> {{ quotaMonth }} </span> characters</b-badge
    >
  </div>

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

.quota-groups {
  display: flex;
  flex-direction: row;
  justify-content: space-between;

  align-items: center;
  margin-top: 1rem;
}

.quota-groups .alert {
  margin: 0;
}

@media screen and (max-width: 990px) {
  .quota-groups {
    flex-wrap: wrap;
  }
}
</style>
