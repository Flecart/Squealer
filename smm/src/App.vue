<script setup lang="ts">
import SideBar from './components/SideBar.vue'
import { injectSidebarShow } from '@/keys'
import { ref, watch } from 'vue'
import ClientSmmRequestVue from './components/ClientSmmRequest.vue'

const show = injectSidebarShow()!

const sidebarMargin = ref('1rem')

watch(show, () => {
  sidebarMargin.value = show.value ? '22rem' : '1rem'
})
</script>

<template>
  <SideBar> </SideBar>
  <main>
    <ClientSmmRequestVue />
    <header>
      <div class="content d-flex">
        <b-button
          variant="dark"
          title="open sidebar"
          aria-label="open sidebar"
          class="outside-sidebar-toggler mr-2"
          v-b-toggle.sidebar-no-header
          :hidden="show"
          :aria-hidden="show ? 'true' : 'false'"
          aria-expanded="false"
          aria-controls="sidebar-no-header"
          tabindex="0"
        >
          <b-icon-caret-right-fill></b-icon-caret-right-fill>
        </b-button>
        <router-view name="title"></router-view>
      </div>
    </header>
    <router-view></router-view>
  </main>
</template>

<style lang="scss" scoped>
@import 'bootstrap/scss/bootstrap.scss';

header {
  display: flex;
  align-items: center;
  margin-top: 1rem;
}

h1,
h2,
h3,
h4,
h5,
h6 {
  margin-bottom: 0;
}

main {
  margin-left: 1rem;
  margin-right: 1rem;

  transition: margin-left 0.3s ease-in-out;
}

@media screen and (min-width: map-get($grid-breakpoints, md)) {
  main {
    margin-left: v-bind(sidebarMargin);
  }
}
</style>

<style>
.content {
  width: 70%;
  margin: auto;
}
</style>
