<script setup lang="ts">
import GraphPointsVue from '@/components/GraphPoints.vue'
import { getClienthistoryBaseRoute } from '@/routes'
import { inject, ref, computed } from 'vue'
import { authInject, currentClientInject, type currentClientType } from '@/keys'
import { HistoryPoint, HistoryUpdateType } from '@model/history'
import ChooseClients from '@/components/ChooseClients.vue'
import assert from 'assert'

const data = {
  labels: ['January', 'February', 'March'],
  datasets: [{ label: 'rpova', data: [40, 20, 12] }]
}

const options = {
  responsive: true
}

const { currentClient, setClient: _ } = inject<currentClientType>(currentClientInject)!

const auth = inject<{ token: string }>(authInject)!

const analiticsData = ref<HistoryPoint[]>([])

fetch(`${getClienthistoryBaseRoute}/${currentClient.value.username}`, {
  headers: {
    Authorization: `Bearer ${auth.token}`
  }
})
  .then((response) => response.json())
  .then((data) => {
    analiticsData.value = data
    console.log(data)
  })

function getChartData(historyPoints: HistoryPoint[], type: HistoryUpdateType, title: string) {
  // assumo che l'input sia già tutto compattato all'ora.
  const labels: string[] = []
  const data: number[] = []
  historyPoints.forEach((point) => {
    labels.push(`${point.date.getHours()}:00H`)
    switch (type) {
      case HistoryUpdateType.POPULARITY:
        data.push(point.popularity)
        break
      case HistoryUpdateType.POST:
        data.push(point.reply)
        break
      case HistoryUpdateType.REPLY:
        data.push(point.post)
        break
    }
  })

  return {
    labels,
    dataset: [
      {
        label: title,
        data
      }
    ]
  }
}

function compactHistoriesByHour(historyPoints: HistoryPoint[]) {
  // labels should be hours
  // i should have one single point for an hour, i have to compact all history points to an hour
  assert(historyPoints.length > 0, 'history points should be more than 0')

  const compactedHistoryPoint: HistoryPoint[] = []

  historyPoints.sort((a, b) => {
    return a.date < b.date ? 1 : -1
  })

  const firstDate = historyPoints[0].date
  const lastDate = historyPoints[historyPoints.length - 1].date
  assert(
    firstDate.getDate() === lastDate.getDate(),
    'first date and last date should be the same day'
  )

  for (let i = firstDate.getHours(); i < lastDate.getHours(); i++) {
    const pointsInHour = historyPoints.filter((point) => point.date.getHours() === i)
    const sum = pointsInHour.reduce((acc, point) => {
      acc.add(point)
      return acc
    }, new HistoryPoint())
    sum.date.setHours(i)
    compactedHistoryPoint.push(sum)
  }

  return compactedHistoryPoint
}
</script>

<template>
  <h1>Analitics</h1>
  <ChooseClients />
  <template v-if="analiticsData.length > 0">
    <GraphPointsVue :chartData="data" :chartOptions="options" />
    <ul>
      <!-- <li v-for="point in analiticsData.value">
            {{point.date}} - {{point.value}}
        </li> -->
    </ul>
  </template>
  <template v-else>
    <p>There are still no history points, wait for some time (hours) until we gather some data.</p>
  </template>

  <GraphPointsVue :chartData="data" :chartOptions="options" />
</template>
