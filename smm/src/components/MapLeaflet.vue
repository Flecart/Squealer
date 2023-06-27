<script setup lang="ts">
import { ref, onMounted, computed, onBeforeUnmount } from 'vue'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import type { MapPosition } from '@model/message'

const props = defineProps<{
  positions: MapPosition[]
}>()

const map = ref<HTMLElement>()

const memoPositions = computed(() => {
  return props.positions.map((position) => {
    return [position.lat, position.lng]
  })
})

const lastPosition = computed(() => {
  return memoPositions.value[memoPositions.value.length - 1]
})

const zoomValue = 13

let mapInstance: L.Map
onMounted(() => {
  mapInstance = L.map(map.value as HTMLElement, { zoomControl: false, dragging: false }).setView(
    lastPosition.value as L.LatLngTuple,
    zoomValue
  )
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(mapInstance)
  L.polyline(memoPositions.value as L.LatLngExpression[], { color: 'blue' }).addTo(mapInstance)
  L.marker(memoPositions.value[memoPositions.value.length - 1] as L.LatLngExpression).addTo(
    mapInstance
  )
  mapInstance.fitBounds(memoPositions.value as L.LatLngBoundsExpression)
})

onBeforeUnmount(() => {
  mapInstance.remove()
})
</script>

<template>
  <div class="map-container" ref="map" style="height: 15rem"></div>
</template>

<style scoped>
.map-container {
  height: 100vh;
}
</style>
