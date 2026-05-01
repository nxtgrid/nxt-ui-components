<template>
<div class="metering-hw-status">
  <span
    class="metering-hw-status__icon"
    :class="`metering-hw-status--${ displayStatus.color }`"
  >
    <mdi-icon :icon="displayStatus.icon"/>
  </span>
  <span>
    {{ displayStatus.text }}
  </span>
</div>
</template>

<script>
import { mdiAlertOutline, mdiCheckAll, mdiClockOutline, mdiCloseThick } from '@mdi/js';
import { ISSUES_MAP } from '@nxt/libraries/format-maps';

export default {
  props: {
    data: {
      type: Object,
      required: true,
    },
    field: {
      type: String,
      required: true,
    },
    settings: {
      type: Object,
      required: true,
    },
  },

  computed: {
    isGateway() {
      return this.settings.hardwareType === 'Gateway';
    },

    isUninstall() {
      return this.data.last_install_session?.import?.operation === 'REMOVE';
    },

    displayStatus() {
      if(this.data.install_status === 'SUCCESSFUL') {
        if(this.issue) return {
          text: this.issue,
          color: 'orange',
          icon: mdiAlertOutline,
        };

        return {
          text: 'All good',
          color: 'green',
          icon: mdiCheckAll,
        };
      }
      if(this.data.install_status === 'FAILED') return {
        text: `${ this.isUninstall ? 'Unin' : 'In' }stall failed`,
        color: 'red',
        icon: mdiCloseThick,
      };
      if(this.data.install_status === null) return {
        text: 'Install status unknown',
        color: 'orange',
        icon: mdiAlertOutline,
      };
      return {
        text: this.data.install_status === 'PENDING' ? 'Waiting...' : `${ this.isUninstall ? 'Unin' : 'In' }stalling...`,
        color: 'blue',
        icon: mdiClockOutline,
      };
    },

    issue() {
      if(this.data.install_status !== 'SUCCESSFUL') return null;
      if(this.isGateway && !this.data.is_online) return 'Gateway is offline';
      if(this.data.open_issue)
        return ISSUES_MAP[this.data.open_issue]?.short || this.data.open_issue;
      return null;
    },
  },
};
</script>

<style lang="scss">
.metering-hw-status {
  display: flex;
  column-gap: 4px;
  align-items: center;

  &__icon {
    position: relative;
    width: 24px;
    height: 16px;
    flex-shrink: 0;

    svg {
      position: absolute;
      top: -6px;
    }
  }

  &--green {
    color: $nxt-color-success;
  }

  &--orange {
    color: $nxt-color-warn;
  }

  &--red {
    color: $nxt-color-error;
  }

  &--blue {
    color: $nxt-color-blue-highlight;
  }
}
</style>
