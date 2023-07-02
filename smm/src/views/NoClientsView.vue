<script setup lang="ts">
import { dashboardName } from '@/routes'
</script>

<template>
  <div class="container">
    <div class="row">
      <div class="col-md-6 offset-md-3 text-center">
        <h1 class="display-4">Oops!</h1>
        <p class="lead">We're sorry, but something went wrong.</p>
        <hr class="my-4" />
        <p>Please try again later.</p>
        <router-link :to="{ name: dashboardName }" class="btn btn-primary">Go to Home</router-link>
      </div>
    </div>
  </div>
</template>

<style scoped>
.container {
  margin-top: 100px;
}
</style>
