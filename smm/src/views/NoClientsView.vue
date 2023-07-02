<script setup lang="ts">
import { injectClients } from '@/keys'
import { router, dashboardName } from '@/routes'

const clients = injectClients()
if (clients !== undefined && clients.length > 0) {
  router.push({ name: dashboardName })
}
</script>

<template>
  <div class="container">
    <div class="row">
      <div class="col-md-6 offset-md-3 text-center">
        <h1 class="display-4">Oops!</h1>
        <p class="lead">
          We're sorry, but <span class="font-weight-bold">you need to have clients </span> in order
          to use the application.
        </p>
        <hr class="my-4" />
        <p>Please come back after you have a client</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.container {
  margin-top: 100px;
}
</style>
