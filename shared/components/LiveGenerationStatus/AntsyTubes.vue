<template>
<div class="antsy-tubes">
  <div class="antsy-tubes__tube-left">
    <div v-if="hasConnection" class="tube-ants"></div>
  </div>
  <div class="antsy-tubes__tube-center">
    <div v-if="hasConnection" class="tube-ants"></div>
  </div>
  <div class="antsy-tubes__tube-right">
    <div v-if="hasConnection" class="tube-ants"></div>
  </div>
</div>
</template>

<script>
export default {
  props: {
    hasConnection: {
      type: Boolean,
      default: true,
    },
  },
};
</script>

<style lang="scss">
$ant-width: 16px;
$ant-height: 4px;
$ant-color: $nxt-color-blue-highlight;

.antsy-tubes {
  position: absolute;
  width: 80%;
  height: 16px;
  border-bottom: 1px solid $nxt-color-placeholder;
  border-left: 1px solid $nxt-color-placeholder;
  border-right: 1px solid $nxt-color-placeholder;
  border-bottom-left-radius: 8px;
  border-bottom-right-radius: 8px;
  overflow: hidden;

  &::before {
    @include pseudo;
    top: 0;
    left: 4px;
    width: calc(100% - 8px);
    height: 11px;
    border-bottom: 1px solid $nxt-color-placeholder;
    border-left: 1px solid $nxt-color-placeholder;
    border-right: 1px solid $nxt-color-placeholder;
    border-bottom-left-radius: 4px;
    border-bottom-right-radius: 4px;
  }

  &__tube-center {
    position: absolute;
    width: 100%;
    height: 4px;
    left: 0;
    bottom: 0;
  }

  &__tube-left {
    position: absolute;
    width: 16px;
    height: 4px;
    top: 0;
    left: 0;
    transform-origin: 0 4px;
    transform: rotate(90deg);
  }

  &__tube-right {
    position: absolute;
    width: 16px;
    height: 4px;
    top: 0;
    left: 100%;
    transform-origin: 0 4px;
    transform: rotate(-90deg);
  }
}

.tube-ants {
  position: absolute;
  width: calc(100% + $ant-width);
  height: 100%;
  background: linear-gradient(90deg, $ant-color 50%, transparent 50%);
  background-repeat: repeat-x;
  background-size: $ant-width $ant-height;
  animation: move-ants 500ms linear infinite;
}

@keyframes move-ants {
  to {
    transform: translateX(-16px);
  }
}
</style>
