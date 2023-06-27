<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import ChooseClientsVue from '@/components/ChooseClients.vue'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
const sanDonatoBologna = [
  44.498026, // lat
  11.355863 // lng
]
const map = ref<HTMLElement>()
const inputValue = ref<string>('')

let mapInstance: L.Map

const getPositionLabel = (map: L.Map) => {
  const center = map.getCenter()
  return `This is your current position: (Lat: ${center.lat.toFixed(3)}, Lng: ${center.lng.toFixed(
    3
  )})`
}

onMounted(() => {
  mapInstance = L.map(map.value as HTMLElement, { zoomControl: true, dragging: true }).setView(
    sanDonatoBologna as L.LatLngTuple,
    10
  )
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(mapInstance)
  const marker = L.marker(mapInstance.getCenter())
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
  const center = mapInstance.getCenter()
  const lat = center.lat
  const lng = center.lng
  // TODO:
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

    <div class="map-container" ref="map" style="height: 15rem"></div>

    <form @submit.prevent="handleSubmit">
      <b-input-group id="channel-label" prepend="Channel Name:" class="mt-3">
        <b-form-input v-model="inputValue" aria-labelledby="channel-label"></b-form-input>
      </b-input-group>
      <button type="submit" class="btn btn-primary mt-3">Send</button>
    </form>
  </div>
</template>

<style lang="scss" scoped>
@import 'bootstrap/scss/bootstrap.scss';

.main {
  width: 80%;
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
