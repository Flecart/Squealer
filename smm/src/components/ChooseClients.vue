<script setup lang="ts">
import { clientInject, currentClientInject, type currentClientType } from '@/keys'
import type { IUser } from '@model/user'
import { inject } from 'vue'

const clients = inject<IUser[]>(clientInject)!
const { currentClient, setClient } = inject<currentClientType>(currentClientInject)!
</script>

<template>
  <div class="client-name">
    <span class="pr-2"> Current client: </span>
    <b-dropdown :text="currentClient.username" class="m-md-2 mr-2">
      <b-dropdown-item v-for="client in clients" :key="client.username" @click="setClient(client)">
        {{ client.username }}
      </b-dropdown-item>
    </b-dropdown>
  </div>
</template>

<style scoped>
.client-name {
  font-weight: 400;
  font-size: 1.8rem;

  display: flex;
  align-items: center;
}
</style>
