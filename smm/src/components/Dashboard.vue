<script setup lang="ts">
import { ref, inject, watch, computed } from 'vue'
import { getClientMessageRoute } from '@/routes'
import { currentClientInject, type currentClientType } from '@/keys'
import type { IMessage, IMessageWithPages, MessageSortTypes } from '@model/message'
import { type IQuotas, urgentThreshold } from '@model/quota'
import BuyModalVue from './BuyModal.vue'
import PostVue from './Post.vue'
import ChooseClientsVue from './ChooseClients.vue'
import CurrentQuota from './CurrentQuota.vue'
import { stringFormat, ShowType } from '@/utils'

const { currentClient: selectedClient, setClient: _ } =
  inject<currentClientType>(currentClientInject)!

interface SortMode {
  title: string
  value: MessageSortTypes
  type: ShowType
}

const messageSortModes: SortMode[] = [
  {
    title: 'By Popularity',
    value: 'popularity',
    type: ShowType.POPULARITY
  },
  {
    title: 'By Unpopularity',
    value: 'unpopularity',
    type: ShowType.POPULARITY
  },
  {
    title: 'By Reaction Number Asc',
    value: 'reactions-asc',
    type: ShowType.REACTIONS
  },
  {
    title: 'By Reaction Number Desc',
    value: 'reactions-desc',
    type: ShowType.REACTIONS
  },
  {
    title: 'By Controvery Risk',
    value: 'risk',
    type: ShowType.CONTROVERSY
  }
]

const currentPage = ref<number>(0)
const totalPages = ref<number>(1)
const tabIndex = ref<number>(0)
const showType = ref<ShowType>(ShowType.POPULARITY)

fetchMessages(selectedClient.value.username, currentPage.value)
watch(
  [selectedClient, currentPage, tabIndex],
  ([newValue, newPage, newPageIndex], [oldValue, oldPage, oldPageIndex]) => {
    if (newValue !== oldValue || newPage !== oldPage || newPageIndex !== oldPageIndex) {
      const sort = messageSortModes[newPageIndex].value
      showType.value = messageSortModes[newPageIndex].type
      fetchMessages(newValue.username, newPage, sort)
    }

    if (newPage === oldPage) {
      currentPage.value = 0
    }
  }
)

const messages = ref<IMessage[]>([])

function fetchMessages(currentClient: string, page: number, sort: MessageSortTypes = 'popularity') {
  return fetch(`${stringFormat(getClientMessageRoute, [currentClient])}?page=${page}&sort=${sort}`)
    .then((response) => response.json())
    .then((data: IMessageWithPages) => {
      messages.value = data.messages
      totalPages.value = data.pages
      return data
    })
}

const remainingQuota = computed<IQuotas>(() => {
  return {
    day: selectedClient.value.maxQuota.day - selectedClient.value.usedQuota.day,
    week: selectedClient.value.maxQuota.week - selectedClient.value.usedQuota.week,
    month: selectedClient.value.maxQuota.month - selectedClient.value.usedQuota.month
  } as IQuotas
})

const isUrgentQuota = computed<boolean>(() => {
  return (
    Math.min(remainingQuota.value.day, remainingQuota.value.week, remainingQuota.value.month) <
    urgentThreshold
  )
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
  <div class="content">
    <ChooseClientsVue />

    <div class="quota-groups me-2">
      <BuyModalVue class="me-2 mb-1" :username="selectedClient.username" :urgent="isUrgentQuota" />
      <template v-if="isUrgentQuota">
        <b-alert variant="danger" show>
          You have less than {{ urgentThreshold }} characters left for today. Please buy more quota.
        </b-alert>
      </template>
    </div>

    <CurrentQuota :client="selectedClient" :remaining-quota="remainingQuota" />

    <!-- TODO: questo dovrebbe essere sostituito da b-pagination, però la cosa buona è che si può usare anch ein moddash questo quasi. -->
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

    <b-card no-body>
      <b-tabs v-model="tabIndex" card>
        <template v-for="sortMode in messageSortModes" :key="sortMode.value">
          <b-tab :title="sortMode.title"></b-tab>
        </template>
      </b-tabs>
      <div class="posts">
        <template v-if="messages.length === 0">
          <b-alert variant="info" show> No posts found for this client. </b-alert>
        </template>
        <template v-else>
          <PostVue
            v-for="message in messages"
            :key="message._id.toString()"
            :message="message"
            :author="selectedClient"
            :show-type="showType"
          />
        </template>
      </div>
    </b-card>
  </div>
</template>

<style scoped>
h1 {
  font-weight: 500;
  font-size: 2.4rem;
}

.posts {
  margin-right: 1rem;
  margin-left: 1rem;
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
