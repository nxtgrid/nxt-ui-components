import { compose, values, sum } from 'ramda';
import { reactive } from 'vue';
import { createMqttClient } from './mqttClient';

const sumObjectValues = compose(sum, values);

export const inferBrokerIndexByVrmId = vrmId => {
  let sum = 0;
  for (let i = 0; i < vrmId.length; i++) {
    sum += vrmId.charCodeAt(i);
  }
  return sum % 128;
};

export const useMqtt = () => {
  const mqttData = reactive({
    /**
     * Data will look like this:
     *
     * VRM_ID: {
     *   hasConnection: true,
     *   hasReceivedLiveData: false,
     *   powerConsumption: {
     *     value: null,
     *   },
     *   solarYield: {
     *     value: null,
     *   },
     *   batteryState: {
     *     value: null,
     *   },
     * },
     */
  });

  const productionPhaseMap = {};
  const consumptionPhaseMap = {};

  const onConnectionGained = vrmId => {
    if(!mqttData[vrmId]) {
      mqttData[vrmId] = {};
    }
    mqttData[vrmId].hasConnection = true;
  };

  const onConnectionLost = vrmId => {
    mqttData[vrmId].hasConnection = false;
  };

  const onMessage = message => {
    // @TEMPORARY LOG
    if(message.retained) console.info('[MQTT] Got retained message from VRM', message);

    const { destinationName, payloadString } = message;
    const pathArray = destinationName.split('/');
    if(pathArray.length < 6) return;

    const msgVrmId = pathArray[1];
    const dataType = pathArray[5];
    const { value } = JSON.parse(payloadString.trim());
    const roundValue = Math.round(value);

    if(!mqttData[msgVrmId]) {
      mqttData[msgVrmId] = {};
    }

    // If we have a message we can consider this to be a live connection,
    // since VRM firmware > 3.50 doesn't support retained messages anymore
    mqttData[msgVrmId].hasReceivedLiveData = true;

    if(dataType === 'ConsumptionOnOutput') {
      if(!consumptionPhaseMap[msgVrmId]) {
        consumptionPhaseMap[msgVrmId] = {};
      }
      // Store value of individual phases locally
      const phase = pathArray[6];
      consumptionPhaseMap[msgVrmId][phase] = roundValue;
      // Then update powerConsumption with the sum of all phases
      mqttData[msgVrmId].powerConsumption = {
        value: sumObjectValues(consumptionPhaseMap[msgVrmId]),
      };
    }
    if([ 'PvOnOutput', 'Pv' ].includes(dataType)) {
      if(!productionPhaseMap[msgVrmId]) {
        productionPhaseMap[msgVrmId] = {};
      }
      // Pv has no (so say 1) phase, PvOnOutput has three
      // In the latter case we take it from that channel topic name
      const phase = dataType === 'Pv' ? 'L1' : pathArray[6];
      productionPhaseMap[msgVrmId][dataType + phase] = roundValue;

      mqttData[msgVrmId].solarYield = {
        value: sumObjectValues(productionPhaseMap[msgVrmId]),
      };
    }
    if(dataType === 'Battery') {
      mqttData[msgVrmId].batteryState = {
        value: roundValue,
      };
    }
  };

  const subscribeGrids = (vrmIdArr, topics) => {
    const clients = vrmIdArr
      .reduce((accArr, vrmId) => {
        const brokerIndex = inferBrokerIndexByVrmId(vrmId);
        const existingBroker = accArr.find(broker => broker.brokerIndex === brokerIndex);
        if(existingBroker) {
          existingBroker.vrmIds = [ ...existingBroker.vrmIds, vrmId ];
          return accArr;
        }
        return [
          ...accArr,
          {
            brokerIndex,
            vrmIds: [ vrmId ],
            topics,
            onConnectionGained,
            onConnectionLost,
            onMessage,
          },
        ];
      }, [])
      .map(createMqttClient)
    ;

    return {
      destroy: () => {
        clients.forEach(({ destroyMe }) => destroyMe());
      },
    };
  };

  const subscribeGrid = (vrmId, topics) => subscribeGrids([ vrmId ], topics);

  return { mqttData, subscribeGrids, subscribeGrid };
};
