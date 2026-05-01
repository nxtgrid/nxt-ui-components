<template>
<section class="card">
  <header class="card-header">
    <h2 class="h2 h2--flexed">
      Meter {{ meter.external_reference }}
      <click-to-copy
        :source="meter.external_reference"
        :has-border="false"
        feedback="Copied meter number!"
      />
      <span v-if="isDualMeterGrid" class="meter-phase">
        {{ meter.meter_type }}
        <template v-if="meter.meter_type === 'FS'">
          {{ METER_PHASE_MAP[meter.meter_phase] }}
        </template>
      </span>
      <span v-else-if="meter.meter_phase === 'THREE_PHASE'" class="meter-phase">
        Three-phase
      </span>
      <span v-if="meter.pole" class="text-small text-regular">
        (Pole {{ meter.pole.external_reference }})
      </span>
    </h2>
  </header>
  <ul class="mini-cards">
    <li>
      <div class="mini-card">
        <dl class="mini-card__list">
          <dt>Status</dt>
          <dd class="text-fat">
            <template v-if="installingStatus">
              {{ installingStatus }}
            </template>
            <template v-else>
              {{ meter.is_on ? 'ON' : 'OFF' }}
              <span
                style="font-size: 0.875rem;"
                v-if="meter.power_limit === 0"
              >
                (No power limit)
              </span>
              <template v-else>
                ({{ meter.power_limit + 'W' }})
              </template>
            </template>
          </dd>
        </dl>
        <p class="mini-card__footer">
          {{ installingStatus ? 'Provisioning' : `Updated ${ timeAgo(meter.is_on_updated_at) }` }}
        </p>
      </div>
    </li>
    <template v-if="!installingStatus">
      <li>
        <div class="mini-card">
          <dl class="mini-card__list">
            <dt>Balance</dt>
            <dd class="text-fat">₦ {{ meter.balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}</dd>
          </dl>
          <p class="mini-card__footer">
            Checked {{ timeAgo(meter.balance_updated_at) }}
          </p>
        </div>
      </li>
      <li>
        <div class="mini-card">
          <dl class="mini-card__list">
            <dt>Credit</dt>
            <dd class="text-fat">{{ meter.kwh_credit_available.toLocaleString(undefined, { maximumFractionDigits: 2 }) }}kWh</dd>
          </dl>
          <p class="mini-card__footer">
            Checked {{ timeAgo(meter.kwh_credit_available_updated_at) }}
          </p>
        </div>
      </li>
      <li v-if="issue">
        <div class="mini-card mini-card--warn">
          <dl class="mini-card__list">
            <dt>
              Issue
            </dt>
            <dd class="text-bold">{{ issue.text }}</dd>
          </dl>
          <p class="mini-card__footer">
            Created {{ timeAgo(issue.started_at) }}
          </p>
        </div>
      </li>
    </template>
  </ul>
  <!-- For operators -->
  <footer v-if="showActions" class="card-footer">
    <nxt-button
      size="small"
      icon-name="mdiCurrencyUsd"
      @click="openTopUpModal"
    >
      Top-up
    </nxt-button>
    <template v-if="!installingStatus">
      <template v-if="meter.is_on">
        <nxt-button
          size="small"
          icon-name="mdiPower"
          @click="doToggleRelay('OFF')"
          :disabled="commandSent"
        >
          Turn off
        </nxt-button>
      </template>
      <template v-else>
        <nxt-button
          v-if="issue !== 'TAMPER'"
          size="small"
          icon-name="mdiPower"
          @click="doToggleRelay('ON')"
          :disabled="commandSent"
        >
          Turn on
        </nxt-button>
        <nxt-button
          size="small"
          icon-name="mdiShieldLockOpenOutline"
          @click="doClearTamper"
          :disabled="commandSent"
        >
          Clear tamper
        </nxt-button>
      </template>
    </template>
  </footer>
  <!-- For end customers -->
  <footer v-else-if="userIsEndCustomer" class="card-footer">
    <nxt-button
      size="small"
      icon-name="mdiCurrencyUsd"
      @click="openTopUpModal"
    >
      Top-up
    </nxt-button>
  </footer>
</section>
</template>

<script>
import { computed, ref } from 'vue';
import { useToast } from 'vue-toastification';
import { useAccountStore } from '@nxt/libraries/api-connection/store/account';
import { timeAgo } from '@nxt/libraries/date-helpers';
import { compoundInstallStatusPretty } from '@nxt/libraries/metering-helpers';
import { METER_PHASE_MAP, ISSUES_MAP } from '@nxt/libraries/format-maps';

import { useNxtModal } from '@nxt/components/NxtModal';
import { TopUpModal } from '@nxt/components/modals';
import { ClickToCopy } from '@nxt/components';
import { restRepo } from '@/repo/restRepo';

export default {
  props: {
    meter: {
      type: Object,
      required: true,
    },
    isDualMeterGrid: {
      type: Boolean,
      default: false,
    },
    showActions: {
      type: Boolean,
      default: false,
    },
    userIsEndCustomer: {
      type: Boolean,
      default: false,
    },
  },

  setup(props) {
    const nxtModal = useNxtModal();
    const toast = useToast();

    const installingStatus = computed(() => compoundInstallStatusPretty(
      props.meter.last_install_session?.import.status,
      props.meter.last_install_session?.commissioning?.status,
    ));

    const issue = computed(() => {
      if(props.meter?.issue?.issue_status !== 'OPEN') return null;
      const { issue_type, started_at } = props.meter.issue;
      if(![ 'NO_CONSUMPTION', 'NO_CREDIT' ].includes(issue_type)) return null;
      const text = ISSUES_MAP[issue_type]?.short || issue_type;
      return { text, started_at };
    });

    const commandSent = ref(false);
    const onCommandSent = message => () => {
      commandSent.value = true;
      setTimeout(() => {
        commandSent.value = false;
      }, 60000);
      toast.success(message);
    };

    const doToggleRelay = onOrOff => {
      if(![ 'ON', 'OFF' ].includes(onOrOff)) return;
      commandSent.value = true;
      return restRepo
        .createMeterInteraction({
          meter_id: props.meter.id,
          meter_interaction_type: `TURN_${ onOrOff }`,
        })
        .then(onCommandSent(`Sent turn ${ onOrOff } command, please be patient`))
        .catch(err => {
          console.error(err);
          commandSent.value = false;
        })
      ;
    };

    const doClearTamper = () => {
      commandSent.value = true;
      return restRepo
        .createMeterInteraction({
          meter_id: props.meter.id,
          meter_interaction_type: 'CLEAR_TAMPER',
        })
        .then(onCommandSent('Sent clear tamper command, please be patient'))
        .catch(err => {
          console.error(err);
          commandSent.value = false;
        })
      ;
    };

    const openTopUpModal = () => {
      const config = {
        props: {
          header: `Top up Meter ${ props.meter.external_reference }`,
        },
        data: {
          receiver: {
            type: 'meter',
            name: `Meter ${ props.meter.external_reference }`,
            walletId: props.meter.wallet.id,
          },
        },
      };

      if(props.userIsEndCustomer) {
        const accountStore = useAccountStore();
        config.props.withFlutterwave = true;
        config.data.receiver.email = accountStore.myProfile.email ?? accountStore.myProfile.organization.email;
        config.data.receiver.phone = accountStore.myProfile.phone;
        config.data.receiver.organizationName = accountStore.myProfile.organization.name;
      }

      nxtModal.open(TopUpModal, config);
    };

    return { installingStatus, issue, commandSent, doToggleRelay, doClearTamper, openTopUpModal, timeAgo, METER_PHASE_MAP };
  },

  components: { ClickToCopy },
};
</script>

<style lang="scss">
.meter-phase {
  color: $nxt-color-blue;
  padding: 0.25rem 12px;
  background-color: $nxt-color-background-light;
  border-radius: 1.25rem;
}
</style>
