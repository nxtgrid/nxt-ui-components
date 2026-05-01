import { REALTIME_SUBSCRIBE_STATES } from '@supabase/realtime-js';

/**
 * Handles realtime subscriptions to multiple channels.
 *
 * Factories are used rather than channels themselves to allow for re-creation of channels when needed
 * to do a proper reconnection after an error or timeout.
 */
export class RealtimeHandler {
  constructor(supabaseClient, config) {
    this.inactiveTabTimeoutSeconds = 10 * 60; // Default: 10 minutes
    this.supabaseClient = supabaseClient;
    this.channelFactories = new Map();
    this.channels = new Map();
    this.subscriptionEventCallbacks = new Map();
    this.inactiveTabTimer = undefined;
    this.started = false;

    if (config && config.inactiveTabTimeoutSeconds) {
      this.inactiveTabTimeoutSeconds = config.inactiveTabTimeoutSeconds;
    }
  }

  /**
   * Adds a new channel using the provided channel factory and, optionally, subscription event callbacks.
   *
   * @param {Function} channelFactory - A factory function responsible for creating the channel.
   * @param {Object} [subscriptionEventCallbacks] - Optional callbacks for handling subscription-related events.
   *
   * @returns {Function} A function that, when executed, removes the channel.
   */
  addChannel(channelFactory, subscriptionEventCallbacks) {
    const channel = this.createChannel(channelFactory);

    if (this.channelFactories.has(channel.topic)) {
      console.warn(`Overwriting existing channel factory for topic: ${ channel.topic }`);
      this.unsubscribeFromChannel(channel.topic);
    }
    this.channelFactories.set(channel.topic, channelFactory);

    if (subscriptionEventCallbacks) {
      this.subscriptionEventCallbacks.set(channel.topic, subscriptionEventCallbacks);
    }

    if (this.started) {
      // No need to await here as it's all event-driven.
      this.subscribeToChannel(channel);
    }

    return () => {
      this.removeChannel(channel.topic);
    };
  }

  /**
   * Removes and unsubscribes the channel associated with the given topic.
   *
   * @param {string} topic - The topic for the channel.
   */
  removeChannel(topic) {
    if (!topic.startsWith('realtime:')) {
      // If not prefixed, add the prefix.
      topic = `realtime:${ topic }`;
    }
    this.channelFactories.delete(topic);
    this.unsubscribeFromChannel(topic);
  }

  /**
   * Starts the realtime event handling process.
   *
   * @returns {Function} A cleanup function that stops realtime event handling.
   */
  start() {
    if (this.started) {
      console.warn('RealtimeHandler has already been started. Ignoring subsequent start call.');
      return () => {};
    }

    const removeVisibilityChangeListener = this.addOnVisibilityChangeListener();

    this.subscribeToAllCreatedChannels();

    this.started = true;

    return () => {
      // Cleanup: remove listener and unsubscribe from all channels.
      removeVisibilityChangeListener();
      this.unsubscribeFromAllChannels();
    };
  }

  // ----- Internal Methods -----

  /**
   * Recreates the channel for the specified topic.
   *
   * @param {Function} channelFactory - The factory function to create the channel.
   * @returns {Object} The created channel.
   */
  createChannel(channelFactory) {
    const channel = channelFactory(this.supabaseClient);
    this.channels.set(channel.topic, channel);
    return channel;
  }

  /**
   * Subscribes to a single channel.
   *
   * @param {Object} channel - The channel object.
   */
  async subscribeToChannel(channel) {
    if (channel.state === 'joined' || channel.state === 'joining') {
      console.info(`Channel '${ channel.topic }' is already joined or joining. Skipping subscribe.`);
      return;
    }

    await this.refreshSessionIfNeeded();

    channel.subscribe(async (status, err) => {
      await this.handleSubscriptionStateEvent(channel, status, err);
    });
  }

  subscribeToAllCreatedChannels() {
    for (const channel of this.channels.values()) {
      if (channel) {
        this.subscribeToChannel(channel);
      }
    }
  }

  resubscribeToAllChannels() {
    for (const topic of this.channelFactories.keys()) {
      if (!this.channels.get(topic)) {
        this.resubscribeToChannel(topic);
      }
    }
  }

  /**
   * Recreates and subscribes to the realtime channel for the given topic.
   *
   * @param {string} topic - The topic for the channel.
   */
  resubscribeToChannel(topic) {
    const channelFactory = this.channelFactories.get(topic);
    if (!channelFactory) {
      throw new Error(`Channel factory not found for topic: ${ topic }`);
    }
    const channel = this.createChannel(channelFactory);
    this.subscribeToChannel(channel);
  }

