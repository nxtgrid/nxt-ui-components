import { REALTIME_SUBSCRIBE_STATES, REALTIME_CHANNEL_STATES } from '@supabase/realtime-js';
import { computed, readonly, ref } from 'vue';
import { _client } from '../repo/baseSupabaseRepo';

const INACTIVE_TAB_TIMEOUT_MINUTES = 10;

const _channelFactories = new Map();
const _channelStatuses = ref({});
const _connectionStatus = computed(() => {
  const values = Object.values(_channelStatuses.value);
  if(values.every(val => val === REALTIME_CHANNEL_STATES.joined)) return 'LIVE';
  if(values.every(val => val === REALTIME_CHANNEL_STATES.errored)) return 'LOST';
  if(values.every(val => val === REALTIME_CHANNEL_STATES.closed)) return 'CLOSED';
  return 'PENDING';
});

// @TODO :: Handle CHANNEL_ERROR
// @TODO :: Check token expired error

/**
 * Connectivity and GUI helpers
**/

const checkTokenSituation = async () => {
  console.info('[REALTIME] CHECKING TOKEN');
  // @TODO :: If we log out, we don't have a session, and this gets called when logging out
  // because the global-presence channel disconnects.
  const { data, error } = await _client.auth.getSession();
  if (error) {
    console.error('[REALTIME] ERROR CHECKING TOKEN', error);
    return;
  }
  if (!data.session) {
    console.warn('[REALTIME] NO SESSION', data);
    return;
  }
  if (_client.realtime.accessTokenValue !== data.session.access_token) {
    console.error('[REALTIME] TOKENS ARE DIFFERENT', _client.realtime.accessTokenValue, data.session.access_token);
  }
};

const refreshRealtimeAuthIfNeeded = async () => {
  const { data, error } = await _client.auth.getSession();
  if (error) {
    console.error('[REALTIME] ERROR CHECKING TOKEN', error);
    return { success: false };
  }
  if (!data.session) {
    console.error('[REALTIME] NO SESSION', data);
    return { success: false };
  }
  if (_client.realtime.accessTokenValue !== data.session.access_token) {
    console.info('[REALTIME] TOKENS ARE DIFFERENT, UPDATING REALTIME AUTH');
    try {
      await _client.realtime.setAuth(data.session.access_token);
    }
    catch(err) {
      console.error('[REALTIME] ERROR SETTING AUTH', err);
      return { success: false };
    }
  }
  return { success: true };
};

const updateChannelStatuses = () => {
  const _statuses = {};
  const channels = _client.getChannels();
  console.info('[REALTIME] NUM CHANNELS :: NUM FACTORIES', channels.length, '|', _channelFactories.size);
  channels.forEach(({ subTopic, state }) => _statuses[subTopic] = state);
  _channelStatuses.value = _statuses;
};


/**
 * Channel creation and state management
**/

const handleSubscriptionStateEvent = (topic, status, err) => {
  checkTokenSituation();

  switch (status) {
    case REALTIME_SUBSCRIBE_STATES.SUBSCRIBED: {
      console.info('[REALTIME] SUBSCRIPTION EVENT: SUCCESSFUL;', topic);
      break;
    }
    case REALTIME_SUBSCRIBE_STATES.CLOSED: {
      console.info('[REALTIME] SUBSCRIPTION EVENT: CLOSED;', topic);
      break;
    }
    case REALTIME_SUBSCRIBE_STATES.TIMED_OUT: {
      console.info('[REALTIME] SUBSCRIPTION EVENT: TIMED OUT;', topic);
      break;
    }
    case REALTIME_SUBSCRIBE_STATES.CHANNEL_ERROR: {
      console.error('[REALTIME] SUBSCRIPTION EVENT: ERROR;', topic);
      if(err) {
        console.error(err);
        console.error('message', err.message);
        console.error('name', err.name);
        console.error('cause', err.cause);
        console.error('type', typeof err);
      }
      if(document.hidden) {
        console.info('[REALTIME] Got an eror while tab was hidden, killing all channels so they can be revived when tab becomes active');
        killAllChannels();
      }
      else {
        console.warn('[REALTIME] Got an eror while tab was active, we should kill and revive channels');
      }
      break;
    }
  }
};

const addChannel = (channelFactoryFn, onSubscribeEventFn) => {
  const channel = channelFactoryFn(_client);
  if(!channel) console.warn('[REALTIME] @DEV: You forgot to return the channel in the channel factory function');
  const { topic } = channel;
  _channelFactories.set(topic, { factory: channelFactoryFn, subscribeCb: onSubscribeEventFn });

  // TEMPORARY :: Add phx reply listener for extra error check
  channel.on('phx_reply', {}, payload => {
    if (payload.status === 'error')
      console.error('[REALTIME] PHX_REPLY ERROR (original)', topic, payload);
  });

  channel.subscribe((status, err) => {
    updateChannelStatuses();
    onSubscribeEventFn?.(status, err);
    handleSubscriptionStateEvent(channel.topic, status, err);
  });

  return () => {
    console.info('[REALTIME HANDLER] UNSUBSCRIBING:', channel.topic);
    _client.getChannels().find(ch => ch.topic === topic)?.unsubscribe();
    _channelFactories.delete(channel.topic);
  };
};


/**
 * Killing and resubscribing based on browser (in)activity
**/

let inactiveTabTimer;
let allChannelsAreKilledDead = false;

const killAllChannels = () => {
  _client.removeAllChannels();
  allChannelsAreKilledDead = true;
};

const reviveAllChannels = async () => {
  console.info('All channels were killed, reviving');

  const { success } = await refreshRealtimeAuthIfNeeded();
  if(!success) return;

  _channelFactories.forEach(({ factory, subscribeCb }) => {
    const channel = factory(_client);
    // TEMPORARY :: Add phx reply listener for extra error check
    channel.on('phx_reply', {}, payload => {
      if (payload.status === 'error')
        console.error('[REALTIME] PHX_REPLY ERROR (revived)', channel.topic, payload);
      else
        console.info('[REALTIME] PHX_REPLY (revived)', channel.topic, payload);
    });

    channel.subscribe((status, err) => {
      updateChannelStatuses();
      subscribeCb?.(status, err);
      handleSubscriptionStateEvent(channel.topic, status, err);
    });
  });
  allChannelsAreKilledDead = false;
};

document.addEventListener('visibilitychange', () => {
  if(document.hidden) {
    console.info('[REALTIME] DOCUMENT HIDDEN');
    if(!inactiveTabTimer && !allChannelsAreKilledDead) {
      inactiveTabTimer = setTimeout(() => {
        console.warn(`[REALTIME] Tab inactive for ${ INACTIVE_TAB_TIMEOUT_MINUTES } minutes, disconnecting realtime`);
        killAllChannels();
        inactiveTabTimer = undefined;
      },
      INACTIVE_TAB_TIMEOUT_MINUTES * 60000,
      // 1000,
      );
    }
  }
  else {
    console.info('[REALTIME] DOCUMENT UNHIDDEN');
    if(inactiveTabTimer) {
      clearTimeout(inactiveTabTimer);
      inactiveTabTimer = undefined;
      return;
    }
    if(allChannelsAreKilledDead) reviveAllChannels();
  }
});


/**
 * Exposed interface
**/

export const useRealtime = () => {
  return {
    channelStatuses: readonly(_channelStatuses),
    overallConnectionStatus: _connectionStatus,
    addChannel,
    updateChannelStatuses,
  };
};
