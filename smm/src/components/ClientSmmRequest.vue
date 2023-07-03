<script setup lang="ts">
import { injectAuth } from '@/keys'
import {
  getVipClientRequestRoute,
  rejectVipClientRequestRoute,
  acceptVipClientRequestRoute
} from '@/routes'
import { ref, watch } from 'vue'
import type { IUser } from '@model/user'
import { stringFormat } from '@/utils'

const authState = injectAuth()!

const clientRequest = ref<IUser[]>([])
const lastClient = ref<IUser>()

type Message = {
  msg: string
  type: string
}
const message = ref<Message>()

fetch(getVipClientRequestRoute, {
  headers: {
    Authorization: 'Bearer ' + authState.token
  }
})
  .then((response) => response.json())
  .then((data) => {
    const clientRequestData = data as IUser[]
    clientRequest.value = clientRequestData
    console.log(data)
  })
  .catch((error) => {
    console.error('Error:', error)
  })

watch(clientRequest, () => {
  console.log('called')
  if (clientRequest.value.length > 0) {
    lastClient.value = clientRequest.value[0]
  } else {
    lastClient.value = undefined
  }
})

const resetMessage = () => {
  setTimeout(() => {
    message.value = undefined
  }, 3000)
}

const deleteLastClient = () => {
  clientRequest.value.pop()
}

const acceptRequest = (client: IUser) => {
  fetch(stringFormat(acceptVipClientRequestRoute, [client.username]), {
    method: 'POST',
    headers: {
      Authorization: 'Bearer ' + authState.token
    }
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error('Error in accepting the request')
      } else {
        return response.json()
      }
    })
    .then((data) => {
      message.value = {
        msg: data.msg,
        type: 'success'
      }
      resetMessage()
      deleteLastClient()
    })
    .catch((e) => {
      message.value = {
        msg: e.message ?? 'Error in accepting the request',
        type: 'danger'
      }
      resetMessage()
      deleteLastClient()
    })
}

const rejectRequest = (client: IUser) => {
  fetch(stringFormat(rejectVipClientRequestRoute, [client.username]), {
    method: 'DELETE',
    headers: {
      Authorization: 'Bearer ' + authState.token
    }
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error('Error in rejecting the request')
      } else {
        return response.json()
      }
    })
    .then((data) => {
      message.value = {
        msg: data.msg,
        type: 'success'
      }
      resetMessage()
      deleteLastClient()
    })
    .catch((e) => {
      message.value = {
        msg: e.message ?? 'Error in rejecting the request',
        type: 'danger'
      }
      resetMessage()
      deleteLastClient()
    })
}
</script>

<template>
  <template v-if="lastClient !== undefined">
    <div class="my-1">
      <b-alert show class="d-flex align-items-center flex-wrap justify-content-between">
        <div>
          <span class="font-weight-bold">{{ lastClient.username }}</span> wants you to be his Social
          Media Manager
        </div>

        <div class="my-1">
          <b-button variant="success mr-2" @click="acceptRequest(lastClient)"> Accept </b-button>
          <b-button variant="danger" @click="rejectRequest(lastClient)"> Reject </b-button>
        </div>
      </b-alert>
    </div>
  </template>

  <template v-if="message">
    <b-alert show> </b-alert>
  </template>
</template>
