<script setup lang="ts"></script>

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
        <b-list-group-item href="#some-link" class="list-nav-item" active>
          <b-icon-speedometer2 aria-hidden="true"></b-icon-speedometer2>
          Dashboard
        </b-list-group-item>
        <b-list-group-item href="#" class="list-nav-item">
          <b-icon-bag aria-hidden="true"></b-icon-bag>
          Buy quotas
        </b-list-group-item>
        <b-list-group-item href="#" class="list-nav-item">
          <b-icon-geo-alt aria-hidden="true"></b-icon-geo-alt>
          Activate geolocation</b-list-group-item
        >
        <b-list-group-item href="#" class="list-nav-item">
          <b-icon-person aria-hidden="true"></b-icon-person>
          Customers
        </b-list-group-item>
      </b-list-group>
    </nav>
    <template #footer>
      <hr />
      <div class="sidebar-footer">
        <a href="#" class="d-flex align-items-center link-dark text-decoration-none">
          <!-- TODO: fetch image from backend! -->
          <img src="https://github.com/mdo.png" alt="" class="footer-profile-image" />
        </a>
        <b-dropdown class="footer-dropdown-button" size="sm" text="mdo" variant="outline-primary">
          <b-dropdown-item><a class="dropdown-item" href="#">New project...</a></b-dropdown-item>
          <b-dropdown-item><a class="dropdown-item" href="#">Settings</a></b-dropdown-item>
          <b-dropdown-item><a class="dropdown-item" href="#">Profile</a></b-dropdown-item>
          <b-dropdown-divider></b-dropdown-divider>
          <b-dropdown-item><a class="dropdown-item" href="#">Sign out</a></b-dropdown-item>
        </b-dropdown>
      </div>
    </template>
  </b-sidebar>
</template>

<script lang="ts">
export default {
  data() {
    return {
      show: false
    }
  }
}
</script>

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
  }

  .footer-dropdown-button {
    height: 2rem;
  }
}

.hidden {
  display: none;
}
</style>
