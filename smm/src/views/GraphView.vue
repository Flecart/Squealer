<script setup lang="ts">
import GraphPointsVue from '@/components/GraphPoints.vue'
import { getClienthistoryBaseRoute } from '@/routes'
import { inject, ref, computed, watch, reactive } from 'vue'
import { authInject, currentClientInject, type currentClientType } from '@/keys'
import { HistoryPoint, HistoryUpdateType } from '@model/history'
import ChooseClients from '@/components/ChooseClients.vue'

type ChartData = {
  labels: string[]
  datasets: {
    label: string
    data: number[]
  }[]
}

function assert(boolean: boolean, msg: string) {
  if (!boolean) console.error(msg)
}

const tabIndex = ref<number>(0)
const views = [
  { title: 'Popularity', type: HistoryUpdateType.POPULARITY },
  { title: 'Post Frequency', type: HistoryUpdateType.POST },
  { title: 'Reply Frequency', type: HistoryUpdateType.REPLY }
]

const options = {
  responsive: true
}

const { currentClient, setClient: _ } = inject<currentClientType>(currentClientInject)!

const auth = inject<{ token: string }>(authInject)!

const analiticsData = reactive<{ value: HistoryPoint[] }>({ value: [] })

fetchHistory()
watch(currentClient, () => {
  fetchHistory()
})

function fetchHistory() {
  fetch(`${getClienthistoryBaseRoute}/${currentClient.value.username}`, {
    headers: {
      Authorization: `Bearer ${auth.token}`
    }
  })
    .then((response) => response.json())
    .then((data) => {
      analiticsData.value = data
      console.log(chartData.value)
    })
}

const chartData = computed(() => {
  const compactHistory = compactHistoriesByHour(analiticsData.value)
  const data: Map<HistoryUpdateType, ChartData> = new Map()

  const allTypes = [HistoryUpdateType.POPULARITY, HistoryUpdateType.POST, HistoryUpdateType.REPLY]
  allTypes.forEach((type) => {
    data.set(type, getChartData(compactHistory, type, getTitle(type)))
  })

  console.log(data)

  return data
})

watch(chartData, (newVal, oldVad) => {
  console.log(JSON.stringify(newVal))
  console.log(JSON.stringify(oldVad))
})

function getTitle(type: HistoryUpdateType) {
  return views[type as number].title
}

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
    datasets: [
      {
        label: title,
        data
      }
    ]
  } as ChartData
}

function compactHistoriesByHour(historyPoints: HistoryPoint[]) {
  // labels should be hours
  // i should have one single point for an hour, i have to compact all history points to an hour
  if (historyPoints.length <= 0) return []

  const compactedHistoryPoint: HistoryPoint[] = []

  historyPoints.sort((a, b) => {
    return a.date < b.date ? 1 : -1
  })

  const firstDate = new Date(historyPoints[0].date)
  const lastDate = new Date(historyPoints[historyPoints.length - 1].date)
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
  <!-- <GraphPointsVue :chartData="dummyChartData" :chartOptions="options" /> -->
  <template v-if="analiticsData.value.length > 0">
    {{ JSON.stringify(chartData) }}
    <div>
      <b-tabs content-class="mt-3" v-model="tabIndex">
        <template v-for="view in views" :key="view.type">
          <b-tab :title="view.title">
            <GraphPointsVue :chartData="chartData?.get(view.type)" :chartOptions="options" />
          </b-tab>
        </template>
      </b-tabs>
    </div>
  </template>
  <template v-else>
    <p>
      There are still no history points, wait for some time (about an hour) until we gather some
      data.
    </p>
  </template>
</template>
