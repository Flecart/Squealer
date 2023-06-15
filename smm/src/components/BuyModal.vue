<script lang="ts" setup>
import { quotaPriceDay, quotaPriceMonth, quotaPriceWeek } from '@model/quota'
import { inject, ref, onMounted } from 'vue'
import { buyQuotaBaseRoute } from '@/routes'

const props = defineProps<{
  username: string
  show: boolean
}>()

const dayQuota = ref<number>(0)
const weekQuota = ref<number>(0)
const monthQuota = ref<number>(0)
const totalCost = ref<number>(0)
const loading = ref<boolean>(false)
const alertShow = ref<boolean>(false)
const alertVariant = ref<string>('success')
const alertText = ref<string>('')

const authState: { token: string } = inject('auth')!
const myModalRef = ref<HTMLElement>()

onMounted(() => {
  console.log('mounted')
  console.log(props.show)
  if (props.show) {
    showModal()
  } else {
    hideModal()
  }
})

function handleSubmit() {
  if (totalCost.value === 0) {
    alertVariant.value = 'danger'
    alertShow.value = true
    alertText.value = 'Please select at least one quota to buy'
    return
  }

  loading.value = true
  fetch(buyQuotaBaseRoute + props.username, {
    method: 'POST',
    headers: {
      contentType: 'application/json',
      Authorization: 'Bearer ' + authState.token
    }
  }).then((response) => {
    loading.value = false
    if (response.ok) {
      alertVariant.value = 'success'
      alertShow.value = true
      alertText.value = 'Quota bought successfully'
      setTimeout(() => {
        hideModal()
      }, 3000)
    } else {
      alertVariant.value = 'danger'
      alertShow.value = true
      alertText.value = 'Error buying quota'
    }
  })
}

function showModal() {
  // @ts-ignore
  myModalRef.value.show()
}
function hideModal() {
  dayQuota.value = 0
  weekQuota.value = 0
  monthQuota.value = 0
  // @ts-ignore
  myModalRef.value.hide()
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
    dayQuota.value * quotaPriceDay +
    weekQuota.value * quotaPriceWeek +
    monthQuota.value * quotaPriceMonth
}
</script>

<template>
  <b-modal ref="myModalRef" hide-footer title="Quota Purchase Form">
    <div class="d-block text-center">
      <h3>
        Buy quota for <span class="client-name">{{ username }} </span>
      </h3>
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
  </b-modal>
</template>

<style scoped>
.client-name {
  font-weight: 700;
  font-size: 1.8rem;
}
</style>
