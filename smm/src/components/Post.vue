<script setup lang="ts">
import type { IMessage, Maps } from '@model/message'
import type { IUser } from '@model/user'
import { squealerBaseURL } from '@/routes'
import MapLeaflet from './MapLeaflet.vue'

defineProps<{
  author: IUser
  message: IMessage
}>()

function redirectToMessage(messageId: string) {
  window.location.href = `${squealerBaseURL}/message/${messageId}`
}
</script>

<template>
  <!-- TODO: questo redirect in questo modo dovrebbe esseree un problema di accessiblità -->
  <div class="post" @click="redirectToMessage(message._id.toString())">
    <div class="post-header">
      <b-avatar :src="author.profile_pic" size="2rem" variant="secondary"></b-avatar>
      <div class="post-author">{{ author.name }}</div>
      <div class="post-channel">{{ message.channel }}</div>

      <div class="post-time">{{ new Date(message.date).toISOString().substring(0, 10) }}</div>
    </div>
    <hr />
    <div class="post-content">
      <template v-if="message.content.type === 'image'">
        <a :href="`${squealerBaseURL}/${message.content.data}`" target="_blank">
          <img
            class="post-image"
            :src="`${squealerBaseURL}/${message.content.data}`"
            alt="Post image"
          />
        </a>
      </template>
      <template v-else-if="message.content.type === 'text'">
        {{ message.content.data }}
      </template>
      <template v-else-if="message.content.type === 'video'">
        <video controls>
          <source :src="`${squealerBaseURL}/${message.content.data}`" />
        </video>
      </template>
      <template v-else-if="message.content.type === 'maps'">
        <MapLeaflet :positions="(message.content.data as Maps).positions" />
      </template>
    </div>
  </div>
</template>

<style scoped>
.post {
  border: 1px solid #ccc;
  border-radius: 0.25rem;
  padding: 1rem;
  margin: 1rem 1rem 1rem 0;
  width: 20rem;
}

.post:hover {
  background-color: #f5f5f5;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
}

.post:active {
  background-color: #e0e0e0;
}

.post-header {
  display: flex;
  align-items: center;
  margin-bottom: 0.5rem;
  flex-wrap: wrap;
}

.post-author {
  font-weight: bold;
  margin-left: 0.5rem;
}

.post-channel {
  margin-left: 0.5rem;
  margin-right: 0.5rem;
  color: #6c757d;
}

.post-image {
  margin-bottom: 0.5rem;
  max-width: 15rem;
  height: auto;
}

.post-content {
  white-space: pre-wrap;
}
</style>
