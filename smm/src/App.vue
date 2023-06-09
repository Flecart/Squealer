<script setup lang="ts">
import { provide } from 'vue'
import SideBar from './components/SideBar.vue'

const authState = JSON.parse(localStorage.getItem('auth') ?? 'null')
provide('auth', authState)
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