  /**
   * Unsubscribes from the channel for a given topic.
   *
   * @param {string} topic - The topic for the channel.
   */
  unsubscribeFromChannel(topic) {
    const channel = this.channels.get(topic);
    if (channel) {
      this.supabaseClient.removeChannel(channel);
      this.channels.delete(topic);
    }
  }

  unsubscribeFromAllChannels() {
    for (const topic of this.channels.keys()) {
      this.unsubscribeFromChannel(topic);
    }
  }

  /**
   * Handles different subscription state events.
   *
   * @param {Object} channel - The channel object.
   * @param {string} status - The subscription state.
   * @param {Error} [err] - Optional error object.
   */
  async handleSubscriptionStateEvent(channel, status, err) {
    const { topic } = channel;

    switch (status) {
      case REALTIME_SUBSCRIBE_STATES.SUBSCRIBED: {
        console.info(`Successfully subscribed to '${ topic }'`);
        const subscriptionEventCallbacks = this.subscriptionEventCallbacks.get(topic);
        if (subscriptionEventCallbacks && subscriptionEventCallbacks.onSubscribe) {
          subscriptionEventCallbacks.onSubscribe(channel);
        }
        break;
      }
      case REALTIME_SUBSCRIBE_STATES.CLOSED: {
        console.info(`Channel closed '${ topic }'`);
        const subscriptionEventCallbacks = this.subscriptionEventCallbacks.get(topic);
        if (subscriptionEventCallbacks && subscriptionEventCallbacks.onClose) {
          subscriptionEventCallbacks.onClose(channel);
        }
        break;
      }
      case REALTIME_SUBSCRIBE_STATES.TIMED_OUT: {
        console.info(`Channel timed out '${ topic }'`);
        const subscriptionEventCallbacks = this.subscriptionEventCallbacks.get(topic);
        if (subscriptionEventCallbacks && subscriptionEventCallbacks.onTimeout) {
          subscriptionEventCallbacks.onTimeout(channel);
        }
        break;
      }
      case REALTIME_SUBSCRIBE_STATES.CHANNEL_ERROR: {
        // If the tab is hidden, simply remove the channel.
        if (document.hidden) {
          console.info(`Channel error in '${ topic }', but tab is hidden. Removing channel.`);
          await this.supabaseClient.removeChannel(channel);
          return;
        }
        else if (err && isTokenExpiredError(err)) {
          console.info(`Token expired causing channel error in '${ topic }'. Refreshing session.`);
          this.resubscribeToChannel(topic);
        }
        else {
          console.warn(`Channel error in '${ topic }': `, err && err.message);
        }
        const subscriptionEventCallbacks = this.subscriptionEventCallbacks.get(topic);
        if (subscriptionEventCallbacks && subscriptionEventCallbacks.onError) {
          subscriptionEventCallbacks.onError(channel, err);
        }
        break;
      }
      default: {
        const exhaustiveCheck = status;
        throw new Error(`Unknown channel status: ${ exhaustiveCheck }`);
      }
    }
  }

  /**
   * Refreshes the session token if needed and updates Supabase Realtime with the new token.
   */
  async refreshSessionIfNeeded() {
    const { data, error } = await this.supabaseClient.auth.getSession();
    if (error) {
      throw error;
    }
    if (!data.session) {
      throw new Error('Session not found');
    }
    if (this.supabaseClient.realtime.accessTokenValue !== data.session.access_token) {
      await this.supabaseClient.realtime.setAuth(data.session.access_token);
    }
  }

  addOnVisibilityChangeListener() {
    const handler = () => this.handleVisibilityChange();
    document.addEventListener('visibilitychange', handler);

    return () => {
      document.removeEventListener('visibilitychange', handler);
    };
  }

  handleVisibilityChange() {
    if (document.hidden) {
      if (!this.inactiveTabTimer) {
        this.inactiveTabTimer = setTimeout(async () => {
          console.info(`Tab inactive for ${ this.inactiveTabTimeoutSeconds } seconds. Disconnecting from realtime.`);
          this.unsubscribeFromAllChannels();
        }, this.inactiveTabTimeoutSeconds * 1000);
      }
    }
    else {
      if (this.inactiveTabTimer) {
        clearTimeout(this.inactiveTabTimer);
        this.inactiveTabTimer = undefined;
      }
      this.resubscribeToAllChannels();
    }
  }
}

/**
 * Determines if the provided error relates to an expired token.
 *
 * @param {Error} err - The error object.
 * @returns {boolean} True if the error message indicates an expired token.
 */
const isTokenExpiredError = err => {
  return err.message && err.message.startsWith('"Token has expired');
};
