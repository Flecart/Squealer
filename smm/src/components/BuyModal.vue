<script lang="ts" setup>
import { ref } from 'vue'
import BuyQuotaForm from './BuyQuotaForm.vue'

defineProps<{
  username: string
  urgent: boolean
}>()

const myModalRef = ref<HTMLElement>()

function showModal() {
  // @ts-ignore
  myModalRef.value.show()
}
</script>

<template>
  <div>
    <b-button id="show-btn" variant="warning" @click="showModal">Buy Quota</b-button>

    <b-modal ref="myModalRef" hide-footer title="Quota Purchase Form">
      <BuyQuotaForm :username="username" :urgent="urgent" />
    </b-modal>
  </div>
</template>
