<script setup lang="ts">
import { toEnglishString } from '@/utils'
import type { IUser } from '@model/user'
import type { IQuotas } from '@model/quota'

defineProps<{
  client: IUser
  remainingQuota: IQuotas
}>()
</script>

<template>
  <div class="mt-2">
    Current client quota:
    <b-badge class="mx-1" variant="primary"
      >Daily
      <span :aria-label="toEnglishString(remainingQuota.day)"> {{ remainingQuota.day }} </span>
      characters</b-badge
    >
    <b-badge class="mx-1" variant="primary"
      >Weekly
      <span :aria-label="toEnglishString(remainingQuota.week)"> {{ remainingQuota.week }} </span>
      characters</b-badge
    >
    <b-badge class="mx-1" variant="primary"
      >Monthly
      <span :aria-label="toEnglishString(remainingQuota.month)"> {{ remainingQuota.month }} </span>
      characters</b-badge
    >
  </div>
</template>
