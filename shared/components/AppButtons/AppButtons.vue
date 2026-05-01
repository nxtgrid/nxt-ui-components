<template>
<nav class="app-buttons">
  <h2 class="a11y-sr-only">App navigation</h2>
  <ul class="app-buttons__list">
    <template v-for="button in buttons" :key="button.title">
      <li v-if="button.spacer" :style="`grid-column: span ${ button.spacer };`"></li>
      <li v-else-if="!button.hideWhen">
        <component
          :is="button.to ? 'router-link' : 'button'"
          :to="button.to"
          class="app-buttons__button"
          :class="[ inferClass(button.customActiveRoute), { 'app-buttons__button--disabled': button.disabled } ]"
          v-on="button.action ? { click: button.action } : {}"
          :disabled="button.disabled"
        >
          <mdi-icon :name="button.icon" />
          {{ button.title }}
        </component>
      </li>
    </template>
  </ul>
</nav>
</template>

<script>
export default {
  props: {
    buttons: {
      type: Array,
      required: true,
    },
    customActiveRoute: {
      type: String,
    },
  },

  methods: {
    inferClass(buttonCustomActiveRoute) {
      if(!this.customActiveRoute) return;
      if(this.customActiveRoute === buttonCustomActiveRoute)
        return 'is-active-route';
    },
  },
};
</script>

<style lang="scss">
.app-buttons {
  position: fixed;
  width: 100%;
  height: $app-buttons-height;
  bottom: 0;
  background-color: $nxt-color-white;
  box-shadow: rgba(#000, 0.1) 0px -2px 6px -1px, rgba(#000, 0.06) 0px 0px 4px -1px;
  z-index: $z-mobile-bottom-bar;

  &__list {
    display: grid;
    grid-auto-columns: minmax(0, 1fr);
    grid-auto-flow: column;
    width: 100%;
    height: 100%;
    margin: 0 auto;
    padding: 0;
    list-style: none;
    max-width: 1024px;

    @media(min-width: $table-break) {
      border-left: thin solid $nxt-color-background-light;
      border-right: thin solid $nxt-color-background-light;
      width: $app-content-width-mobile;
    }

    @media(min-width: $ipad-horizontal) {
      width: $app-content-width-desktop;
    }
  }

  li:not(:first-child){
    border-left: thin solid $nxt-color-background-light;
  }

  &__button {
    position: relative;
    height: 100%;
    width: 100%;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: 0;
    border: 0;
    text-decoration: none;
    color: $nxt-color-blue;
    font-weight: 700;
    font-size: 0.75rem;
    line-height: 1;
    cursor: pointer;

    svg {
      margin-bottom: 0.125rem;
    }

    &::after {
      @include pseudo;
      width: 100%;
      height: 0;
      background: $nxt-color-blue-highlight;
      bottom: 0;
      left: 0;
      transition: height 400ms $ease--out-expo;
    }

    &.is-active-route::after {
      height: 4px;
    }

    &--disabled {
      opacity: 0.5;
      pointer-events: none;
    }
  }
}
</style>
