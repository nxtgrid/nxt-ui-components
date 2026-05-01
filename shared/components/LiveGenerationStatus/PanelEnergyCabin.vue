<template>
<div class="cabin">
  <div class="side side--left"></div>
  <div class="side side--right"></div>

  <div class="roof roof--1"></div>
  <div class="roof roof--holes"></div>

  <svg-satellite
    class="satellite"
    :connection-status="connectionStatus"
  />

  <div class="door">
    <div class="batteries">
      <svg-battery
        v-for="idx in numBatteries"
        :key="idx"
        :charge="charge"
      />
    </div>
  </div>
  <div class="shadows">
    <div class="shadow shadow--left"></div>
    <div class="shadow shadow--top"></div>
    <div class="shadow shadow--right"></div>
  </div>
</div>
</template>

<script>
import { computed } from 'vue';
import SvgBattery from './svg/SvgBattery.vue';
import SvgSatellite from './svg/SvgSatellite.vue';

export default {
  props: {
    charge: {
      type: Number,
      default: 0,
    },

    connectionStatus: {
      type: Object,
    },

    screenWidth: {
      type: Number,
      default: window.innerWidth,
    },
  },

  setup(props) {
    const numBatteries = computed(() => {
      if(props.screenWidth >= 1440) return 5;
      if(props.screenWidth >= 1280) return 4;
      return 3;
    });

    return { numBatteries };
  },

  components: { SvgBattery, SvgSatellite },
};
</script>

<style lang="scss" scoped>
$sketch-color: #525252;
$sketch-bg-color: #dddfe3;

.cabin {
  position: absolute;
  width: 100px;
  height: 41px;
  // background: rgba(hotpink, 0.2);
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
}

.side {
    position: absolute;
    width: 4px;
    height: 100%;
    bottom: 0;
    background-color: $sketch-color;
    z-index: 2;

    &--left {
      left: 9px;
    }

    &--right {
      right: 9px;
    }
  }

.roof {
  position: absolute;
  height: 4px;
  // background-color: $sketch-color;
  top: 0;

  &--1 {
    // width: 30px;
    width: calc(100% - 6px);
    left: 3px;
    background-color: $sketch-color;
    z-index: 2;
  }

  &--holes {
    width: 8px;
    height: 4px;
    left: 33px;
    z-index: 3;

    &::before, &::after {
      @include pseudo;
      position: absolute;
      background-color: $sketch-bg-color;
      width: 2px;
      height: 100%;
    }

    &::before {
      left: 0;
    }

    &::after {
      right: 0;
    }
  }
}

.satellite {
  position: absolute;
  bottom: 100%;
  left: 32px;
  margin-bottom: -2px;
  z-index: 2;
}

.door {
  position: absolute;
  width: 58px;
  height: 32px;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  border: 4px solid $sketch-color;
  z-index: 2;
  overflow: hidden;
}

.batteries {
  position: absolute;
  width: 400%;
  left: -150%;
  bottom: -4px;
  display: flex;
  justify-content: center;
  column-gap: 2px;
}

.shadows {
  position: absolute;
  height: 100%;
  width: 100%;
  bottom: 0;
  left: 0;
  opacity: 0.1;
}

.shadow {
  position: absolute;
  background: $nxt-color-blue;

  &--top {
    width: 86%;
    height: 17px;
    top: -2px;
    left: 7px;
    transform: rotate(3deg);
  }

  &--left {
    width: 16px;
    height: 40px;
    bottom: -2px;
    left: 8px;
    transform: rotate(-6deg);
  }

  &--right {
    width: 20px;
    height: 40px;
    right: 8px;
    bottom: 0;
    transform: rotate(6deg);
  }
}

@media(min-width: $mobile-horizontal) {
  .cabin {
    width: 77%;
    height: 45px;
  }
  .door {
    width: 58%;
  }
  .shadow--top {
    width: 88%;
    height: 21px;
  }
  .shadow--left {
    width: 16%;
  }
  .shadow--right {
    width: 20%;
  }
}

@media(min-width: $table-break) {
  .cabin {
    height: 50px;
  }
  .shadow--top {
    width: 91%;
    height: 26px;
  }
  .shadow--right {
    width: 21%;
  }
}

@media(min-width: $ipad-vertical) {
  .cabin {
    height: 60px;
  }
  .door {
    height: 42px;
  }
  .shadow--top {
    left: 6px;
    height: 28px;
  }
  .shadow--left {
    left: 7px;
    height: 66px;
    width: 19%
  }
  .shadow--right {
    height: 58px;
  }
  .batteries {
    column-gap: 4px;
  }
}

@media(min-width: $macbook-air) {
  .cabin {
    height: 64px;
  }
  .shadow--top {
    height: 31px;
  }
  .shadow--right {
    height: 62px;
  }
}

@media(min-width: $macbook-pro) {
  .cabin {
    height: 66px;
  }
  .shadow--top {
    height: 32px;
  }
  .shadow--right {
    height: 64px;
  }
}

@media(min-width: $desktop) {
  .cabin {
    height: 74px;
  }
  .door {
    height: 48px;
    width: 70%;
  }
  .shadow--top {
    height: 29px;
  }
  .shadow--left {
    left: 8px;
    width: 13%;
    height: 70px;
  }
  .shadow--top {
    transform: rotate(2deg);
    left: 5px;
    width: 95%;
    height: 32px;
  }
  .shadow--right {
    right: 10px;
    width: 14%;
    height: 68px;
  }
}
</style>
