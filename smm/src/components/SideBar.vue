<script setup lang="ts">
import { ref, inject } from 'vue'
import type { IUser } from '@model/user'
import { smmUserInject } from '@/keys'
import { useRoute } from 'vue-router'
import { dashboardName, geolocalizationName, buyQuotaName, sendMessageName } from '@/routes'

const smmUser = inject<IUser>(smmUserInject)!

const show = ref(true)
</script>

<template>
  <b-button
    variant="primary"
    title="open sidebar"
    aria-label="open sidebar"
    class="outside-sidebar-toggler"
    v-b-toggle.sidebar-no-header
    :aria-hidden="show ? 'true' : 'false'"
  >
    <b-icon-caret-right-fill></b-icon-caret-right-fill>
  </b-button>

  <b-sidebar
    id="sidebar-no-header"
    aria-labelledby="sidebar-no-header-title"
    no-header
    shadow
    visible
    v-model="show"
  >
    <b-navbar type="dark" variant="dark">
      <header class="sidebar-header">
        <b-navbar-brand id="sidebar-no-header-title" href="/">Squealer SMM</b-navbar-brand>
        <div
          class="icon-container"
          title="close sidebar"
          aria-label="close sidebar"
          role="button"
          v-b-toggle.sidebar-no-header
        >
          <b-icon-caret-left-fill></b-icon-caret-left-fill>
        </div>
      </header>
    </b-navbar>
    <nav>
      <b-list-group class="pt-3 px-1">
        <b-list-group-item
          :to="{ name: dashboardName }"
          class="list-nav-item"
          :active="$route.name === dashboardName"
        >
          <b-icon-speedometer2 aria-hidden="true"></b-icon-speedometer2>
          Dashboard
        </b-list-group-item>
        <b-list-group-item
          :to="{ name: buyQuotaName }"
          class="list-nav-item"
          :active="$route.name === buyQuotaName"
        >
          <b-icon-bag aria-hidden="true"></b-icon-bag>
          Buy quotas
        </b-list-group-item>
        <b-list-group-item
          :to="{ name: geolocalizationName }"
          class="list-nav-item"
          :active="$route.name === geolocalizationName"
        >
          <b-icon-geo-alt aria-hidden="true"></b-icon-geo-alt>
          Activate geolocation</b-list-group-item
        >
        <b-list-group-item href="#" class="list-nav-item">
          <b-icon-person aria-hidden="true"></b-icon-person>
          Customers
        </b-list-group-item>

        <b-list-group-item
          :to="{ name: sendMessageName }"
          class="list-nav-item"
          :active="$route.name === sendMessageName"
        >
          <b-icon-messenger aria-hidden="true"></b-icon-messenger>
          Post for client
        </b-list-group-item>
      </b-list-group>
    </nav>
    <template #footer>
      <hr />
      <div class="sidebar-footer">
        <a href="#" class="d-flex align-items-center link-dark text-decoration-none">
          <template v-if="smmUser">
            <img :src="smmUser.profile_pic" alt="" class="footer-profile-image" />
          </template>
          <template v-else>
            <img src="https://placekitten.com/640/360" alt="" class="footer-profile-image" />
          </template>
        </a>
        <b-dropdown
          class="footer-dropdown-button"
          size="sm"
          :text="smmUser ? smmUser.username : 'loading...'"
          variant="outline-primary"
        >
          <!-- Questo funziona solo in production, development non dovrebbe andare, catturato dal locahost locale -->
          <b-dropdown-item
            ><a class="dropdown-item" :href="`/user/${smmUser?.username}`"
              >Profile</a
            ></b-dropdown-item
          >
          <b-dropdown-divider></b-dropdown-divider>
          <b-dropdown-item
            ><router-link class="dropdown-item" to="/logout">Sign out</router-link></b-dropdown-item
          >
        </b-dropdown>
      </div>
    </template>
  </b-sidebar>
</template>

<style lang="scss" scoped>
@import 'bootstrap/scss/bootstrap.scss';

.outside-sidebar-toggler {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 1000;
  margin: 1rem 0 0 1rem;

  &:hover {
    cursor: pointer;
  }

  svg {
    width: 2rem;
    height: 2rem;
  }
}

.sidebar-header {
  display: inline-flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  width: 100%;

  .icon-container {
    border-radius: 0.1rem;
    transition-property: background-color;
    transition-duration: 0.3s;
    &:hover {
      cursor: pointer;
      background-color: var(--secondary);
    }

    svg {
      width: 1.5rem;
      height: 1.5rem;
      color: antiquewhite;
    }
  }
}
.sidebar-footer {
  @extend .pb-3;
  display: flex;
  flex-direction: row;
  justify-content: start;
  align-items: center;
  width: 100%;
  min-height: 3rem;

  .footer-profile-image {
    @extend .rounded-circle;
    margin: 0 1rem 0 1rem;
    width: 2rem;
    height: 2rem;
    border: 1px solid var(--secondary);
  }

  .footer-dropdown-button {
    height: 2rem;
  }
}

.hidden {
  display: none;
}
</style>
