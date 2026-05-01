<template>
<section class="card">
  <header class="card-header">
    <h2>Full Service Control</h2>
  </header>

  <!--
  <p class="mt-1"><strong>"NOW" in half hours from 00:00 (always rounded up)</strong></p>
  <pre style="margin: 0;">{{ halfHoursNowLocal }}</pre>

  <p class="mt-1"><strong>The current FS rules</strong></p>
  <pre style="margin: 0;">{{ currentRules }}</pre>

  <p class="mt-1"><strong>The slider values</strong></p>
  <pre style="margin: 0;">{{ fsOnOffRelativeToNow }}</pre>
  -->

  <div v-if="fsOnOffRelativeToNow.length" class="match-graph-slider-wrapper pt-1">
    <fs-control-slider
      v-model="fsOnOffRelativeToNow"
      :start-half-hours="halfHoursNowLocal"
      :disabled="isLoading"
    />
  </div>
  <iframe
    v-if="iframeChartUrl"
    :src="iframeChartUrl"
    width="100%"
    height="300"
    frameborder="0"
  ></iframe>
  <div
    v-else
    class="scc scc-simple"
    style="height: 300px"
  ></div>
  <footer class="card-footer">
    <nxt-button
      class="pull-right"
      size="small"
      :disabled="!canUpdate"
      @click="doStoreNewRules"
    >
      Apply new timings
    </nxt-button>
  </footer>
</section>
</template>

<script>
import { computed, reactive, ref, shallowRef } from 'vue';
import dayjs from 'dayjs';
import { stringify } from 'qs';
import { useToast } from 'vue-toastification';
import { baseSupabaseRepo } from '@nxt/libraries/api-connection/repo/baseSupabaseRepo';
import { baseOpsRestRepo } from '@nxt/libraries/api-connection/repo/baseOpsRestRepo';
import { useAccountStore } from '@nxt/libraries/api-connection/store/account';
import { utcTimeToLocalTime, localTimeToUtcTime } from '@nxt/libraries/time-helpers';

import FsControlSlider from './FsControlSlider.vue';

const { VITE_GRAFANA_AUTOPILOT_API_URL } = import.meta.env;

const roundUpToNextHalfHour = dayJsDate => {
  const minutes = dayJsDate.minute();
  const remainder = 30 - (minutes % 30);
  return remainder === 30
    ? dayJsDate.startOf('minute').second(0)
    : dayJsDate.add(remainder, 'minute').startOf('minute').second(0);
};

const hoursMinutesToHalfHourSteps = (hours, minutes) => hours * 2 + (minutes < 15 ? 0 : minutes < 45 ? 1 : 2);
const halfHourStepsToHoursMinutes = halfHourSteps => ({ hour: Math.floor(halfHourSteps / 2), minute: halfHourSteps % 2 ? 30 : 0 });

