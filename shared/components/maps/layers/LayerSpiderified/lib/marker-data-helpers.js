import { readonly, ref } from 'vue';
import { getCommandPresentation } from './get-command-presentation';
import { compose, filter, isNotNil, mean, min, pluck, reduce } from 'ramda';
import { roundToTwoDecimals } from '@nxt/libraries/number-helpers';
import { getColorForWeight } from '@nxt/libraries/color-helpers';
import { formatPhone } from '@nxt/libraries/phone-helpers';

const replaceData = (markerType, commandType, formatMap, generateLinkFn) => feature => {
  if(markerType === 'meter') {
    return {
      id: feature.id,
      marker: {
        markerColor: feature.meter_type === 'HPS' ? 'goldenrod' : 'silver',
        circleColor: feature.open_issue ? 'tomato' : 'white',
      },
      popup: {
        title: feature.full_name,
        subtitle: `Meter ${ feature.external_reference } | Type ${ feature.meter_type }`,
        items: [
          feature.open_issue && {
            title: 'Issue',
            value: formatMap[feature.open_issue]?.long ?? formatMap[feature.open_issue]?.short ?? feature.open_issue,
          },
        ].filter(Boolean),
        link: generateLinkFn ? {
          to: generateLinkFn({ id: feature.id }),
          text: 'Go to meter',
        } : undefined,
      },
    };
  }
  if(markerType === 'customer') {
    const { total_connection_fee, total_connection_paid } = feature;
    const hasPaidFees = total_connection_paid >= total_connection_fee;
    return {
      id: feature.id,
      marker: { circleColor: hasPaidFees ? 'mediumseagreen' : 'tomato' },
      popup: {
        title: feature.full_name,
        items: [
          {
            title: 'Phone',
            value: formatPhone(feature.phone),
          },
          {
            title: 'Fees paid',
            value: feature.total_connection_paid,
          },
          {
            title: 'Fees total',
            value: feature.total_connection_fee,
          },
        ],
        link: generateLinkFn ? {
          to: generateLinkFn({ id: feature.id }),
          text: 'Go to customer',
        } : undefined,
      },
    };
  }
  if(markerType === 'command') {
    const formatter = formatMap[feature.command.command_type];
    if(!formatter) console.warn('Warning! No formatter for this command type');
    const resultValue = formatter.getRawResult?.(feature.command);
    const { marker, weight } = getCommandPresentation(feature.command, commandType, resultValue);

    return {
      id: feature.id,
      marker,
      weight,
      popup: {
        title: `Meter ${ feature.external_reference }`,
        subtitle: `Type ${ feature.meter_type } | Gateway ${ feature.gateway?.external_reference }`,
        items: [
          {
            title: formatter.title,
            value: feature.command.command_status,
          },
          isNotNil(resultValue) && {
            title: 'Result',
            value: formatter.resultFormatFn(feature.command),
          },
        ].filter(Boolean),
        link: generateLinkFn ? {
          to: generateLinkFn({ meter: { id: feature.id } }),
          text: 'Go to meter',
        } : undefined,
      },
    };
  }
  if(markerType === 'issue') {
    const formatter = formatMap[feature.issue.issue_type];
    if(!formatter) console.warn('Warning! No formatter for this command type');
    return {
      id: feature.id,
      marker: {
        markerColor: 'DodgerBlue',
        circleColor: 'white',
      },
      popup: {
        title: `Meter ${ feature.external_reference }`,
        subtitle: formatter.short,
        poleWithMeterIssues: feature.pole,
        link: generateLinkFn ? {
          to: generateLinkFn({ meter: { id: feature.id } }),
          text: 'Go to meter',
        } : undefined,
      },
    };
  }
  return {};
};

const getMeanWeight = compose(
  roundToTwoDecimals,
  mean,
  filter(isNotNil),
  pluck('weight'),
);

const getMinWeight = compose(
  roundToTwoDecimals,
  reduce(min, Infinity),
  filter(isNotNil),
  pluck('weight'),
);

const getClusterWeight = (features, useMinValue) =>
  useMinValue ? getMinWeight(features) :  getMeanWeight(features);

export const useSpiderMarkers = (type, formatMap, generateLinkFn) => {
  const _singleMarkers = ref([]);
  const _clusterMarkers = ref([]);
  const [ markerType, commandType ] = type.split(':');
  const _replaceData = replaceData(markerType, commandType, formatMap, generateLinkFn);

  const useWeightAsBackgroundColor = commandType === 'scan';

  const updateFromMapbox = ({ newSingleMarkers, newClusterMarkers }) => {
    _singleMarkers.value = newSingleMarkers
      .map(marker => ({ ...marker, feature: _replaceData(marker.feature) }));
    _clusterMarkers.value = newClusterMarkers
      .map(marker => {
        const clusterMarker = { ...marker, features: marker.features.map(_replaceData) };
        if(useWeightAsBackgroundColor) {
          const clusterWeight = getClusterWeight(clusterMarker.features, true);
          clusterMarker.backgroundColor = isNaN(clusterWeight) ? '#fff' : getColorForWeight(clusterWeight);
        }
        return clusterMarker;
      });
  };

  return {
    singleMarkers: readonly(_singleMarkers),
    clusterMarkers: readonly(_clusterMarkers),
    updateFromMapbox,
  };
};
