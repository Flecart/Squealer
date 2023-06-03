<script setup lang="ts">
import SideBar from './components/SideBar.vue'
</script>

<template>
  <SideBar />
  <main>
    <router-view></router-view>
  </main>
</template>

<style lang="scss" scoped>
@import 'bootstrap/scss/bootstrap.scss';

@media screen and (min-width: map-get($grid-breakpoints, md)) {
  main {
    margin-left: 20rem;
  }
}
</style>
