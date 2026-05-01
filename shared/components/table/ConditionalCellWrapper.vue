<template>
<router-link
  v-if="to"
  :to="to"
  class="conditional-cell--link"
  @click.stop
>
  <slot />
</router-link>
<slot v-else />
</template>

<script>
export default {
  props: {
    to: {
      type: String,
    },
  },
};
</script>

<style lang="scss">
.conditional-cell--link {
  display: block;
  position: relative;
  color: $nxt-color-blue-highlight;

  &::after {
    @include pseudo;
    top: -1rem;
    left: -16px;
    width: calc(100% + 32px);
    height: calc(100% + 2rem);
    z-index: -1;
  }
}
</style>
