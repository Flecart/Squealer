<script setup lang="ts">
import { ref } from 'vue'
import { Line } from 'vue-chartjs'
import { Chart as ChartJS, registerables } from 'chart.js'

const props = defineProps({
  chartData: null,
  chartOptions: {
    type: Object,
    default: () => {}
  }
})
ChartJS.register(...registerables)
</script>

<template>
  <Line :data="props.chartData" :options="props.chartOptions" />
</template>
