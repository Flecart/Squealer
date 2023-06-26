<script setup lang="ts">
import { ref, inject, watch, computed } from 'vue'
import { getClientMessageBaseRoute } from '@/routes'
import { currentClientInject, type currentClientType } from '@/keys'
import type { IMessage } from '@model/message'
import { urgentThreshold } from '@model/quota'
import BuyModalVue from './BuyModal.vue'
import PostVue from './Post.vue'
import ChooseClientsVue from './ChooseClients.vue'
import { toEnglishString } from '@/utils'

const { currentClient: selectedClient, setClient: _ } =
    inject<currentClientType>(currentClientInject)!
console.log(selectedClient)
watch(selectedClient, (newValue, oldValue) => {
    if (newValue !== oldValue) {
        fetchMessages(newValue.username).then((data) => {
            messages.value = data
        })
    }
})
const hasFetchedClients = ref<boolean>(false)

const messages = ref<IMessage[]>([])

hasFetchedClients.value = true

function fetchMessages(currentClient: string) {
    return fetch(`${getClientMessageBaseRoute}/${currentClient}`).then((response) =>
        response.json()
    )
}

const quotaDay = computed<number>(() => {
    return selectedClient.value.maxQuota.day - selectedClient.value.usedQuota.day
})

const quotaWeek = computed<number>(() => {
    return selectedClient.value.maxQuota.week - selectedClient.value.usedQuota.week
})

const quotaMonth = computed<number>(() => {
    return selectedClient.value.maxQuota.month - selectedClient.value.usedQuota.month
})

const isUrgentQuota = computed<boolean>(() => {
    return Math.min(quotaDay.value, quotaWeek.value, quotaMonth.value) < urgentThreshold
})
</script>
<template>
    <h1>SMM Dashboard</h1>
    <ChooseClientsVue />

    <div class="quota-groups me-2">
        <template v-if="hasFetchedClients">
            <BuyModalVue
                class="me-2 mb-1"
                :username="selectedClient.username"
                :urgent="isUrgentQuota"
            />
        </template>
        <template v-else>
            <b-spinner label="Loading..."></b-spinner>
        </template>
        <template v-if="isUrgentQuota">
            <b-alert variant="danger" show>
                You have less than {{ urgentThreshold }} characters left for today. Please buy more
                quota.
            </b-alert>
        </template>
    </div>

    <div class="mt-2">
        Current client quota:
        <b-badge class="mx-1" variant="primary"
            >Daily
            <span :aria-label="toEnglishString(quotaDay)"> {{ quotaDay }} </span>
            characters</b-badge
        >
        <b-badge class="mx-1" variant="primary"
            >Weekly
            <span :aria-label="toEnglishString(quotaWeek)"> {{ quotaWeek }} </span>
            characters</b-badge
        >
        <b-badge class="mx-1" variant="primary"
            >Monthly
            <span :aria-label="toEnglishString(quotaMonth)"> {{ quotaMonth }} </span>
            characters</b-badge
        >
    </div>

    <div class="posts">
        <template v-if="messages.length === 0">
            <b-alert variant="info" show> No posts found for this client. </b-alert>
        </template>
        <PostVue
            v-for="message in messages"
            :key="message._id.toString()"
            :message="message"
            :author="selectedClient"
        />
    </div>
</template>

<style scoped>
h1 {
    font-weight: 500;
    font-size: 2.4rem;
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
