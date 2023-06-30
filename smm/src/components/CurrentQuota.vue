<script setup lang="ts">
import { toEnglishString } from '@/utils'
import type { IUser } from '@model/user'
import { urgentThreshold, type IQuotas } from '@model/quota'
import { computed } from 'vue'

const props = defineProps<{
  client: IUser
  remainingQuota: IQuotas
}>()

function calculateColor(remainingQuota: number): string {
  if (remainingQuota < 0) {
    return 'danger'
  } else if (remainingQuota < urgentThreshold) {
    return 'warning'
  } else {
    return 'primary'
  }
}

const dayColor = computed<string>(() => {
  return calculateColor(props.remainingQuota.day)
})

const weekColor = computed<string>(() => {
  return calculateColor(props.remainingQuota.week)
})

const monthColor = computed<string>(() => {
  return calculateColor(props.remainingQuota.month)
})
</script>

<template>
  <div class="mt-2">
    Current client quota:
    <b-badge class="mx-1" :variant="dayColor"
      >Daily
      <span :aria-label="toEnglishString(remainingQuota.day)"> {{ remainingQuota.day }} </span>
      characters</b-badge
    >
    <b-badge class="mx-1" :variant="weekColor"
      >Weekly
      <span :aria-label="toEnglishString(remainingQuota.week)"> {{ remainingQuota.week }} </span>
      characters</b-badge
    >
    <b-badge class="mx-1" :variant="monthColor"
      >Monthly
      <span :aria-label="toEnglishString(remainingQuota.month)"> {{ remainingQuota.month }} </span>
      characters</b-badge
    >
  </div>
</template>
