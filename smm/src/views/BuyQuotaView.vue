<script setup lang="ts">
import { clientInject } from '@/keys'
import type { IUser } from '@model/user'
import { inject, ref } from 'vue'
import BuyModal from '@/components/BuyQuotaForm.vue'

const clients = inject<IUser[]>(clientInject)!

const currentClient = ref<string>(clients[0].username)
</script>

<template>
  <div class="client-name">
    <span> Current client: </span>
    <b-dropdown :text="currentClient" class="m-md-2">
      <b-dropdown-item
        v-for="client in clients"
        :key="client.username"
        @click="currentClient = client.username"
      >
        {{ client.username }}
      </b-dropdown-item>
    </b-dropdown>
  </div>

  <div class="form-container">
    <BuyModal :username="currentClient" />
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
