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

<!-- 
 <template>
    <Bar :data="chartData" :options="chartOptions" />
  </template>
  
  <script lang="ts">
  import { Bar } from 'vue-chartjs'
  import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from 'chart.js'
  
  ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale)
  
  export default {
    components: { Bar },
    props: {
      chartData: {
          type: {
            labels: Array,
            datasets: Array
          },
          required: true
        },
      chartOptions: {
        type: Object,
        default: () => {}
      }
    }
  }
  </script> -->
