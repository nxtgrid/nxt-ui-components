<template>
{{ hasNeverConsumed ? 'Never' : '' }}
</template>

<script>
import dayjs from 'dayjs';

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
    hasNeverConsumed() {
      const _last_consumption_date = this.data.meter.last_non_zero_consumption_at;
      if(!_last_consumption_date) return true;

      const _commissioning_date = this.data.meter.last_install_session.commissioning.created_at;
      if(!_commissioning_date) return false;

      const last_consumption_date = dayjs(_last_consumption_date);
      const commissioning_date = dayjs(_commissioning_date).add(1, 'day');

      const neverConsumed = last_consumption_date.isBefore(commissioning_date);
      if(neverConsumed) {
        console.info(`Meter ${ this.data.meter.external_reference } last consumption date: `, _last_consumption_date);
        console.info(`Meter ${ this.data.meter.external_reference } commissioning date: `, _commissioning_date);
      }
      return neverConsumed;
    },
  },
};
</script>
