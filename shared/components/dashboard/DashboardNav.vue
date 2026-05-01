<template>
<nav class="dashboard-nav">
  <h2 class="a11y-sr-only">{{ title }}</h2>

  <template v-if="withLocalInfo">
    <local-info
      v-if="gridMeta"
      :name="gridMeta.name"
      :timezone="gridMeta.timezone"
      class="mb-1"
    />
    <div
      v-else
      class="scc scc-in-menu local-info__skeleton mb-1"
    ></div>
  </template>

  <ul
    class="dashboard-nav__items"
    :class="{ 'dashboard-nav__items--disabled': disabled }"
  >
    <li
      v-for="item in navItems"
      :key="item.path"
    >
      <router-link
        class="dashboard-nav__link"
        :to="item.path"
      >
        <mdi-icon
          class="dashboard-nav__link__icon"
          :name="item.icon"
        />
        <span class="dashboard-nav__link__text">
          {{ item.label }}
        </span>
      </router-link>
    </li>
  </ul>
</nav>
</template>

<script>
import LocalInfo from './LocalInfo.vue';

export default {
  props: {
    title: {
      type: String,
    },
    navItems: {
      type: Array,
      default: () => [],
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    gridMeta: {
      type: Object,
    },
    withLocalInfo: {
      type: Boolean,
      default: false,
    },
  },

  components: { LocalInfo },
};
</script>

<style lang="scss">
@use 'sass:color';

.dashboard-nav {
  width: 100%;

  &__items {
    position: relative;
    margin: 0;
    padding: 0;
    list-style: none;
    transition: opacity 250ms ease-out;

    &--disabled {
      opacity: 0.5;

      &::after {
        @include pseudo;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        cursor: not-allowed;
      }
    }
  }

  &__link {
    display: flex;
    width: 100%;
    align-items: center;
    text-decoration: none;
    color: $nxt-color-font-white;
    background: none;
    border: none;
    line-height: 1;
    font-weight: 400;
    padding: 1rem 20px;
    white-space: nowrap;
    transition: $dashboard-menu-transition;
    cursor: pointer;
    outline: 0;

    @media(min-width: $ipad-horizontal) {
      .dashboard-menu--minimized & {
        padding-left: 34px;
      }
    }

    &__icon {
      flex-shrink: 0;
      margin-right: 16px;
      margin-block: -2px;
    }

    &__text {
      transition: $dashboard-menu-transition;

      @media(min-width: $ipad-horizontal) {
        .dashboard-menu--minimized & {
          opacity: 0;
        }
      }
    }

    @media (hover: hover) {
      &:hover:not(.router-link-active) {
        background-color: color.adjust($nxt-color-blue, $lightness: 10%, $space: hsl);
      }
    }

    &.router-link-active {
      font-weight: 700;
      color: #c6c6c6;
      background-color: $nxt-color-blue-dark;
      box-shadow:
        inset 0 -1px 2px rgba(#000, 0.1),
        inset 0 1px 2px rgba(#000, 0.1);
    }

    &:focus {
      box-shadow:
        inset 0 0 0 3px rgba($nxt-color-blue-focusring, 1);
    }
  }
}
</style>
