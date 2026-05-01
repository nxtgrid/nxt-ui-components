<template>
{{ formattedText }}
</template>

<script>
import { path } from 'ramda';
import { METER_INTERACTION_STATUS_MAP, METER_INTERACTIONS_MAP, ORDER_STATUS_MAP } from '@nxt/libraries/format-maps';
import {
  METER_TYPE_MAP,
  ISSUES_MAP,
  ISSUE_STATUS_MAP,
  ROLE_MAP,
  PAYMENT_CHANNEL_MAP,
  PAYMENT_METHOD_MAP,
} from '@nxt/libraries/format-maps';
import { last } from 'ramda';
import { split } from 'ramda';

const format = (rawValue, path) => {
  const field = last(split('.', path));
  switch(field) {
    case 'meter_type':
      return METER_TYPE_MAP[rawValue] ?? 'Unknown Meter Type';

    case 'meter_interaction_type':
    case 'task_type':
      return METER_INTERACTIONS_MAP[rawValue]?.title;

    case 'meter_interaction_status':
      return METER_INTERACTION_STATUS_MAP[rawValue] ?? 'Unknown';

    case 'issue_type':
      return ISSUES_MAP[rawValue]?.short ?? rawValue;
    case 'issue_status':
      return ISSUE_STATUS_MAP[rawValue] ?? rawValue;

    case 'order_status':
      return ORDER_STATUS_MAP[rawValue] ?? 'Pending';
    case 'payment_channel':
      return PAYMENT_CHANNEL_MAP[rawValue] ?? rawValue;
    case 'payment_method':
      return PAYMENT_METHOD_MAP[rawValue] ?? rawValue;

    case 'member_type':
      return ROLE_MAP[rawValue]?.short ?? rawValue;

    case 'lives_primarily_in_the_community':
      return rawValue ? 'No' : 'Yes';

    case 'fs_command':
      return rawValue === 'ON' ? 'Turn on' : 'Turn off';
  }
};

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
      const rawValue = path(this.field.split('.'), this.data);
      const formattedValue = format(rawValue, this.field);

      if(
        this.field === 'payment_channel' &&
        this.data.payment_method &&
        this.data.payment_method !== 'USSD'
      ) {
        return formattedValue + ` (${ format(this.data.payment_method, 'payment_method') })`;
      }

      return formattedValue ?? rawValue;
    },
  },
};
</script>
