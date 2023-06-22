<script setup lang="ts">
import { ref, inject, watch, computed } from 'vue'
import { getClientMessageBaseRoute } from '@/routes'
import { clientInject } from '@/keys'
import type { IUser } from '@model/user'
import type { IMessage, IMessageWithPages } from '@model/message'
import { urgentThreshold } from '@model/quota'
import BuyModal from './BuyModal.vue'
import Post from './Post.vue'
import { toEnglishString } from '@/utils'
import { assert } from 'console'

defineProps<{
  msg: string
}>()

const currentPage = ref<number>(0)
const totalPages = ref<number>(1)
const selectedClient = ref<string>('loading...')
watch([selectedClient, currentPage], ([newValue, newPage], [oldValue, oldPage]) => {
  if (newValue !== oldValue || newPage !== oldPage) {
    fetchMessages(newValue, newPage).then((data: IMessageWithPages) => {
      messages.value = data.messages
      totalPages.value = data.pages
    })
  }
})

const messages = ref<IMessage[]>([])

const selectClient = (client: string) => {
  selectedClient.value = client
}

const clients = inject<IUser[]>(clientInject)!

const hasClients = computed<boolean>(() => {
  return clients.length > 0
})

if (hasClients.value) {
  selectedClient.value = clients[0].username
} else {
  selectedClient.value = 'No clients'
}

function fetchMessages(currentClient: string, page: number) {
  return fetch(`${getClientMessageBaseRoute}/${currentClient}?page=${page}`).then((response) =>
    response.json()
  )
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

const setPreviousPage = () => {
  currentPage.value = Math.max(currentPage.value - 1, 0)
}

const setNextPage = () => {
  currentPage.value = Math.min(currentPage.value + 1, totalPages.value - 1)
}

const setPageNumber = (page: number) => {
  currentPage.value = page
}
</script>
<template>
  <h1>SMM Dashboard</h1>
  <div class="client-name">
    <span> Current client: </span>
    <b-dropdown :text="selectedClient" class="m-2">
      <b-dropdown-item
        v-for="client in clients"
        :key="client.username"
        @click="selectClient(client.username)"
      >
        {{ client.username }}
      </b-dropdown-item>
    </b-dropdown>
  </div>

  <template v-if="!hasClients">
    <b-alert variant="info" show>
      No clients found. Ask for some <span class="font-weight-bold">VIP</span> users to add you as
      his/her SMM manager</b-alert
    >
  </template>

  <template v-else>
    <div class="quota-groups me-2">
      <BuyModal class="me-2 mb-1" :username="selectedClient" :urgent="isUrgentQuota" />
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
        <span :aria-label="toEnglishString(quotaMonth)"> {{ quotaMonth }} </span>
        characters</b-badge
      >
    </div>

    <nav aria-label="Post pagination">
      <ul class="pagination">
        <li class="page-item">
          <div
            role="button"
            class="page-link"
            aria-label="Previous"
            :disabled="currentPage == 0"
            @click="setPreviousPage"
          >
            <span aria-hidden="true">&laquo;</span>
            <span class="sr-only">Previous</span>
          </div>
        </li>

        <li class="page-item" v-if="currentPage > 1" aria-label="First page">
          <div role="button" class="page-link" @click="setPageNumber(0)">1...</div>
        </li>
        <li class="page-item" v-if="currentPage != 0">
          <div role="button" class="page-link" @click="setPreviousPage">{{ currentPage }}</div>
        </li>

        <li class="page-item active" aria-label="Current Page">
          <div role="button" class="page-link" active>{{ currentPage + 1 }}</div>
        </li>
        <li class="page-item" v-if="currentPage != totalPages - 1">
          <div role="button" class="page-link" @click="setNextPage">
            {{ currentPage + 2 }}
          </div>
        </li>
        <li class="page-item" v-if="currentPage < totalPages - 2" aria-label="Last Page">
          <div role="button" class="page-link" @click="setPageNumber(totalPages - 1)">
            ...{{ totalPages }}
          </div>
        </li>
        <li class="page-item">
          <div
            role="button"
            class="page-link"
            aria-label="Next"
            :disabled="currentPage == totalPages - 1"
            @click="setNextPage"
          >
            <span aria-hidden="true">&raquo;</span>
            <span class="sr-only">Next</span>
          </div>
        </li>
      </ul>
    </nav>
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
  margin-right: 2rem;
  display: flex;
  flex-wrap: wrap;
  width: 100%;
}

.quota-groups {
  display: flex;
  flex-direction: row;

  align-items: center;
  margin-top: 1rem;
}

.quota-groups .alert {
  margin: 0 0 0 1rem;
}

.pagination {
  margin-top: 1rem;
}

@media screen and (max-width: 990px) {
  .quota-groups {
    flex-wrap: wrap;
  }
}
</style>
