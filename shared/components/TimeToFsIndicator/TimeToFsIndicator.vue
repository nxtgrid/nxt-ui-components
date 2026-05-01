<template>
<div
  v-if="isLoadingRules"
  class="pill scc scc-simple"
  style="width: 168px"
></div>
<div class="pill" v-else-if="rulesData">
  <dt>
    <mdi-icon
      :icon="mdiClockOutline"
      :scale="20"
      style="margin-right: 4px;"
    />
    <span>
      FS
      <span
        class="text-bold fs-indicator-text"
        :class="`text-${ rulesData.upcomingCommand === 'ON' ? 'success' : 'error' }`"
        style="text-transform: lowercase;"
      >
        {{ rulesData.upcomingCommand }}
      </span> in
    </span>
  </dt>
  <dd style="margin-left: 0;">&nbsp;{{ rulesData.waitHours }}h{{ rulesData.waitMinutes }}m</dd>
</div>
</template>

<script>
import dayjs from 'dayjs';
import { mdiClockOutline } from '@mdi/js';
import { sort, ascend, prop, partition } from 'ramda';
import { computed, onBeforeUnmount, ref } from 'vue';
import { baseSupabaseRepo } from '@nxt/libraries/api-connection/repo/baseSupabaseRepo';
import { forceLeadingZero } from '@nxt/libraries/time-helpers';
import { useGlobalStore } from '@nxt/nxt-vue';

export default {
  props: {
    gridId: {
      type: [ Number, String ],
      required: true,
    },
  },

  setup(props) {
    const globalStore = useGlobalStore();
    const isLoadingRules = ref(true);
    const fsRules = ref([]);
    const currentTimeMinutes = ref(0);

    let interval;
    const setCurrentTime = () => {
      const dateTime = dayjs().tz(globalStore.timezone);
      currentTimeMinutes.value = dateTime.hour() * 60 + dateTime.minute();
    };

    setCurrentTime();
    interval = setInterval(setCurrentTime, 1000);

    onBeforeUnmount(() => {
      clearInterval(interval);
    });

    const MINUTES_IN_A_DAY = 1440;

    const rulesData = computed(() => {
      if(!fsRules.value.length) return null;
      const sortedRules = sort(ascend(prop('minutes')), fsRules.value);
      const [ upcomingRules, passedRules  ] = partition(({ minutes }) => minutes > currentTimeMinutes.value, sortedRules);
      const upcomingRule = upcomingRules[0] ?? passedRules[0];
      const minutesTillUpcoming = upcomingRule.minutes > currentTimeMinutes.value
        ? upcomingRule.minutes - currentTimeMinutes.value
        : MINUTES_IN_A_DAY - currentTimeMinutes.value + upcomingRule.minutes
      ;

      const upcomingCommand = upcomingRule.fs_command;
      const waitMinutes = minutesTillUpcoming % 60;
      const waitHours = (minutesTillUpcoming - waitMinutes) / 60;
      return {
        upcomingCommand,
        waitMinutes: forceLeadingZero(waitMinutes),
        waitHours: forceLeadingZero(waitHours),
      };
    });

    const fetchFsData = () => baseSupabaseRepo.client
      .from('directive_batches')
      .select('fs_command, hour, minute')
      .match({ grid_id: props.gridId, is_deleted: false })
      .not('fs_command', 'is', null)
      .then(baseSupabaseRepo.handleResponse)
      .then(batches => {
        fsRules.value = batches.map(({ fs_command, hour, minute }) => {
          // We need to convert time scheduled in UTC to timezone
          const localTime = dayjs.utc().hour(hour).minute(minute).tz(globalStore.timezone);
          return {
            fs_command, /* hour, minute, */
            minutes: localTime.hour() * 60 + localTime.minute(),
          };
        });
      })
      .finally(() => { isLoadingRules.value = false; })
    ;

    fetchFsData();

    return { mdiClockOutline, fsRules, rulesData, isLoadingRules };
  },
};
</script>

<style lang="scss">
.fs-indicator-text {
  &.text-success {
    text-shadow: 0 0 2px rgba($nxt-color-success, 0.5);
  }
  &.text-error {
    text-shadow: 0 0 2px rgba($nxt-color-error, 0.5);
  }
}
</style>
