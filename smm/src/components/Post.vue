<script setup lang="ts">
import type { IMessage } from '@model/message'
import type { IUser } from '@model/user'

defineProps<{
  author: IUser
  message: IMessage
}>()

function renderContent(content: IMessage['content']) {
  if (content.type === 'text') {
    return content.data
  } else if (content.type === 'image') {
    return `<a href="${content.data}" target="_blank"><img src="${content.data}" alt="Post image"></a>`
  } else return content
}
</script>

<template>
  <div class="post">
    <div class="post-header">
      <b-avatar :src="author.profile_pic" size="2rem" variant="secondary"></b-avatar>
      <div class="post-author">{{ author.name }}</div>
      <div class="post-channel">{{ message.channel }}</div>

      <div class="post-time">{{ new Date(message.date).toISOString().substring(0, 10) }}</div>
    </div>
    <hr />
    <!-- <div class="post-image">
      <a :href="message.image_url" target="_blank">
        <img :src="message.image_url" alt="Post image">
      </a>
    </div> -->
    <div class="post-content">{{ renderContent(message.content) }}</div>
  </div>
</template>

<style scoped>
.post {
  border: 1px solid #ccc;
  border-radius: 0.25rem;
  padding: 1rem;
  margin-bottom: 1rem;
}

.post-header {
  display: flex;
  align-items: center;
  margin-bottom: 0.5rem;
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

.post-content {
  white-space: pre-wrap;
}
</style>
