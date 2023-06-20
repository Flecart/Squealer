<script setup lang="ts">
import {
  quotaPriceDay,
  quotaPriceMonth,
  quotaPriceWeek,
  urgentPriceIncrease,
  type IQuotas
} from '@model/quota'
import { inject, ref, computed } from 'vue'
import { buyQuotaBaseRoute } from '@/routes'
import { authInject } from '@/keys'
import { toEnglishString } from '@/utils'

const props = defineProps<{
  username: string
  urgent: boolean
}>()

const dayQuota = ref<number>(0)
const weekQuota = ref<number>(0)
const monthQuota = ref<number>(0)
const totalCost = ref<number>(0)
const loading = ref<boolean>(false)
const alertShow = ref<boolean>(false)
const alertVariant = ref<string>('success')
const alertText = ref<string>('')

const currentPriceDay = computed<number>(() => {
  return parseFloat(
    (quotaPriceDay + (props.urgent ? quotaPriceDay * urgentPriceIncrease : 0)).toFixed(2)
  )
})

const currentPriceWeek = computed<number>(() => {
  return parseFloat(
    (quotaPriceWeek + (props.urgent ? quotaPriceWeek * urgentPriceIncrease : 0)).toFixed(2)
  )
})

const currentPriceMonth = computed<number>(() => {
  return parseFloat(
    (quotaPriceMonth + (props.urgent ? quotaPriceMonth * urgentPriceIncrease : 0)).toFixed(2)
  )
})

const authState: { token: string } = inject(authInject)!
function handleSubmit() {
  if (totalCost.value === 0) {
    alertVariant.value = 'danger'
    alertShow.value = true
    alertText.value = 'Please select at least one quota to buy'
    return
  }

  loading.value = true
  fetch(`${buyQuotaBaseRoute}/${props.username}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + authState.token
    },
    body: JSON.stringify({
      day: dayQuota.value,
      week: weekQuota.value,
      month: monthQuota.value
    } as IQuotas)
  })
    .then((response) => {
      loading.value = false
      if (response.ok) {
        alertVariant.value = 'success'
        alertShow.value = true
        alertText.value = 'Quota bought successfully'
      } else {
        alertVariant.value = 'danger'
        alertShow.value = true
        alertText.value = 'Error buying quota'
      }
    })
    .catch((e) => {
      console.log(e)
    })
}

function handleMonthChange(value: number) {
  monthQuota.value = value
  updateCost()
}

function handleWeekChange(value: number) {
  weekQuota.value = value
  updateCost()
}

function handleDayChange(value: number) {
  dayQuota.value = value
  updateCost()
}

function updateCost() {
  totalCost.value =
    dayQuota.value * currentPriceDay.value +
    weekQuota.value * currentPriceWeek.value +
    monthQuota.value * currentPriceMonth.value
}
</script>
<template>
  <div class="d-block text-center">
    <h3>
      Buy quota for <span class="client-name">{{ username }} </span>
    </h3>
  </div>

  <div class="price-groups">
    <b-badge class="mx-1" variant="primary"
      >Daily price
      <span :aria-label="toEnglishString(currentPriceDay) + 'Euros'">
        {{ currentPriceDay }}€
      </span></b-badge
    >
    <b-badge class="mx-1" variant="primary"
      >Weekly price
      <span :aria-label="toEnglishString(currentPriceWeek) + 'Euros'">
        {{ currentPriceWeek }}€
      </span></b-badge
    >
    <b-badge class="mx-1" variant="primary"
      >Monthly price
      <span :aria-label="toEnglishString(currentPriceMonth) + 'Euros'">
        {{ currentPriceMonth }}€
      </span></b-badge
    >
  </div>

  <form ref="form" @submit.stop.prevent="handleSubmit">
    <b-form-group label="Daily Quota" label-for="daily-quota">
      <b-form-input
        id="daily-quota"
        type="number"
        v-model="dayQuota"
        @update="handleDayChange"
      ></b-form-input>
    </b-form-group>

    <b-form-group label="Weekly Quota" label-for="weekly-quota">
      <b-form-input
        id="weekly-quota"
        number="true"
        type="number"
        v-model="weekQuota"
        @update="handleWeekChange"
      ></b-form-input>
    </b-form-group>

    <b-form-group label="Montly Quota" label-for="montly-quota">
      <b-form-input
        id="montly-quota"
        type="number"
        number="true"
        v-model="monthQuota"
        @update="handleMonthChange"
      ></b-form-input>
    </b-form-group>

    <div>
      <h3>Total Cost: {{ totalCost.toFixed(2) }} &euro;</h3>
    </div>

    <button type="submit" class="btn btn-primary">
      <template v-if="loading">
        <b-spinner label="Spinning"></b-spinner>
      </template>
      <template v-else> Submit </template>
    </button>
  </form>

  <b-alert class="mt-3" :variant="alertVariant" :show="alertShow">{{ alertText }}</b-alert>
</template>

<style scoped>
.client-name {
  font-weight: 700;
  font-size: 1.8rem;
}

.price-groups {
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 1rem 0;
}
</style>
