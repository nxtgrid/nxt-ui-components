import { readonly, ref  } from 'vue';
import { compose, last, map, values } from 'ramda';
import { watchOnce } from '@vueuse/core';
import { useAccountStore } from '@nxt/libraries/api-connection/store/account';
import { useRealtime } from '@nxt/libraries/api-connection/composables/useRealtime';

let _channel;

/**
 * Fetching state of all online users
**/

const onlineUsers = ref([]);
let activelyStoreState = false;

const parseState = compose(
  map(last),
  values,
);

const fetchState = () => {
  const state = _channel.presenceState();
  onlineUsers.value = parseState(state);
};

const addStateListener = () => {
  fetchState();
  _channel.on('presence', { event: 'sync' }, fetchState);
};

const subscribeToState = () => {
  activelyStoreState = true;
  addStateListener();
};

const unsubscribeFromState = () => {
  activelyStoreState = false;
  onlineUsers.value = [];
};


/**
 * Initialize the global presence channel that every active user gets subscribed to
**/

const me = ref();

// Start tracking presence user's presence when channel is opened
const onSubscribeEvent = status => {
  if(status !== 'SUBSCRIBED') return;
  _channel.track(me.value);
};

const initFor = async user => {
  me.value = {
    id: user.id,
    username: user.user_metadata.full_name,
    picture: user.user_metadata.avatar_url,
    browsingFrom: window.location.hostname,
  };

  const channelUnsubscribe = useRealtime().addChannel(sbClient => {
    _channel = sbClient.channel('global_presence', {
      config: { presence: { key: me.value.id } },
    });

    if(activelyStoreState) addStateListener();

    return _channel;
  }, onSubscribeEvent);

  // Completely destroy and clean up everything when user logs out
  watchOnce(() => useAccountStore().isLoggedIn, val => {
    console.info('Destroying presence because login changed to:', val);
    _channel.untrack();
    channelUnsubscribe();
    _channel = undefined;
    me.value = undefined;
    unsubscribeFromState();
  });
};


/**
 * Exposed interface
**/

export const usePresence = () => ({
  initFor,
  subscribeToState,
  unsubscribeFromState,
  me: readonly(me),
  onlineUsers: readonly(onlineUsers),
});
