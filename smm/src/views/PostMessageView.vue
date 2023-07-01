<script setup lang="ts">
import ChooseClientsVue from '@/components/ChooseClients.vue'
import CurrentQuotaVue from '@/components/CurrentQuota.vue'
import { inject, ref, watch, computed, onMounted, onBeforeUnmount } from 'vue'
import { currentClientInject, authInject, type currentClientType } from '@/keys'
import type { IQuotas } from '@model/quota'
import {
  geolocalizationName,
  postClientMultipleMessagesRoute,
  getChannelSuggestions,
  getHashtabChannelSuggestions,
  getUserChannelSuggestions
} from '@/routes'
import { mediaQuotaValue, type MessageCreationMultipleChannels } from '@model/message'
import type { ISuggestion } from '@model/channel'
import { stringFormat } from '@/utils'

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
  usedQuota.value = newValue.length * choosedChannels.value.length
})

watch(choosenFile, (newValue) => {
  if (newValue) {
    usedQuota.value = mediaQuotaValue * choosedChannels.value.length
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

  const message: MessageCreationMultipleChannels = {
    content: {
      type: 'text',
      data: textInput.value
    },
    channels: choosedChannels.value,
    parent: undefined
  }

  const formData = new FormData()
  if (choosenFile.value) {
    message.content.type = choosenFile.value.type.startsWith('image/') ? 'image' : 'video'
    formData.append('file', choosenFile.value)
  }

  formData.append('data', JSON.stringify(message))

  fetch(stringFormat(postClientMultipleMessagesRoute, [currentClient.value.username]), {
    method: 'POST',
    headers: {
      Authorization: 'Bearer ' + authToken.token
    },
    body: formData
  })
    .then(async (response) => {
      if (response.ok) {
        setSuccessMessage('Messages sent successfully')
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

  choosedChannels.value = []
  removeImage()
  textInput.value = ''
  channelInput.value = ''
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

const choosedChannels = ref<string[]>([])
const suggestions = ref<string[]>([])
const activeSuggestionIdx = ref<number>(0)

enum SearchType {
  Hashtag,
  User,
  Channel
}

watch(channelInput, () => {
  if (channelInput.value.length <= 0) return

  let searchText = channelInput.value
  let searchType = SearchType.Channel

  let suggestionUrl = getChannelSuggestions
  if (searchText.startsWith('#')) {
    searchType = SearchType.Hashtag
    suggestionUrl = getHashtabChannelSuggestions
    searchText = searchText.substring(1)
  } else if (searchText.startsWith('@')) {
    searchType = SearchType.User
    suggestionUrl = getUserChannelSuggestions
    searchText = searchText.substring(1)
  }

  const searchParams = {
    search: searchText
  }
  if (searchType === SearchType.Channel) {
    // @ts-expect-error
    searchParams.user = currentClient.value.username
  }

  const searchParamsString = new URLSearchParams(searchParams).toString()

  fetch(`${suggestionUrl}?${searchParamsString}`, {
    method: 'GET'
  })
    .then(async (response) => {
      if (response.ok) {
        return response.json()
      } else {
        const body = await response.json()
        throw new Error(body.message ?? 'Error getting suggestions')
      }
    })
    .then((elements: ISuggestion[]) => {
      suggestions.value = []
      // se è pubblico vogliamo dare la possibilità di aggiungere la sua scelta stessa.
      if (searchText.length > 0 && searchType === SearchType.Hashtag) {
        suggestions.value.push(addChannelPrefix(searchText, searchType))
      }
      elements.forEach((element: ISuggestion) => {
        suggestions.value.push(addChannelPrefix(element as string, searchType))
      })
    })
    .catch((error) => {
      suggestions.value = []
      // le suggestions non sono una feature da dare l'errore all'untente, quindi meglio solamente
      // un messaggio sulla console, serve solo per debug.
      console.log(error.message ?? 'Error getting suggestions')
      setSuccessMessage('')
    })
})

function addChannelPrefix(channel: string, type: SearchType) {
  switch (type) {
    case SearchType.Hashtag:
      return '#' + channel
    case SearchType.User:
      return '@' + channel
    case SearchType.Channel:
      return channel
    default:
      return channel
  }
}

const handleKeyDown = (e: KeyboardEvent) => {
  if (e.key === 'Enter' || e.key === 'ArrowUp' || e.key === 'ArrowDown') {
    e.preventDefault()
  }

  if (suggestionShowed.value) {
    if (e.key === 'ArrowUp') {
      activeSuggestionIdx.value = Math.max(0, activeSuggestionIdx.value - 1)
    } else if (e.key === 'ArrowDown') {
      activeSuggestionIdx.value = Math.min(
        suggestions.value.length - 1,
        activeSuggestionIdx.value + 1
      )
    } else if (e.key === 'Enter') {
      chooseSuggestion(activeSuggestionIdx.value)
    }
    if (e.key === 'Enter' && e.ctrlKey) {
      handleSubmit()
    }
  }
}

const chooseSuggestion = (suggestionIdx: number) => {
  activeSuggestionIdx.value = suggestionIdx
  if (!choosedChannels.value.includes(suggestions.value[suggestionIdx])) {
    choosedChannels.value.push(suggestions.value[suggestionIdx])
  }
  channelInput.value = ''
}

const removeSuggestion = (index: number) => {
  choosedChannels.value.splice(index, 1)
}

onMounted(() => {
  document.getElementById('inline-form-input-channel')!.addEventListener('keydown', handleKeyDown)
})

onBeforeUnmount(() => {
  document
    .getElementById('inline-form-input-channel')!
    .removeEventListener('keydown', handleKeyDown)
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
          autocomplete="off"
          v-model="channelInput"
          id="inline-form-input-channel"
          placeholder="Enter Channel name"
        ></b-form-input>
      </b-input-group>
      <b-list-group v-if="suggestionShowed" class="position-absolute" role="listbox">
        <template v-for="(suggestion, i) in suggestions" :key="suggestion">
          <b-list-group-item
            class="suggestion-item"
            @click="chooseSuggestion(i)"
            role="option"
            :active="i === activeSuggestionIdx"
          >
            {{ suggestion }}
          </b-list-group-item>
        </template>
      </b-list-group>
      <div class="channels">
        <template v-for="(channel, i) in choosedChannels" :key="channel">
          <b-badge variant="primary" class="mx-2"
            >{{ channel }}
            <b-icon-x
              tabindex="0"
              role="button"
              :aria-label="'remove channel ' + channel"
              @keydown.enter="removeSuggestion(i)"
              @click="removeSuggestion(i)"
            >
            </b-icon-x>
          </b-badge>
        </template>
      </div>
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

.suggestion-item {
  &:hover {
    cursor: pointer;
    color: white;
    background-color: var(--primary);
  }
}

@media screen and (min-width: map-get($grid-breakpoints, md)) {
  .width-limit {
    max-width: 50vw;
  }
}
</style>
