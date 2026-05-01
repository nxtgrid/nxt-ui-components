<template>
<div
  v-if="breadCrumbs"
  class="bread-crumbs"
>
  <button
    onclick="history.back()"
    class="bread-crumbs__back"
    v-wave
  >
    <mdi-icon :icon="mdiArrowLeft" />
  </button>
  <ul class="bread-crumbs__list">
    <li
      v-for="(crumb, index) in breadCrumbs"
      :key="index"
    >
      <router-link
        v-if="crumb.path"
        :to="crumb.path"
        class="bread-crumbs__link"
        v-wave="{ initialOpacity: 0.5 }"
      >
        {{ crumb.label }}
      </router-link>
      <template v-else>
        {{ crumb.label }}
      </template>
      <mdi-icon
        v-if="index < breadCrumbs.length - 1"
        :scale="18"
        class="bread-crumbs__chevron"
        :icon="mdiChevronRight"
      />
    </li>
  </ul>
</div>
</template>

<script>
import { storeToRefs } from 'pinia';
import { useDashboardUiStore } from './store/dashboard-ui.js';
import { mdiArrowLeft, mdiChevronRight } from '@mdi/js';

export default {
  setup() {
    const { breadCrumbs } = storeToRefs(useDashboardUiStore());
    return { breadCrumbs, mdiArrowLeft, mdiChevronRight };
  },
};
</script>

<style lang="scss">
.bread-crumbs {
  display: flex;
  margin-bottom: 1rem;
  align-items: center;
  color: $nxt-color-blue-lighter;

  &__back {
    background: none;
    border: none;
    padding: 0 4px 0 0;
    cursor: pointer;

    svg {
      display: block;
      margin-left: -2px;
      transition: 200ms $ease--out-expo;
    }

    @media (hover: hover) {
      &:hover {
        svg {
          transform: translateX(-5px);
        }
      }
    }
  }

  &__list {
    display: flex;
    column-gap: 4px;
    row-gap: 0.25rem;
    align-items: center;
    list-style: none;
    padding: 0;
    font-size: 0.875rem;
    font-weight: 700;
    border-left: thin solid $nxt-color-blue-light;
    padding-left: 8px;
    flex-wrap: wrap;
  }

  li {
    display: flex;
    align-items: center;
    flex-shrink: 0;
    white-space: nowrap;
  }

  &__link {
    color: inherit;
    text-decoration: none;
    padding-block: 0.25rem;

    @media (hover: hover) {
      &:hover {
        text-decoration: underline;
      }
    }
  }

  &__chevron {
    margin-left: 4px;
  }
}
</style>
