<template>
<div class="nxt-modal-footer">
  <nxt-button
    type="button"
    size="small"
    @click="modal.close()"
    :disabled="isDisabled"
  >
    Cancel
  </nxt-button>
  <nxt-button
    type="submit"
    variant="primary"
    size="small"
    :disabled="isDisabled"
  >
    {{ saveButtonText }}
  </nxt-button>
</div>
</template>

<script>
import { useNxtModal } from './';

export default {
  props: {
    isDisabled: {
      type: Boolean,
      default: false,
    },
    saveButtonText: {
      type: String,
      default: 'Save',
    },
  },

  setup() {
    const modal = useNxtModal();
    return { modal };
  },
};
</script>
