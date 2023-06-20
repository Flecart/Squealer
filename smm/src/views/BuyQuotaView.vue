<script setup lang="ts">
import { clientInject } from '@/keys'
import type { IUser } from '@model/user'
import { inject, ref, computed } from 'vue'
import BuyModal from '@/components/BuyQuotaForm.vue'
import { urgentThreshold } from '@model/quota'

const clients = inject<IUser[]>(clientInject)!

const currentClient = ref<IUser>(clients[0])

const quotaDay = computed<number>(() => {
  return currentClient.value.maxQuota.day - currentClient.value.usedQuota.day
})
</script>

<template>
  <div class="client-name">
    <span> Current client: </span>
    <b-dropdown :text="currentClient" class="m-md-2">
      <b-dropdown-item
        v-for="client in clients"
        :key="client.username"
        @click="currentClient = client"
      >
        {{ client.username }}
      </b-dropdown-item>
    </b-dropdown>
  </div>

  <div class="form-container">
    <BuyModal :username="currentClient.username" :urgent="quotaDay < urgentThreshold" />
  </div>
</template>

<style scoped>
.client-name {
  font-weight: 400;
  font-size: 1.8rem;

  display: flex;
  align-items: center;
}

.form-container {
  width: 70%;
}
</style>
