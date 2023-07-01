<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, inject } from 'vue'
import ChooseClientsVue from '@/components/ChooseClients.vue'
import 'leaflet/dist/leaflet.css'
import markerIconPng from 'leaflet/dist/images/marker-icon.png'
import L, { Icon } from 'leaflet'
import { postClientMessageRoute } from '@/routes'
import type { Maps as MapsMessage, MessageCreation } from '@model/message'
import { type currentClientType, currentClientInject, authInject } from '@/keys'
import { stringFormat } from '@/utils'

// https://stackoverflow.com/questions/60174040/marker-icon-isnt-showing-in-leaflet
const icon = new Icon({ iconUrl: markerIconPng, iconSize: [25, 41], iconAnchor: [12, 41] })
const sanDonatoBologna = [
  44.498026, // lat
  11.355863 // lng
]
const map = ref<HTMLElement>()
const inputValue = ref<string>('')
const errorMessage = ref<string>('')
const successMessage = ref<string>('')
const secondsToShowError = 5
const { currentClient, setClient: _ } = inject<currentClientType>(currentClientInject)!
const authToken = inject<{ token: string }>(authInject)!

let mapInstance: L.Map

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

const getPositionLabel = (map: L.Map) => {
  const center = map.getCenter()
  return `This is your current position: (Lat: ${center.lat.toFixed(3)}, Lng: ${center.lng.toFixed(
    3
  )})`
}

const showErrorSeconds = computed(() => {
  return errorMessage.value.length > 0 ? secondsToShowError : 0
})

const showSuccessSeconds = computed(() => {
  return successMessage.value.length > 0 ? secondsToShowError : 0
})

onMounted(() => {
  mapInstance = L.map(map.value as HTMLElement, { zoomControl: true, dragging: true }).setView(
    sanDonatoBologna as L.LatLngTuple,
    10
  )
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(mapInstance)
  const marker = L.marker(mapInstance.getCenter(), { icon })
    .addTo(mapInstance)
    .bindPopup(getPositionLabel(mapInstance))

  mapInstance.addEventListener('move', () => {
    marker.setLatLng(mapInstance.getCenter()).bindPopup(getPositionLabel(mapInstance))
  })
})

onBeforeUnmount(() => {
  mapInstance.remove()
})

const handleSubmit = () => {
  if (inputValue.value.length === 0) {
    errorMessage.value = 'Please insert a channel name'
    return
  }
  // TODO: make a quota check in front end before submitting, but this is not important.
  const center = mapInstance.getCenter()
  const centerLat = center.lat
  const centerLng = center.lng

  const message: MessageCreation = {
    content: {
      type: 'maps',
      data: {
        positions: [{ lat: centerLat, lng: centerLng }]
      } as MapsMessage
    },
    channel: inputValue.value,
    parent: undefined
  }

  const formData = new FormData()
  formData.append('data', JSON.stringify(message))

  fetch(stringFormat(postClientMessageRoute, [currentClient.value.username]), {
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
</script>
<template>
  <div class="main">
    <h2>Geolocalization</h2>
    <ChooseClientsVue />

    <p class="info">
      In this page you can send a geolocalization post for your current client Just drag in the map
      to change the position of the marker and then click on the button to send the post.
    </p>

    <div class="map-container" ref="map"></div>

    <form @submit.prevent="handleSubmit" class="mb-3">
      <b-input-group id="channel-label" prepend="Channel Name:" class="mt-3">
        <b-form-input v-model="inputValue" aria-labelledby="channel-label"></b-form-input>
      </b-input-group>
      <button type="submit" class="btn btn-primary mt-3">Send</button>
    </form>
    <b-alert :show="showErrorSeconds" variant="danger">{{ errorMessage }}</b-alert>
    <b-alert :show="showSuccessSeconds" variant="success">{{ successMessage }}</b-alert>
  </div>
</template>

<style lang="scss" scoped>
@import 'bootstrap/scss/bootstrap.scss';

.main {
  width: 80%;
}

.map-container {
  height: 15rem;
}

.info {
  font-weight: 300;
}

@media screen and (min-width: map-get($grid-breakpoints, md)) {
  .info {
    width: 60%;
  }
}
</style>
