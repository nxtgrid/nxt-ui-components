export const METER_NUMBER_LENGTH = 11;
const HAS_ONLY_DIGITS = val => /^\d+$/.test(val);
const METER_NUMBER_FIRST_FIVES = [ '47001', '47300', '47003' ];

const validateFirstFiveDigits = meterNumber =>
  METER_NUMBER_FIRST_FIVES.some(substr => meterNumber.startsWith(substr));

const firstFiveJoined = METER_NUMBER_FIRST_FIVES.reduce((accStr, currStr, index, arr) => {
  if(index === 0) return currStr;
  if(index === arr.length - 1) return accStr + ', or ' + currStr + '.';
  return accStr + ', ' + currStr;
});

export const validateCalinMeterNumber = meterNumber => {
  if(!HAS_ONLY_DIGITS(meterNumber))
    return 'Meter number can only contain digits.';
  if(!validateFirstFiveDigits(meterNumber))
    return `Meter number should start with ${ firstFiveJoined }`;
  if(meterNumber.length !== METER_NUMBER_LENGTH)
    return `Meter number should be ${ METER_NUMBER_LENGTH } digits long.`;
  return null;
};
