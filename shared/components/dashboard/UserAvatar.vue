<template>
<router-link
  class="user-avatar fp--user-profile-page"
  :class="{ 'user-avatar--narrow': isNarrow }"
  :to="linkTo"
>
  <div
    v-if="myProfile"
    class="user-avatar__wrapper"
  >
    <img
      class="user-avatar__image"
      :src="userAvatar"
      referrerpolicy="no-referrer"
      alt="user avatar"
    />
    <div class="user-avatar__status"></div>
    <p class="user-avatar__text text-small">
      {{ myProfile.full_name }}
    </p>
    <mdi-icon
      :icon="mdiChevronRight"
      :scale="18"
      class="user-avatar__chevron"
    />
  </div>
  <div
    v-else
    class="user-avatar__skeleton scc scc-in-menu"
  ></div>
</router-link>
</template>

<script>
import { computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useAccountStore } from '@nxt/libraries/api-connection/store/account';

import genericProfile from './generic-profile.png';
import { mdiChevronRight } from '@mdi/js';

export default {
  props: {
    isNarrow: {
      type: Boolean,
      default: false,
    },

    linkTo: {
      type: String,
      required: true,
    },
  },

  setup() {
    const { mySupabaseProfile, myProfile } = storeToRefs(useAccountStore());
    const userAvatar = computed(() => mySupabaseProfile.value?.picture ?? genericProfile);

    return { myProfile, userAvatar, mdiChevronRight };
  },
};
</script>

<style lang="scss">
@use 'sass:color';

.user-avatar {
  display: flex;
  align-items: center;
  margin-block: 1.5rem;
  padding-block: 0.5rem;
  padding-inline: 20px;
  color: $nxt-color-white;
  text-decoration: none;
  outline: 0;

&:focus {
    box-shadow:
      inset 0 0 0 3px rgba($nxt-color-blue-focusring, 1);
  }

  &__wrapper {
    display: flex;
    align-items: center;

  }

  &__skeleton {
    width: 100%;
    height: 48px;
  }

  &__image {
    flex-shrink: 0;
    width: 48px;
    height: 48px;
    border-radius: 4px;
  }

  &__status {
    flex-shrink: 0;
    width: 16px;
    height: 16px;
    border: 3px solid $nxt-color-blue;
    margin-inline: 5px;
    border-radius: 100%;
    background-color: $nxt-color-success;
    transition: $dashboard-menu-transition;

    @media(min-width: $ipad-horizontal) {
      .user-avatar--narrow & {
        transform: translate(-16px, 20px);
      }
    }
  }

  &__text {
    flex-shrink: 0;
    white-space: nowrap;
    width: 120px; // @TODO :: Calculate perfect width
    overflow: hidden;
    transition: $dashboard-menu-transition;

    @media(min-width: $ipad-horizontal) {
      .user-avatar--narrow & {
        opacity: 0;
        width: 0;
      }
    }
  }

  &__chevron {
    margin-left: auto;
    flex-shrink: 0;
    transition: $dashboard-menu-transition;

    @media(min-width: $ipad-horizontal) {
      .user-avatar--narrow & {
        transform: translateX(-23px);
      }
    }
  }

  @media (hover: hover) {
    &:hover {
      background-color: color.adjust($nxt-color-blue, $lightness: 10%, $space: hsl);

      .user-avatar__status {
        border-color: color.adjust($nxt-color-blue, $lightness: 10%, $space: hsl);
      }
    }
  }
}
</style>
