<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import L from 'leaflet'
import type { MapPosition } from '@model/message'

const props = defineProps<{
  positions: MapPosition[]
}>()

const map = ref<HTMLElement>()
const memoPositions = computed(() => {
  return props.positions.map((pos) => [pos.lat, pos.lng])
})

const lastPosition = computed(() => {
  return memoPositions.value[memoPositions.value.length - 1]
})

onMounted(() => {
  console.log('mounted')
  console.log(map.value)
  const mapInstance = L.map(map.value as HTMLElement).setView(
    lastPosition.value as L.LatLngTuple,
    13
  )
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(mapInstance)
  L.polyline(memoPositions.value as L.LatLngExpression[], { color: 'blue' }).addTo(mapInstance)
  // L.marker(memoPositions.value[memoPositions.value.length - 1]).addTo(mapInstance);
  // mapInstance.fitBounds(memoPositions.value);
})
</script>
<template>
  <div ref="map" style="height: 15rem"></div>
</template>
