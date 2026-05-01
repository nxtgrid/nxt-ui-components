export const round = precision => number => {
  const _precision = precision == null ? 0 : (precision >= 0 ? Math.min(precision, 292) : Math.max(precision, -292));
  if (_precision) {
    // Shift with exponential notation to avoid floating-point issues.
    // See [MDN](https://mdn.io/round#Examples) for more details.
    let pair = `${ number }e`.split('e');
    const expNumber = Number(`${ pair[0] }e${ +pair[1] + _precision }`);
    const value = Math.round(expNumber);

    pair = `${ value }e`.split('e');
    return +`${ pair[0] }e${ +pair[1] - _precision }`;
  }
  return Math.round(number);
};

export const roundToTwoDecimals = round(2);
