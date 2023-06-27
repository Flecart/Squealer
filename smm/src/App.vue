<script setup lang="ts">
import SideBar from './components/SideBar.vue'
</script>

<template>
  <SideBar> </SideBar>
  <main>
    <router-view></router-view>
  </main>
</template>

<style lang="scss" scoped>
@import 'bootstrap/scss/bootstrap.scss';

main {
  margin-left: 1rem;
  margin-right: 1rem;
}

@media screen and (min-width: map-get($grid-breakpoints, md)) {
  main {
    margin-left: 22rem;
  }
}
</style>
