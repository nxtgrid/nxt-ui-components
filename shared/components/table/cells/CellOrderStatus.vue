<template>
{{ formattedText }}
</template>

<script>
import { ORDER_STATUS_MAP } from '@nxt/libraries/format-maps';
import { normalizeDirectiveStatus } from '@nxt/libraries/format-helpers';

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
    formattedText() {
      const orderStatus = this.data.order_status;
      if(orderStatus === 'COMPLETED' && this.data.meta_order_type === 'ENERGY_TOPUP') {
        if(!this.data.directive && !this.data.lorawan_directive && !this.data.meter_interaction) return 'Awaiting token';
        const interactionStatus = this.data.meter_interaction?.meter_interaction_status ?? this.data.directive?.directive_status ?? this.data.lorawan_directive?.directive_status;
        const normalizedStatus = normalizeDirectiveStatus(interactionStatus);
        if(normalizedStatus === 'FAILED') return 'Failed to deliver token';
        if(normalizedStatus === 'SUCCESSFUL') return 'Completed';
        return 'Pending';
      }
      return ORDER_STATUS_MAP[orderStatus] ?? 'Unknown';
    },
  },
};
</script>
