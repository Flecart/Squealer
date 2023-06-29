<script setup lang="ts">
import ChooseClientsVue from '@/components/ChooseClients.vue'
import CurrentQuotaVue from '@/components/CurrentQuota.vue'
import { inject, ref, watch, computed } from 'vue'
import { currentClientInject, type currentClientType } from '@/keys'
import type { IQuotas } from '@model/quota'
import { geolocalizationName } from '@/routes'

const { currentClient, setClient } = inject<currentClientType>(currentClientInject)!

const usedQuota = ref<number>(0)
const fileInputRef = ref<HTMLInputElement>()
const choosenFile = ref<File>()

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

watch(choosenFile, () => {
  console.log('choosenFile')
  console.log(choosenFile.value)
})

const handleSubmit = () => {
  console.log('submit')
}

const selectFileInput = () => {
  fileInputRef.value?.click()
}

const handleFileChange = (e: Event) => {
  const target = e.target as HTMLInputElement
  choosenFile.value = target.files![0]
}

const uploadedImageURl = computed<string>(() => {
  return URL.createObjectURL(choosenFile.value as Blob)
})

const removeImage = () => {
  choosenFile.value = undefined
  fileInputRef.value!.value = ''
}
</script>

<template>
  <h1>Post a message for {{ currentClient.username }}</h1>
  <ChooseClientsVue />

  <p>
    Here you can post a message for your client. If you want to post a Map position go to
    <router-link :to="{ name: geolocalizationName }">Post Map</router-link>
  </p>
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

    <template v-if="choosenFile">
      <div class="mt-3 border position-relative">
        <template v-if="choosenFile.type.startsWith('image/')">
          <b-img :src="uploadedImageURl" fluid alt="image preview" />
        </template>
        <template v-else-if="choosenFile.type.startsWith('video/')">
          <video className="mb-3 w-100" controls>
            <source :src="uploadedImageURl" :type="choosenFile.type" />
          </video>
        </template>
        <b-button
          aria-label="remove file"
          title="remove file"
          @click="removeImage"
          tabindex="0"
          class="close-image rounded-circle p-1 m-1"
          variant="danger"
        >
          <b-icon-x-circle aria-hidden="true"></b-icon-x-circle>
        </b-button>
      </div>
    </template>
    <template v-else>
      <div class="mt-3">
        <b-form-textarea
          v-model="textInput"
          placeholder="Write your message here. You can also send image or video with the button below."
          rows="3"
          max-rows="6"
        ></b-form-textarea>
      </div>
    </template>

    <div class="d-flex justify-content-between align-items-center mx-3 mt-3">
      <b-button
        pill
        class="rounded-3"
        variant="dark"
        aria-label="click to send image"
        title="send image"
        @click="selectFileInput"
      >
        <div aria-hidden="true" class="d-none custom-file b-form-file">
          <input
            @change="handleFileChange"
            class="custom-file-input"
            ref="fileInputRef"
            type="file"
            accept="image/*, video/*"
            id="hidden-file-input"
          />
          <label class="custom-file-label" data-browse="Browse" for="hidden-file-input">
            <span class="d-block form-file-text" style="pointer-events: none">
              No file chosen
            </span>
          </label>
        </div>

        <b-icon-file-earmark-image-fill aria-hidden="true"></b-icon-file-earmark-image-fill>
      </b-button>
      <b-button type="submit" variant="primary">Send</b-button>
    </div>
  </b-form>
</template>

<style lang="scss" scoped>
@import 'bootstrap/scss/bootstrap.scss';

.form {
  max-width: 100vw;
}

.close-image {
  display: flex;
  justify-content: center;
  align-items: center;
  position: absolute;
  top: 0;
  right: 0;
  z-index: 1;
}

@media screen and (min-width: map-get($grid-breakpoints, md)) {
  .form {
    max-width: 50vw;
  }
}
</style>
