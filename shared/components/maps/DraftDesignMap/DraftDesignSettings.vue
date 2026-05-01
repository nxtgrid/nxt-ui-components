<template>
<form @submit.prevent="doRecalculate">
  <div class="nxt-form-column">
    <label for="building_data_source">
      Building data source
    </label>
    <nxt-select
      id="building_data_source"
      v-model="ddStore.settings.building_data_source"
      :options="BUILDING_DATA_SOURCES"
      required
    />
  </div>
  <div class="nxt-form-column mt-1">
    <label for="building_area">Minimum building area (m2)</label>
    <input
      id="building_area"
      type="number"
      class="nxt-input"
      v-model="ddStore.settings.minimum_building_area"
      step="1"
      min="0"
      required
    />
  </div>
  <div class="nxt-form-column mt-1">
    <label for="pole_coverage">Pole coverage radius (m2)</label>
    <input
      id="pole_coverage"
      type="number"
      class="nxt-input"
      v-model="ddStore.settings.pole_coverage_radius"
      step="1"
      min="0"
      required
    />
  </div>
  <div class="draft-form-footer">
    <nxt-button
      size="tiny"
      type="submit"
      :is-loading="ddStore.isLoading"
      :disabled="ddStore.isLoading || !ddStore.outline || !hasChanges"
    >
      Recalculate directly
    </nxt-button>
  </div>
</form>
</template>

<script>
import { ref } from 'vue';
import { watchOnce } from '@vueuse/core';
import { useDraftDesignStore, BUILDING_DATA_SOURCES } from './DraftDesignStore';
import NxtSelect from '@nxt/components/form/NxtSelect.vue';

export default {
  setup() {
    const hasChanges = ref(false);
    const ddStore = useDraftDesignStore();

    const doRecalculate = () => {
      // Drawn features are 'Features', while previously stored features
      // are geometries. So if we have a previously stored feature,
      // we wrap it in a 'Feature'.
      ddStore.outlineDrawing = ddStore.outline.type === 'Feature'
        ? ddStore.outline
        : { type: 'Feature', geometry: ddStore.outline }
      ;
      ddStore.submitOutline();
    };

    watchOnce(ddStore.settings, () => {
      hasChanges.value = true;
    });

    return { hasChanges, ddStore, doRecalculate, BUILDING_DATA_SOURCES };
  },

  components: { NxtSelect },
};
</script>

<style lang="scss">
.draft-form-footer {
  display: flex;
  justify-content: flex-end;
  margin-top: 1rem;
  padding-top: 0.5rem;
  border-top: thin solid $nxt-color-blue-light;
}
</style>
