import { isNil, isNotNil } from 'ramda';
import { getColorForWeight } from '../../../../../libraries/color-helpers';
import { roundToTwoDecimals } from '../../../../../libraries/number-helpers';

const VOLTAGE_GOOD = 230;
const VOLTAGE_BAD = 216;

const getScanResultWeight = resultValue => {
  if(isNil(resultValue)) return null;
  return resultValue >= VOLTAGE_GOOD ? 1
    : resultValue <= VOLTAGE_BAD ? 0
      : roundToTwoDecimals(resultValue - VOLTAGE_BAD) / (VOLTAGE_GOOD - VOLTAGE_BAD);
};

const getCommandCircleColor = status => {
  if (status === 'SUCCESSFUL') {
    return 'mediumseagreen';
  }
  if (status === 'FAILED' || status === 'ABORTED') {
    return 'tomato';
  }
  return 'yellow';
};

export const getCommandPresentation = (command, commandType, resultValue) => {
  let weight;
  // @TODO :: Make this more robust
  const withFormattedColor = commandType === 'scan' && command.command_type === 'READ_VOLTAGE';
  if(withFormattedColor) {
    weight = getScanResultWeight(resultValue);
  }
  const markerColor = !withFormattedColor ? undefined : isNotNil(weight) ? getColorForWeight(weight) : 'silver';
  const circleColor = getCommandCircleColor(command.command_status);
  const overrideCircleColor = (withFormattedColor && resultValue) ? 'rgba(0,0,0,0.15)' : undefined;

  return {
    marker: { markerColor, circleColor, overrideCircleColor },
    weight,
  };
};
