export const createRawDataClient = ({ getEntries }) => {
  const fetch = async () => {
    const entries = getEntries();
    return {
      entries,
      totalRecords: entries.length,
    };
  };

  return { fetch };
};
