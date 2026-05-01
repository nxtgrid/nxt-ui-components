<template>
<div style="position: relative;">
  <div
    class="realtime-status"
    :class="{ 'realtime-status--error': overallConnectionStatus === 'LOST' }"
    @dblclick.stop.prevent="togglePopover"
  >
    <div>
      <div
        class="realtime-status__dots"
        :class="{
          'status-rotation-continuous': ['LIVE', 'PENDING'].includes(overallConnectionStatus),
          'status-rotation-stuck': overallConnectionStatus === 'LOST',
        }"
      >
        <span class="realtime-status__dot realtime-status__dot-1"></span>
        <span class="realtime-status__dot realtime-status__dot-2"></span>
        <span class="realtime-status__dot realtime-status__dot-3"></span>
        <span class="realtime-status__dot realtime-status__dot-4"></span>
      </div>
    </div>
    <p class="realtime-status__text">
      {{ overallConnectionStatus === 'LOST' ? 'LIVE' : overallConnectionStatus }}
    </p>
  </div>
  <div v-if="showPopover" class="realtime-info">
    <table class="realtime-info__table">
      <tr v-for="(val, key) in channelStatuses" :key="key">
        <td>{{ key }}</td><td>{{ val }}</td>
      </tr>
    </table>
  </div>
</div>
</template>

<script>
import { ref } from 'vue';
import { useRealtime } from '../composables/useRealtime';

export default {
  setup() {
    const showPopover = ref(false);
    const { channelStatuses, overallConnectionStatus, updateChannelStatuses } = useRealtime();

    const togglePopover = () => {
      if(!showPopover.value) updateChannelStatuses();
      showPopover.value = !showPopover.value;
    };

    return { showPopover, togglePopover, channelStatuses, overallConnectionStatus };
  },
};
</script>

<style lang="scss">
.realtime-info {
  position: absolute;
  background: white;
  padding: 1rem 16px;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  margin-top: 8px;
  border-radius: 2px;
  box-shadow: $sh3;

  &__table {
    font-size: 14px;
    border-collapse: collapse;

    td {
      padding: 0.25rem 4px;
      border: thin solid $nxt-color-blue-light;
    }
  }
}
.realtime-status {
  position: relative;
  width: 36px;
  height: 36px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  user-select: none;

  &__text {
    position: relative;
    font-family: 'Arial Black', 'Arial Bold', Gadget, sans-serif;
    font-weight: 700;
    color: $nxt-color-font-white;
    font-size: 7px;
    line-height: 8px;
    margin-top: 5px;
    margin-bottom: -8px;

    .realtime-status--error & {
      &::before {
        @include pseudo;
        top: 50%;
        left: -5%;
        width: 110%;
        height: 1px;
        background-color: $nxt-color-error;
      }
    }
  }

  &__dots {
    position: relative;
    width: 14px;
    height: 14px;
    transform: rotate(45deg);

    animation-timing-function: linear;
    animation-iteration-count: infinite;
  }

  &__dot {
    position: absolute;
    width: 5px;
    height: 5px;
    border-radius: 3px;
    background-color: $nxt-color-white;

    &-1 {
      top: 0;
      left: 0;
    }

    &-2 {
      top: 0;
      right: 0;
      opacity: 0.8;
    }

    &-3 {
      bottom: 0;
      right: 0;
      opacity: 0.6;
    }

    &-4 {
      bottom: 0;
      left: 0;
      opacity: 0.4;
    }
  }
}

.status-rotation-continuous {
  animation-name: animate-status-rotate;
  animation-duration: 1500ms;
}

.status-rotation-stuck {
  animation-name: animate-status-rotate-stuck;
  animation-duration: 2000ms;
}

@keyframes animate-status-rotate {
  from {
    transform: rotate(45deg);
  }
  to {
    transform: rotate(405deg);
  }
}

@keyframes animate-status-rotate-stuck {
  0% {
    transform: rotate(45deg);
  }
  3% {
    transform: rotate(90deg);
  }
  9% {
    transform: rotate(15deg);
  }
  12% {
    transform: rotate(45deg);
  }
}
</style>
