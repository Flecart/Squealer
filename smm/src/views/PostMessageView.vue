<script setup lang="ts">
import ChooseClientsVue from '@/components/ChooseClients.vue'
import CurrentQuotaVue from '@/components/CurrentQuota.vue'
import { inject, ref, watch, computed } from 'vue'
import { currentClientInject } from '@/keys'
import type { IQuotas } from '@model/quota'

const { currentClient, setClient } = inject(currentClientInject)!

const usedQuota = ref<number>(0)

const remainingQuota = computed<IQuotas>(() => {
  return {
    day: currentClient.value.maxQuota.day - currentClient.value.usedQuota.day - usedQuota.value,
    week: currentClient.value.maxQuota.week - currentClient.value.usedQuota.week - usedQuota.value,
    month:
      currentClient.value.maxQuota.month - currentClient.value.usedQuota.month - usedQuota.value
  } as IQuotas
})

const channelInput = ref<string>('')
const textInput = ref<string>('')

watch(textInput, (newValue, _oldValue) => {
  usedQuota.value = newValue.length
})

const handleSubmit = () => {
  console.log('submit')
}
</script>

<template>
  <h1>Post a message for {{ currentClient.username }}</h1>
  <ChooseClientsVue />
  <CurrentQuotaVue :client="currentClient" :remaining-quota="remainingQuota" />

  <b-form class="form" @submit.prevent="handleSubmit">
    <label class="sr-only" for="inline-form-input-channel">Channel</label>
    <b-input-group prepend="Channel" class="mb-2 mr-sm-2 mb-sm-0">
      <b-form-input
        v-model="channelInput"
        id="inline-form-input-channel"
        placeholder="the channel you want to post to"
      ></b-form-input>
    </b-input-group>

    <b-form-textarea
      v-model="textInput"
      placeholder="Enter something to send..."
      rows="3"
      max-rows="6"
    ></b-form-textarea>
  </b-form>
</template>

<style scoped></style>
