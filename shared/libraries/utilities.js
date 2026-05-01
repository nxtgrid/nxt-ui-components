export const wait = (ms = 1000) => new Promise(resolve => {
  setTimeout(resolve, ms);
});

export const pollWhileComparing = async (pollFn, reactiveCompareVal) => {
  const oldCompareVal = reactiveCompareVal.value;
  let newCompareVal = oldCompareVal;
  let shouldWait = false;

  while(newCompareVal === oldCompareVal) {
    if(shouldWait) await wait(1000);
    else shouldWait = true;
    console.info('🦜 Polling while comparing');
    await pollFn();
    newCompareVal = reactiveCompareVal.value;
  }
};
