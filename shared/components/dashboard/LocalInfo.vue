<template>
<div class="local-info">
  <p class="local-info__inner">
    <span class="local-info__name">{{ name }}</span>
    <span
      v-if="timeInTimezone"
      class="local-info__time"
    ><span class="local-info__time__dash">- </span>{{ timeInTimezone }}</span>
  </p>
</div>
</template>

<script>
export default {
  props: {
    name: {
      type: String,
      required: true,
    },
    timezone: {
      type: String,
    },
  },

  data: () => ({
    timeInTimezone: null,
  }),

  methods: {
    setFormattedTime() {
      this.timeInTimezone = new Date().toLocaleString(undefined, {
        timeZone: this.timezone,
        hour: '2-digit',
        minute: '2-digit',
      });
    },
  },

  created() {
    if(!this.timezone) return;
    this.setFormattedTime();
    this.interval = setInterval(this.setFormattedTime, 1000);
  },

  beforeUnmount() {
    clearInterval(this.interval);
  },
};
</script>

<style lang="scss">
.local-info {
  color: $nxt-color-font-white;
  font-weight: 700;
  padding: 0 20px;

  &__inner {
    display: flex;
    padding-block: 1rem;
    line-height: 1;
    border-top: thin solid rgba(#fff, 0.2);
    border-bottom: thin solid rgba(#fff, 0.2);
  }

  &__skeleton {
    margin-inline: 20px;
    height: calc(3.125rem);
  }

  &__name {
    @include clamp(1);
    overflow: hidden;
    margin-right: 8px;
  }

  &__time {
    transition: 400ms ease-out;
    flex-shrink: 0;
    opacity: 0.5;
  }

  .dashboard-menu--minimized & {
    &__name {
      margin-right: 0;
    }

    &__time {
      margin-left: 4px;
      margin-right: 16px;

      &__dash{
        display: none;
      }
    }
  }
}
</style>
