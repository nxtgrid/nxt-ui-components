export const isObject = toCheck =>
  typeof toCheck === 'object' &&
  !Array.isArray(toCheck) &&
  toCheck !== null
;

export const interpretStringBoolean = strBool =>
  strBool === 'true' ? true :
    strBool === 'false' ? false :
      undefined;
