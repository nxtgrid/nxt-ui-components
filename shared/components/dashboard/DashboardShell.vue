<template>
<!-- Top Header -->
<header
  class="dashboard-header"
  :class="{ 'dashboard-header--red': isUsingProductionBackendInDevelopmentFrontend }"
>
  <slot name="header" />
</header>

<!-- Side Menu -->
<div
  class="dashboard-menu"
  :class="{
    'dashboard-menu--active': dbUiStore.menuActive,
    'dashboard-menu--minimized': dbUiStore.sideBarMinimized,
  }"
>
  <user-avatar
    :is-narrow="dbUiStore.sideBarMinimized"
    :link-to="profileLinkTo"
    @click="dbUiStore.closeMenu"
  />
  <slot name="side-menu" />
  <button
    class="dashboard-menu__toggler"
    @click="dbUiStore.toggleSidebarSize"
  >
    <mdi-icon :icon="mdiChevronLeft" :scale="28"/>
  </button>
</div>
<transition name="fade-simple">
  <div
    v-if="dbUiStore.menuActive"
    @click="dbUiStore.closeMenu"
    class="full-screen-cover dashboard-menu-cover"
  ></div>
</transition>

<!-- Menu Button -->
<floating-menu-button
  @click="dbUiStore.toggleMenu"
  :is-active="dbUiStore.menuActive"
/>

<!-- Main Content -->
<main
  class="main-content"
  :class="{ 'main-content--maximized': dbUiStore.sideBarMinimized }"
>
  <div class="main-content__padded">
    <bread-crumbs />
    <router-view :key="route.path" />
  </div>
</main>

<!-- Root Modal -->
<nxt-modal />
<div v-if="!isOnline" class="offline-message">
  <p>You are offline</p>
  <mdi-icon :icon="mdiWebOff" />
</div>
</template>

<script>
import { useRoute } from 'vue-router';
import { useOnline } from '@vueuse/core';
import { useDashboardUiStore } from './store/dashboard-ui.js';
import { mdiChevronLeft, mdiWebOff } from '@mdi/js';

import UserAvatar from './UserAvatar.vue';
import FloatingMenuButton from '../FloatingMenuButton/FloatingMenuButton.vue';
import BreadCrumbs from './BreadCrumbs.vue';
import NxtModal from '../NxtModal/NxtModal.vue';

export default {
  props: {
    profileLinkTo: {
      type: String,
      required: true,
    },
  },

  setup() {
    const route = useRoute();
    const dbUiStore = useDashboardUiStore();
    const isOnline = useOnline();
    const productionHostname = import.meta.env.VITE_PRODUCTION_BACKEND_HOSTNAME;
    const isUsingProductionBackendInDevelopmentFrontend = import.meta.env.VITE_CONTEXT !== 'production' && !!productionHostname && import.meta.env.VITE_API_URL?.includes(productionHostname);

    return { route, dbUiStore, isOnline, isUsingProductionBackendInDevelopmentFrontend, mdiChevronLeft, mdiWebOff };
  },

  components: { UserAvatar, FloatingMenuButton, BreadCrumbs, NxtModal },
};
</script>

<style lang="scss">
@use 'sass:color';

$sidebar-width: 248px;
$sidebar-width-minimized: 92px;

.dashboard-header {
  position: fixed;
  display: flex;
  height: $dashboard-header-bar-height;
  width: 100%;
  align-items: center;
  background-color: $nxt-color-blue-dark;
  z-index: $z-top-bar;

  &--red {
    background-color: $nxt-color-error;
  }

  &__actions {
    display: flex;
    // column-gap: 8px;
    align-items: center;
    margin-right: 4%;
    margin-left: auto;

    @media(min-width: $ipad-horizontal) {
      margin-right: 32px;
    }
  }
}

.dashboard-menu {
  position: fixed;
  display: flex;
  flex-direction: column;
  top: 0;
  left: 0;
  height: 100%;
  width: $sidebar-width;
  padding-top: $dashboard-header-bar-height;
  transform: translateX(-100%);
  background-color: $nxt-color-blue;
  box-shadow: 2px 0 8px rgba(#000, 0);
  transition: $dashboard-menu-transition;
  z-index: $z-side-menu;

  @media(max-width: ($ipad-horizontal - 1px)) {
    &--active {
      box-shadow: 2px 0 8px rgba(#000, 0.25);
      transform: translateX(0);
    }
  }

  @media(min-width: $ipad-horizontal) {
    &--minimized {
      width: $sidebar-width-minimized;
    }
  }

  &__toggler {
    position: absolute;
    display: flex;
    width: 40px;
    height: 40px;
    right: -20px;
    bottom: 72px;
    align-items: center;
    justify-content: center;
    background-color: $nxt-color-blue;
    color: $nxt-color-white;
    border: 3px solid $nxt-color-blue-bright;
    border-radius: 100%;
    transition: $dashboard-menu-transition;
    cursor: pointer;
    outline: none;

    @media (hover: hover) {
      &:hover {
        background-color: color.adjust($nxt-color-blue, $lightness: 10%, $space: hsl);
      }
    }

    &:focus {
      box-shadow:
        0 0 0 4px $nxt-color-blue-focusring,
      ;
    }

    svg {
      flex-shrink: 0;

      transition: 600ms $ease--out-back;

      .dashboard-menu--minimized & {
        transform: rotate(-180deg);
      }
    }

    @media(max-width: ($ipad-horizontal - 1px)) {
      display: none;
    }
  }
}

.dashboard-menu-cover {
  z-index: $z-menu-cover;
}

// Non-mobile styles
@media(min-width: $ipad-horizontal) {
  .dashboard-menu {
    transform: translateX(0);
  }
  .dashboard-menu-cover {
    display: none;
  }
}

.main-content {
  position: relative;
  width: 100%;
  border-top: $dashboard-header-bar-height solid transparent;
  transition: $dashboard-menu-transition;

  &__padded {
    width: $dashboard-content-width-mobile;
    margin: 0 auto;
    padding-block: 1rem 5rem;
    max-width: 1400px;
  }

  @media(min-width: $ipad-horizontal) {
    border-left: $sidebar-width solid transparent;

    &__padded {
      width: 100%;
      margin: 0;
      padding: 2rem 32px;
    }

    &--maximized {
      border-left-width: $sidebar-width-minimized;
    }
  }
}

.offline-message {
  position: fixed;
  display: flex;
  align-items: center;
  column-gap: 4px;
  bottom: 1rem;
  left: 16px;
  background-color: $nxt-color-warn;
  color: $nxt-color-font-white;
  padding: 1rem 16px;
  border-radius: 4px;
  box-shadow: $sh1;
  z-index: $z-offline-message;
}

.nav-slide-level-1 {
  &-enter-active,
  &-leave-active {
    position: absolute;
    transition: transform 600ms $ease--out-expo;
  }

  &-enter-from,
  &-leave-to {
    transform: translateX(-100%);
  }
}

.nav-wrapper {
  position: relative;
  overflow-x: hidden;
  flex-grow: 1;
}

.nav-slide-level-2 {
  &-enter-active,
  &-leave-active {
    position: absolute;
    transition: transform 600ms $ease--out-expo;
  }

  &-enter-from,
  &-leave-to {
    transform: translateX(100%);
  }
}
</style>
