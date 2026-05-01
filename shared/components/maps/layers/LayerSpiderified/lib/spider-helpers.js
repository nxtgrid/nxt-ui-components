const CIRCLE_FOOT_SEPARATION = 30;
const TWO_PI = Math.PI * 2;

// function generateSpiderLegParams(count, circleSpiralSwitchover) {
//   if (count >= options.circleSpiralSwitchover) {
//     return generateSpiralParams(count);
//   }
//   else {
//     return generateCircleParams(count);
//   }
// }

// function generateSpiralParams(count) {
//   var legLength = options.spiralLengthStart,
//     angle = 0;
//   return util.mapTimes(count, function (index) {
//     var pt;
//     angle = angle + (options.spiralFootSeparation / legLength + index * 0.0005);
//     pt = {
//       x: legLength * Math.cos(angle),
//       y: legLength * Math.sin(angle),
//       angle: angle,
//       legLength: legLength,
//       index: index,
//     };
//     legLength = legLength + (twoPi * options.spiralLengthFactor / angle);
//     return pt;
//   });
// }

export const addCircleParams = markers => {
  const numMarkers = markers.length;
  const circumference = CIRCLE_FOOT_SEPARATION * (2 + numMarkers);
  const legLength = circumference / TWO_PI; // = radius from circumference
  const angleStep = TWO_PI / numMarkers;

  return markers.map((marker, index) => {
    const angle = index * angleStep;
    return {
      ...marker,
      spiderLeg: {
        x: legLength * Math.cos(angle),
        y: legLength * Math.sin(angle),
        angle,
        legLength,
      },
    };
  });
};
