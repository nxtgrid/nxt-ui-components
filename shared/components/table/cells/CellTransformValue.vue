<template>
{{ transformedValue }}
</template>

<script>
import { roundToTwoDecimals } from '@nxt/libraries/number-helpers';
import { isNil, isNotNil } from 'ramda';
import { path } from 'ramda';

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

  methods: {
    roundToTwoDecimals(val) {
      return roundToTwoDecimals(val);
    },

    splitEveryFourCharacters(val) {
      // Remove all spaces first to handle both cases
      const cleaned = String(val).replace(/\s/g, '');
      // Split into chunks of 4 characters
      return cleaned.match(/.{1,4}/g)?.join(' ') || '';
    },

    identity(val) {
      return val;
    },
  },

  computed: {
    transformedValue() {
      // We demark the possibility to look in multiple fields
      // by a '|' sign. Following that, we look for values
      // traversing the path which is combined with '.'s.
      // So "directive.kwh|lorawan_directive.kwh" would look
      // for values in both the kwh column in the directives table
      // and the kwh column in the lorawan_directives table.
      // The first non-nil value is used.
      const fields = this.field.split('|');
      const value = fields
        .map(field => path(field.split('.'), this.data))
        .filter(isNotNil)[0]
      ;

      return isNil(value) ? value : this[this.settings.transformer](value);
    },
  },
};
</script>
