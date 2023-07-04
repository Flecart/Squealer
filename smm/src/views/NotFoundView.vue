<script setup lang="ts">
import { dashboardName } from '@/routes'
</script>

<template>
  <div class="container">
    <div class="row">
      <div class="col-md-6 offset-md-3 text-center">
        <h1 class="display-4">Oops!</h1>
        <p class="lead">The page you are trying to access does not exist</p>
        <hr class="my-4" />
        <router-link :to="{ name: dashboardName }" class="btn btn-primary"
          >Go Back to Home</router-link
        >
      </div>
    </div>
  </div>
</template>

<style scoped>
.container {
  margin-top: 100px;
}
</style>
