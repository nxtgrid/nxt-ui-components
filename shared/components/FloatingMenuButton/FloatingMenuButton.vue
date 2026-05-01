<template>
<button
  class="menu-button with-keyboard-focus-padded"
  :class="{ 'menu-button--active': isActive }"
  v-wave="{ initialOpacity: 1 }"
>
  <div class="stripes">
    <div class="stripe stripe--t"></div>
    <div class="stripe stripe--m"></div>
    <div class="stripe stripe--b"></div>
  </div>
</button>
</template>

<script>
export default {
  props: {
    isActive: {
      type: Boolean,
      default: false,
    },
  },
};
</script>

<style lang="scss" scoped>
.menu-button {
  position: fixed;
  bottom: 16px;
  right: 16px;
  display: flex;
  background: $nxt-color-blue;
  border: none;
  height: 48px;
  width: 48px;
  border-radius: 48px;
  padding: 0;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow:
    0 3px 1px -2px rgba(0,0,0,.2),
    0 2px 2px 0 rgba(0,0,0,.14),
    0 1px 5px 0 rgba(0,0,0,.12)
  ;
  z-index: $z-menu-button;

  @media(min-width: $ipad-horizontal) {
    display: none;
  }
}

.stripes {
  position: relative;
  width: 20px;
  height: 16px;
}

.stripe {
  position: absolute;
  left: 0;
  width: 20px;
  height: 2px;
  border-radius: 2px;
  background: $nxt-color-white;
  transform-origin: 0 50%;
  transition: $dashboard-menu-transition;

  &--t {
    top: 0;

    .menu-button--active & {
      left: 3px;
      transform: rotate(45deg);
    }
  }

  &--m {
    top: 7px;
    opacity: 1;

    .menu-button--active & {
      opacity: 0;
      transform: translateX(-50px);
    }
  }

  &--b {
    top: 14px;

    .menu-button--active & {
      left: 3px;
      transform: rotate(-45deg);
    }
  }
}
</style>
