import Paho from 'paho-mqtt';
import { compose, pick, values, flatten } from 'ramda';
import { v4 as uuidv4 } from 'uuid';

const VRM_MQTT_BROKER_PORT = 443;
const TOPICS = {
  powerConsumption: [
    'system/0/Ac/ConsumptionOnOutput/L1/Power',
    'system/0/Ac/ConsumptionOnOutput/L2/Power',
    'system/0/Ac/ConsumptionOnOutput/L3/Power',
  ],
  solarYield: [
    'system/0/Dc/Pv/Power',
    'system/0/Ac/PvOnOutput/L1/Power',
    'system/0/Ac/PvOnOutput/L2/Power',
    'system/0/Ac/PvOnOutput/L3/Power',
  ],
  batteryState: [ 'system/0/Dc/Battery/Soc' ],
};

export const createMqttClient = ({
  brokerIndex,
  vrmIds,
  topics = [ 'powerConsumption', 'solarYield', 'batteryState' ],
  onConnectionGained,
  onConnectionLost,
  onMessage,
}) => {
  const brokerUrl = `webmqtt${ brokerIndex }.victronenergy.com`;
  const clientId = `NXT_GRID_PWA_${ brokerIndex }_${ uuidv4() }`;
  const client = new Paho.Client(brokerUrl, VRM_MQTT_BROKER_PORT, clientId);
  const topicsToSubscribeTo = compose(
    flatten,
    values,
    pick(topics),
  )(TOPICS);

  client.onConnectionLost = evt => {
    if(evt.errorCode !== 0) {
      console.warn('MQTT connection lost', evt);
      vrmIds.forEach(onConnectionLost);
    }
  };

  client.onMessageArrived = onMessage;

  client.connect({
    userName: import.meta.env.VITE_MQTT_USERNAME,
    password: import.meta.env.VITE_MQTT_PASSWORD,
    useSSL: true,
    reconnect: true,
    keepAliveInterval: 30,
    onFailure: evt => {
      console.warn('MQTT connection failed', evt);
    },
    onSuccess() {
      vrmIds.forEach(onConnectionGained);

      // Subscribe to topics for all VRM IDs
      vrmIds
        .flatMap(vrmId =>
          topicsToSubscribeTo.map(topic => `N/${ vrmId }/${ topic }`),
        )
        .forEach(topic => {
          client.subscribe(topic);
        })
      ;

      // Publish a keep-alive once without suppressing republishes so we get latest known data
      vrmIds
        .map(vrmId => `R/${ vrmId }/keepalive`)
        .forEach(topic => {
          const message = new Paho.Message('');
          message.destinationName = topic;
          message.qos = 1;
          client.send(message);
        })
      ;
    },
  });

  client.destroyMe = () => {
    if(client.isConnected()) client.disconnect();
  };

  return client;
};
