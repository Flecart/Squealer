<script setup lang="ts">
import GraphPointsVue from '@/components/GraphPoints.vue'
import { getClienthistoryRoute } from '@/routes'
import { inject, ref, computed, watch } from 'vue'
import { authInject, currentClientInject, type currentClientType } from '@/keys'
import { HistoryPoint, HistoryUpdateType } from '@model/history'
import ChooseClients from '@/components/ChooseClients.vue'
import { stringFormat } from '@/utils'

type ChartData = {
  labels: string[]
  datasets: {
    label: string
    data: number[]
  }[]
}

const today = new Date()
const tomorrow = new Date(today)
tomorrow.setDate(tomorrow.getDate() + 1)

const startDate = ref<string>(today.toISOString().slice(0, 10)) // YYYY-MM-DD
const endDate = ref<string>(tomorrow.toISOString().slice(0, 10)) // YYYY-MM-DD
const errorMessage = ref<string>('')

function assert(boolean: boolean, msg: string) {
  if (!boolean) console.error(msg)
}

const tabIndex = ref<number>(0)
const views = [
  { title: 'Popularity', type: HistoryUpdateType.POPULARITY },
  { title: 'Reply Frequency', type: HistoryUpdateType.REPLY },
  { title: 'Post Frequency', type: HistoryUpdateType.POST }
]

const options = {
  responsive: true
}

const { currentClient, setClient: _ } = inject<currentClientType>(currentClientInject)!

const auth = inject<{ token: string }>(authInject)!

const analiticsData = ref<HistoryPoint[]>([])

fetchHistory()

// eslint-disable-next-line @typescript-eslint/no-unused-vars
watch(
  [currentClient, startDate, endDate],
  ([_newClient, newStartDate, newEndDate], [_oldClient, oldStartDate, oldEndDate]) => {
    errorMessage.value = ''

    const _startDate = new Date(newStartDate)
    const _endDate = new Date(newEndDate)
    if (_startDate >= _endDate) {
      errorMessage.value =
        'If start date is after or equal end date, there will be no data to be shown!'
    }
    fetchHistory()
  }
)

function fetchHistory() {
  fetch(
    `${stringFormat(getClienthistoryRoute, [currentClient.value.username])}?from=${
      startDate.value
    }&to=${endDate.value}`,
    {
      headers: {
        Authorization: `Bearer ${auth.token}`
      }
    }
  )
    .then((response) => response.json())
    .then((data) => {
      analiticsData.value = data
    })
}

const chartData = computed(() => {
  const compactHistory = compactHistoriesByHour(analiticsData.value)
  const data: Map<HistoryUpdateType, ChartData> = new Map()

  const allTypes = [HistoryUpdateType.POPULARITY, HistoryUpdateType.POST, HistoryUpdateType.REPLY]
  allTypes.forEach((type) => {
    data.set(type, getChartData(compactHistory, type, getTitle(type)))
  })

  return data
})

function getTitle(type: HistoryUpdateType) {
  return views[type as number].title
}

function getChartData(historyPoints: HistoryPoint[], type: HistoryUpdateType, title: string) {
  // assumo che l'input sia già tutto compattato all'ora.
  const labels: string[] = []
  const data: number[] = []
  historyPoints.forEach((point) => {
    labels.push(`${point.date.getHours()}:00H ${point.date.getDate()}/${point.date.getMonth()}`)
    switch (type) {
      case HistoryUpdateType.POPULARITY:
        data.push(point.popularity)
        break
      case HistoryUpdateType.POST:
        data.push(point.post)
        break
      case HistoryUpdateType.REPLY:
        data.push(point.reply)
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
    return new Date(a.date) > new Date(b.date) ? 1 : -1 // sort crescente by date
  })

  const firstDate = new Date(historyPoints[0].date)
  const lastDate = new Date(historyPoints[historyPoints.length - 1].date)
  assert(
    firstDate.getDate() === lastDate.getDate(),
    'first date and last date should be the same day'
  )

  for (let i = firstDate.getHours(); i <= lastDate.getHours(); i++) {
    const pointsInHour = historyPoints.filter((point) => new Date(point.date).getHours() === i)
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
  <div class="content">
    <ChooseClients />
    <div class="d-md-flex mb-3">
      <div class="form-date mt-3">
        <label :for="`date-start`">Start time: </label>
        <b-form-input :id="`date-start`" type="date" v-model="startDate"></b-form-input>
      </div>
      <div class="form-date ml-md-5 mt-3">
        <label :for="`date-end`">End date: </label>
        <b-form-input :id="`date-end`" type="date" v-model="endDate"></b-form-input>
      </div>
    </div>
    <template v-if="analiticsData.length > 0">
      <div>
        <b-tabs content-class="mt-3" v-model="tabIndex">
          <template v-for="view in views" :key="view.type">
            <b-tab :title="view.title">
              <GraphPointsVue :chartData="chartData.get(view.type)" :chartOptions="options" />
            </b-tab>
          </template>
        </b-tabs>
      </div>
    </template>
    <template v-else>
      <p>
        There are still no history points for client
        <span class="font-weight-bold">{{ currentClient.username }}</span> in this time range.
      </p>
    </template>

    <b-alert variant="warning" :show="errorMessage.length > 0" class="mt-3">
      {{ errorMessage }}</b-alert
    >
  </div>
</template>

<style scoped>
.form-date {
  display: flex;
  align-items: center;
  width: 40%;
}

.form-date label {
  width: 40%;
  margin-bottom: 0;
}
</style>