export default {
  props: {
    gridId: {
      type: [ Number, String ],
      required: true,
    },
    timezone: {
      type: String,
      required: true,
    },
    readOnly: {
      type: Boolean,
      default: false,
    },
  },

  setup(props) {
    const toast = useToast();
    const accountStore = useAccountStore();

    /**
     * Now ;)
    **/

    const from_Dayjs = shallowRef();
    const to_Dayjs = shallowRef();
    const updateDates = () => {
      const _from = roundUpToNextHalfHour(dayjs().tz(props.timezone));
      from_Dayjs.value = _from;
      to_Dayjs.value = _from.add(24, 'hour');
    };
    updateDates();

    // The timings of FS rules are absolute, from 00:00 to 24:00.
    // The predictor works from now, so we get that 'half hour' too, for offsetting.
    const halfHoursNowLocal = computed(() =>
      hoursMinutesToHalfHourSteps(from_Dayjs.value.hour(), from_Dayjs.value.minute()));


    /**
     * FS Rules
    **/

    let _CACHED_RULES;
    const isLoading = ref(true);
    const currentRules = reactive({ on: null, off: null });

    const fsOnOffRelativeToNow = ref([]);

    // In Grafana autopilot, the half hour steps are counted from 'NOW' in current grid time.
    // So we need to convert the absolute steps to relative steps.
    const convertLocalHalfHoursToHalfHoursFromNow = halfHoursLocal =>
      // If a command is still in the future, we need to subtract the current time from it.
      // If a command is in the past, we need to add 48 hours to it and then subtract the current time.
      halfHoursLocal > halfHoursNowLocal.value ? (halfHoursLocal - halfHoursNowLocal.value) : (halfHoursLocal + 48 - halfHoursNowLocal.value);

    const convertHalfHoursFromNowToLocalHalfHours = halfHoursFromNow =>
      halfHoursFromNow > halfHoursNowLocal.value ? (halfHoursFromNow - 48 + halfHoursNowLocal.value) : (halfHoursFromNow + halfHoursNowLocal.value);

    const fetchRules = () => baseSupabaseRepo.client
      .from('directive_batches')
      // We're selecting a couple of properties extra because backend audits expects them
      .select('id, grid_id, fs_command, hour, minute, is_repeating')
      .eq('grid_id', props.gridId)
      .is('is_deleted', false)
      .not('fs_command', 'is', null)
      .is('is_repeating', true)
      .then(baseSupabaseRepo.handleResponse)
      .then(_rules => {
        _CACHED_RULES = _rules;
        const onRule = _rules.find(({ fs_command }) => fs_command === 'ON');
        const offRule = _rules.find(({ fs_command }) => fs_command === 'OFF');
        const on = {
          hourUtc: onRule?.hour ?? 8,
          minuteUtc: onRule?.minute ?? 0,
        };
        const off = {
          hourUtc: offRule?.hour ?? 16,
          minuteUtc: offRule?.minute ?? 0,
        };
        const onLocal = utcTimeToLocalTime( { hour: on.hourUtc, minute: on.minuteUtc }, props.timezone );
        const offLocal = utcTimeToLocalTime( { hour: off.hourUtc, minute: off.minuteUtc }, props.timezone );
        on.hourLocal = onLocal.localHour;
        on.minuteLocal = onLocal.localMinute;
        on.halfHoursLocal = hoursMinutesToHalfHourSteps(onLocal.localHour, onLocal.localMinute);
        on.halfHoursFromNow = convertLocalHalfHoursToHalfHoursFromNow(on.halfHoursLocal);
        off.hourLocal = offLocal.localHour;
        off.minuteLocal = offLocal.localMinute;
        off.halfHoursLocal = hoursMinutesToHalfHourSteps(offLocal.localHour, offLocal.localMinute);
        off.halfHoursFromNow = convertLocalHalfHoursToHalfHoursFromNow(off.halfHoursLocal);

        currentRules.on = on;
        currentRules.off = off;

        fsOnOffRelativeToNow.value = [
          { fs_command: 'ON', halfHoursFromNow: on.halfHoursFromNow },
          { fs_command: 'OFF', halfHoursFromNow: off.halfHoursFromNow },
        ];

        isLoading.value = false;
      })
    ;
    fetchRules();


    /**
     * Interaction
    **/

    const canUpdate = computed(() => {
      if(props.readOnly) return false;
      if (isLoading.value) return false;
      const onValue = fsOnOffRelativeToNow.value[0].halfHoursFromNow;
      const offValue = fsOnOffRelativeToNow.value[1].halfHoursFromNow;
      const hasChanges = onValue !== currentRules.on.halfHoursFromNow || offValue !== currentRules.off.halfHoursFromNow;
      const isNotSame = onValue !== offValue && Math.abs(onValue - offValue) < 48;
      return hasChanges && isNotSame;
    });

    const doStoreNewRules = async () => {
      if(!canUpdate.value) return;
      isLoading.value = true;
      const onLocalHalfHours = convertHalfHoursFromNowToLocalHalfHours(fsOnOffRelativeToNow.value[0].halfHoursFromNow);
      const offLocalHalfHours = convertHalfHoursFromNowToLocalHalfHours(fsOnOffRelativeToNow.value[1].halfHoursFromNow);
      const onLocal = halfHourStepsToHoursMinutes(onLocalHalfHours);
      const offLocal = halfHourStepsToHoursMinutes(offLocalHalfHours);
      const onUtc = localTimeToUtcTime(onLocal, props.timezone);
      const offUtc = localTimeToUtcTime(offLocal, props.timezone);

      const rulesToDelete = _CACHED_RULES.map(rule => ({ ...rule, is_deleted: true }));
      const rulesToAdd = [
        { fs_command: 'ON', hour: onUtc.utcHour, minute: onUtc.utcMinute, is_repeating: true, grid_id: props.gridId },
        { fs_command: 'OFF', hour: offUtc.utcHour, minute: offUtc.utcMinute, is_repeating: true, grid_id: props.gridId },
      ];

      baseOpsRestRepo
        .saveTaskBatches([ ...rulesToDelete, ...rulesToAdd ])
        .then(() => {
          toast.success('New schedule saved');
          fetchRules();
        })
        .catch(err => {
          const title = 'Error saving new schedule';
          console.error(title, err);
          toast.error(`${ title }: ${ err.message }`);
        })
        .finally(() => {
          isLoading.value = false;
        })
      ;
    };


    /**
     * Chart
    **/

    accountStore.checkGrafanaToken();

    const iframeChartUrl = computed(() => {
      if(!accountStore.grafanaToken) return null;
      if(!fsOnOffRelativeToNow.value.length) return null;

      const params = {
        theme: 'light',
        'auth_token': accountStore.grafanaToken,
        panelId: 48,
        from: from_Dayjs.value.toISOString(),
        to: to_Dayjs.value.toISOString(),
        timezone: props.timezone,
        'var-grid_id': props.gridId,
        'var-autopilot_fs_slider_start_idx': fsOnOffRelativeToNow.value[0].halfHoursFromNow,
        'var-autopilot_fs_slider_stop_idx': fsOnOffRelativeToNow.value[1].halfHoursFromNow,
        // 'var-autopilot_fs_load_forecast_src': 'inverter_load_probable',
        // 'var-autopilot_hps_load_forecast_src': 'inverter_load_probable',
        // 'var-autopilot_hps_slider_start_idx': 2,
        // 'var-autopilot_hps_slider_stop_idx': 8,
        // 'var-fsHps': 'FS',
      };

      return VITE_GRAFANA_AUTOPILOT_API_URL + '?' + stringify(params);
    });

    return { halfHoursNowLocal, fsOnOffRelativeToNow, currentRules, isLoading, canUpdate, doStoreNewRules, iframeChartUrl };
  },

  components: { FsControlSlider },
};
</script>

<style lang="scss">
.match-graph-slider-wrapper {
  display: flex;

  .dual-slider {
   flex-grow: 1;
   z-index: 1;
  }

  &::before,
  &::after {
    content: '';
    display: block;
    height: 18px;
    background-color: $nxt-color-blue-light;
    z-index: 0;
  }

  &::before {
    width: 54px;
    border-top-left-radius: 4px;
    border-bottom-left-radius: 4px;
    box-shadow: 8px 0 $nxt-color-blue-light;
  }
  &::after {
    width: 49px;
    border-top-right-radius: 4px;
    border-bottom-right-radius: 4px;
    box-shadow: -8px 0 $nxt-color-blue-light;
  }
}

.match-graph-slider-inner {
  flex-grow: 1;
  z-index: 1;
}
</style>
