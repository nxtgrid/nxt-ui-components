<template>
<nxt-popover z-index="11">
  <template #trigger="{ uid, togglePopover }">
    <nxt-button
      :id="uid"
      :icon-svg="mdiApps"
      icon-only
      variant="white"
      @click="togglePopover"
    />
  </template>
  <div class="nxt-app-grid">
    <a
      v-for="app in apps"
      :key="app.name"
      :href="app.link"
      :target="app.target"
      class="nxt-app with-any-focus-tight"
    >
      <div class="nxt-app__icon">
        <span
          v-if="app.iconLetter"
          class="nxt-app__letter-icon"
        >
          {{ app.iconLetter }}
        </span>
      </div>
      <span class="nxt-app__name">{{ app.name }}</span>
    </a>
  </div>
</nxt-popover>
</template>

<script>
import NxtPopover from '../NxtPopover/NxtPopover.vue';
import { mdiApps } from '@mdi/js';

export default {
  setup() {
    const apps = [
      {
        name: 'Construct',
        iconLetter: 'S',
        link: 'https://sphinx.nxtgrid.co',
        target: '_self',
      },
      {
        name: 'Open new',
        iconLetter: 'O',
        link: 'https://sphinx.nxtgrid.co',
        target: '_blank',
      },
    ];

    return { apps, mdiApps };
  },

  components: {
    NxtPopover,
  },
};
</script>

<style lang="scss">
.nxt-app-grid {
  display: grid;
  grid-template-columns: auto auto auto;
}

.nxt-app {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-decoration: none;
  color: inherit;
  border-radius: 8px;
  padding: 8px;
  width: 84px;
  height: 84px;

  &__icon {
    width: 48px;
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  &__letter-icon {
    font-size: 40px;
    font-weight: 700;
    color: $nxt-color-blue-highlight;
  }

  &__name {
    margin-top: 0.25rem;
    font-size: 0.875rem;
    line-height: 1rem;
    color: $nxt-color-blue-lighter;
  }

  &:hover {
    background-color: $nxt-color-background-lighter;
  }
}
</style>
