<script setup lang="ts">
import ChooseClientsVue from '@/components/ChooseClients.vue'
import CurrentQuotaVue from '@/components/CurrentQuota.vue'
import { inject, ref, watch, computed, onMounted, onBeforeUnmount } from 'vue'
import { currentClientInject, authInject, type currentClientType } from '@/keys'
import type { IQuotas } from '@model/quota'
import { geolocalizationName, postClientMessageRoute } from '@/routes'
import { mediaQuotaValue, type MessageCreation } from '@model/message'

const { currentClient, setClient } = inject<currentClientType>(currentClientInject)!
const authToken = inject<{ token: string }>(authInject)!

const usedQuota = ref<number>(0)
const fileInputRef = ref<HTMLInputElement>()
const choosenFile = ref<File>()

const errorMessage = ref<string>('')
const successMessage = ref<string>('')
const secondsToShowError = 5

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

watch(choosenFile, (newValue) => {
  if (newValue) {
    usedQuota.value = mediaQuotaValue
  } else {
    usedQuota.value = 0
  }
})

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

const handleSubmit = () => {
  if (remainingQuota.value.day < 0) {
    setErrorMessage('Your client has exceeded his daily quota, go to to buy some quota!')
    return
  }

  const message: MessageCreation = {
    content: {
      type: 'text',
      data: textInput.value
    },
    channel: channelInput.value,
    parent: undefined
  }

  const formData = new FormData()
  if (choosenFile.value) {
    message.content.type = choosenFile.value.type.startsWith('image/') ? 'image' : 'video'
    formData.append('file', choosenFile.value)
  }

  formData.append('data', JSON.stringify(message))

  removeImage()
  textInput.value = ''
  channelInput.value = ''

  fetch(`${postClientMessageRoute}/${currentClient.value.username}`, {
    method: 'POST',
    headers: {
      Authorization: 'Bearer ' + authToken.token
    },
    body: formData
  })
    .then(async (response) => {
      if (response.ok) {
        setSuccessMessage('Message sent successfully')
        setErrorMessage('')
      } else {
        const body = await response.json()
        throw new Error(body.message ?? 'Error sending message')
      }
    })
    .catch((error) => {
      setErrorMessage(error.message ?? 'Error sending message')
      setSuccessMessage('')
    })
}

const setErrorMessage = (message: string) => {
  errorMessage.value = message
  setTimeout(() => {
    errorMessage.value = ''
  }, secondsToShowError * 1000)
}

const setSuccessMessage = (message: string) => {
  successMessage.value = message
  setTimeout(() => {
    successMessage.value = ''
  }, secondsToShowError * 1000)
}

// UNDER: handling of suggestion for channels

const suggestionShowed = computed(() => {
  return channelInput.value.length > 0
})

const suggestions = ref<string[]>(['prova1', 'prova2'])
const activeSuggestionIdx = ref<number>(0)

const handleKeyDown = (e: KeyboardEvent) => {
  if (e.key === 'Enter') {
    e.preventDefault() // prevent form submission
  }

  if (suggestionShowed.value) {
    console.log('got key input')

    if (e.key === 'ArrowUp') {
      activeSuggestionIdx.value = Math.max(0, activeSuggestionIdx.value - 1)
    } else if (e.key === 'ArrowDown') {
      activeSuggestionIdx.value = Math.min(
        suggestions.value.length - 1,
        activeSuggestionIdx.value + 1
      )
    } else if (e.key === 'Enter') {
      channelInput.value = suggestions.value[activeSuggestionIdx.value]
    }
    if (e.key === 'Enter' && e.ctrlKey) {
      handleSubmit()
    }
  }
}

const chooseSuggestion = (suggestionIdx: number) => {
  channelInput.value = suggestions.value[suggestionIdx] as string
  activeSuggestionIdx.value = suggestionIdx
}

onMounted(() => {
  document.addEventListener('keydown', handleKeyDown)
})

onBeforeUnmount(() => {
  document.removeEventListener('keydown', handleKeyDown)
})
</script>

<template>
  <h1>Post a message for {{ currentClient.username }}</h1>
  <ChooseClientsVue />

  <p>
    Here you can post a message for your client. If you want to post a Map position go to
    <router-link :to="{ name: geolocalizationName }">Post Map</router-link>
  </p>
  <CurrentQuotaVue :client="currentClient" :remaining-quota="remainingQuota" />

  <b-form class="width-limit mb-3" @submit.prevent="handleSubmit">
    <div class="position-relative">
      <label class="sr-only" for="inline-form-input-channel">Channel</label>
      <b-input-group prepend="Channel" class="mb-2 mt-2 mr-sm-2 mb-sm-0">
        <b-form-input
          v-model="channelInput"
          id="inline-form-input-channel"
          placeholder="Enter Channel name"
        ></b-form-input>
      </b-input-group>
      <b-list-group v-if="suggestionShowed" class="position-absolute" role="listbox">
        <template v-for="(suggestion, i) in suggestions" :key="suggestion">
          <b-list-group-item
            @click="chooseSuggestion(i)"
            role="option"
            :active="i === activeSuggestionIdx"
          >
            {{ suggestion }}
          </b-list-group-item>
        </template>
      </b-list-group>
    </div>

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

  <div class="width-limit">
    <b-alert :show="errorMessage.length > 0 ? secondsToShowError : 0" variant="danger">{{
      errorMessage
    }}</b-alert>
    <b-alert :show="successMessage.length > 0 ? secondsToShowError : 0" variant="success">{{
      successMessage
    }}</b-alert>
  </div>
</template>

<style lang="scss" scoped>
@import 'bootstrap/scss/bootstrap.scss';

.width-limit {
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
  .width-limit {
    max-width: 50vw;
  }
}
</style>
