<template>
<svg-solar-panel
  class="solar-panel-front"
  :num-panels="numPanels"
  :panel-scale="panelScale"
/>
<div class="solar-panel-legs">
  <div class="solar-leg solar-leg--1"></div>
  <div class="solar-leg solar-leg--2"></div>
</div>
<div class="solar-backleg"></div>

<!-- <template v-if="screenWidth >= 1152">
  <div class="solar-panels-back">
    <svg-solar-panel :num-panels="numBackPanels " />
    <svg-solar-panel :num-panels="numBackPanels" />
  </div>
</template> -->

</template>

<script>
import { computed } from 'vue';
import SvgSolarPanel from './svg/SvgSolarPanel.vue';

export default {
  props: {
    screenWidth: {
      type: Number,
      default: window.innerWidth,
    },
  },

  setup(props) {
    const numPanels = computed(() => {
      if(props.screenWidth >= 1440) return 13;
      if(props.screenWidth >= 1280) return 12;
      if(props.screenWidth >= 1152) return 10;
      if(props.screenWidth >= 640) return 8;
      if(props.screenWidth >= 460) return 5;
      return 4;
    });

    const panelScale = computed(() => {
      if(props.screenWidth >= 1440) return 1.35;
      if(props.screenWidth >= 768) return 1.25;
      return 1;
    });

    const numBackPanels = computed(() => {
      if(props.screenWidth >= 1360) return 9;
      if(props.screenWidth >= 1280) return 8;
      if(props.screenWidth >= 1220) return 7;
      return 6;
    });

    return { numPanels, panelScale, numBackPanels };
  },

  components: { SvgSolarPanel },
};
</script>

<style lang=scss scoped>
$sketch-color: #525252;
$sketch-bg-color: #dddfe3;

.solar-panel-front {
  position: absolute;
  width: 100%;
  bottom: 8px;
  z-index: 2;
}

.solar-panel-legs {
  position: absolute;
  width: 100%;
  bottom: 4px;
  display: flex;
  justify-content: center;
}

.solar-leg {
  height: 3px;
  width: 4px;
  background-color: $sketch-color;

  &--1 {
    margin-left: -8px;
    margin-right: 22px;
  }
}

.solar-backleg {
  position: absolute;
  bottom: 4px;
  width: 4px;
  left: 50%;
  margin-left: 26px;
  height: 30px;
  background: $sketch-color;
}

@media(min-width: $mobile-horizontal) {
  .solar-backleg {
    margin-left: 33px;
  }
}

@media(min-width: $mobile-horizontal) {
  .solar-backleg {
    margin-left: 33px;
  }
}

@media(min-width: $table-break) {
  .solar-panel-front {
    bottom: 10px;
  }

  .solar-leg {
    height: 5px;

    &--1 {
      margin-left: -12px;
      margin-right: 50px;
    }
  }

  .solar-backleg {
    margin-left: 53px;
  }
}

@media(min-width: $ipad-vertical) {
  .solar-leg--1 {
    margin-left: -16px;
    margin-right: 84px;
  }

  .solar-backleg {
    margin-left: 70px;
  }
}

@media(min-width: $macbook-air) {
  .solar-panel-front {
    bottom: 12px;
  }

  .solar-leg {
    height: 6px;

    &--1 {
      margin-left: -20px;
      margin-right: 100px;
    }
  }

  .solar-backleg {
    margin-left: 86px;
  }
}

@media(min-width: $macbook-pro) {
  .solar-leg--1 {
    margin-right: 120px;
  }

  .solar-backleg {
    margin-left: 102px;
  }
}

@media(min-width: $desktop) {
  .solar-leg--1 {
    margin-right: 150px;
  }

  .solar-backleg {
    margin-left: 121px;
  }
}

// .solar-panels-back {
//   position: absolute;
//   bottom: 38px;
//   z-index: 0;
//   width: 90%;
//   left: 5%;
//   display: flex;
//   justify-content: space-between;
// }
</style>
