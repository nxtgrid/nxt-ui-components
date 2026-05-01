// Bit of a cheat, red is only used for 0 weight because weights
// are rounded by 2 decimals and yellow starts lower than 0.01
const weightColors = [
  { pct: 0.0, color: { r: 255, g: 0, b: 0 } },      // red
  { pct: 0.001, color: { r: 255, g: 255, b: 0 } },  // yellow
  { pct: 1.0, color: { r: 0, g: 255, b: 0 } },      // green
];

export const getColorForWeight = pct => {
  for (var i = 1; i < weightColors.length - 1; i++) {
    if (pct < weightColors[i].pct) {
      break;
    }
  }
  const lower = weightColors[i - 1];
  const upper = weightColors[i];
  const range = upper.pct - lower.pct;
  const rangePct = (pct - lower.pct) / range;
  const pctLower = 1 - rangePct;
  const pctUpper = rangePct;
  const color = {
    r: Math.floor(lower.color.r * pctLower + upper.color.r * pctUpper),
    g: Math.floor(lower.color.g * pctLower + upper.color.g * pctUpper),
    b: Math.floor(lower.color.b * pctLower + upper.color.b * pctUpper),
  };
  return 'rgb(' + [ color.r, color.g, color.b ].join(',') + ')';
};
