<template>
<div class="battery">
  <div class="box">
    <div
      class="charge"
      :class="dynamicClass"
      :style="{ height: `${ charge }%` }"
    ></div>
    <svg
      class="bolt"
      viewBox="0 0 6 10"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M4 0.500045C4 0.274158 3.85207 0.0763247 3.63908 0.0173727C3.4261 -0.0415792 3.20096 0.0529929 3.08978 0.248109L0.0665264 5.24806C-0.0215848 5.40271 -0.0222113 5.59378 0.0648839 5.74903C0.151979 5.90428 0.313502 6 0.488371 6H2V9.50004C2 9.72593 2.14793 9.92377 2.36092 9.98272C2.5739 10.0417 2.79904 9.9471 2.91022 9.75198L5.93346 4.75194C6.02157 4.59729 6.0222 4.40622 5.9351 4.25097C5.848 4.09572 5.68648 4 5.51161 4H4V0.500045Z" fill="#525252"/>
    </svg>
  </div>
</div>
</template>

<script>
export default {
  props: {
    charge: {
      type: Number,
      default: 0,
    },
  },

  computed: {
    dynamicClass() {
      const level = this.charge < 15 ? 'low' :
        this.charge < 50 ? 'medium' : 'high';
      return `charge--${ level }`;
    },
  },
};
</script>

<style lang="scss" scoped>
$sketch-color: #525252;

.battery {
  position: relative;
  width: 30px;
  height: 22px;

  &::before, &::after {
    @include pseudo;
    position: absolute;
    height: 4px;
    width: 8px;
    top: 0px;
    background-color: $sketch-color;
  }
  &::before {
    left: 3px;
  }
  &::after {
    right: 3px;
  }
}

.box {
  position: absolute;
  left: 1px;
  bottom: 0;
  height: 20px;
  width: 28px;
  border: 4px solid $sketch-color;

  &::before, &::after {
    @include pseudo;
    position: absolute;
    height: 4px;
    width: 4px;
    top: -4px;
    background-color: $sketch-color;
  }
  &::before {
    left: -5px;
  }
  &::after {
    right: -5px;
  }
}

.bolt {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  height: 10px;
  z-index: 1;
}

.charge {
  position: absolute;
  width: 100%;
  bottom: 0;
  left: 0;
  opacity: 0.4;

  &--high {
    background-color: $nxt-color-success;
  }

  &--medium {
    background-color: $nxt-color-warn;
  }

  &--low {
    background-color: $nxt-color-error;
  }
}

@media(min-width: $ipad-vertical) {
  .battery {
    width: 42px;
    height: 30px;

    &::before {
      left: 5px;
    }
    &::after {
      right: 5px;
    }
  }

  .box {
    height: 28px;
    width: 38px;

    &::before {
      left: -6px;
    }
    &::after {
      right: -6px;
    }
  }

  .bolt {
    height: 12px;
  }
}

@media(min-width: $desktop) {
  .battery {
    width: 48px;
    height: 34px;
  }

  .box {
    width: 44px;
    height: 32px;
  }

  .bolt {
    height: 14px;
  }
}
</style>
