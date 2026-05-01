export const removeWs = str => str.replace(/\s+/g, '_');

export const snakeCaseToHumanReadable = str => {
  const interim = str.replace(/_/g, ' ');
  return interim.slice(0, 1).toUpperCase() + interim.slice(1);
};
