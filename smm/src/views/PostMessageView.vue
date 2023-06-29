<script setup lang="ts">
import ChooseClientsVue from '@/components/ChooseClients.vue'
import CurrentQuotaVue from '@/components/CurrentQuota.vue'
import { inject, ref, watch, computed } from 'vue'
import { currentClientInject } from '@/keys'
import type { IQuotas } from '@model/quota'

const { currentClient, setClient } = inject(currentClientInject)!

const usedQuota = ref<number>(0)
const fileInputRef = ref<HTMLInputElement>()

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

const selectFileInput = () => {
  // console.log('selectFileInput')
  console.log(fileInputRef.value)
  fileInputRef.value?.click()
}
</script>

<template>
  <h1>Post a message for {{ currentClient.username }}</h1>
  <ChooseClientsVue />
  <CurrentQuotaVue :client="currentClient" :remaining-quota="remainingQuota" />

  <b-form class="form" @submit.prevent="handleSubmit">
    <label class="sr-only" for="inline-form-input-channel">Channel</label>
    <b-input-group prepend="Channel" class="mb-2 mt-2 mr-sm-2 mb-sm-0">
      <b-form-input
        v-model="channelInput"
        id="inline-form-input-channel"
        placeholder="Enter Channel name"
      ></b-form-input>
    </b-input-group>

    <div class="mt-3">
      <b-form-textarea
        v-model="textInput"
        placeholder="Write your message here. You can also send image or video with the button below."
        rows="3"
        max-rows="6"
      ></b-form-textarea>
    </div>

    <div class="d-flex justify-content-between align-items-center mx-3 mt-3">
      <b-button type="submit" variant="primary">Send</b-button>

      <b-button
        pill
        class="rounded-3"
        variant="dark"
        aria-label="click to send image"
        title="send image"
        @click="selectFileInput"
      >
        <b-form-file
          ref="fileInputRef"
          accept="image/*, video/*"
          aria-hidden="true"
          class="d-none"
        ></b-form-file>
        <b-icon-file-earmark-image-fill></b-icon-file-earmark-image-fill>
      </b-button>
    </div>
  </b-form>
</template>

<style lang="scss" scoped>
@import 'bootstrap/scss/bootstrap.scss';

.form {
  max-width: 100vw;
}

@media screen and (min-width: map-get($grid-breakpoints, md)) {
  .form {
    max-width: 50vw;
  }
}
</style>
