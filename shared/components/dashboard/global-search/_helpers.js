export const createSearchEntryRoutePath = (entity, entry) => {
  switch(entity) {
    case 'grids':
      return `/grid/${ entry.id }/`;
    case 'meters':
      return `/grid/${ entry.grid?.id }/meter/${ entry.id }/`;
    case 'customers':
      return `/grid/${ entry.grid?.id }/customer/${ entry.id }/`;
    case 'agents':
      return `/grid/${ entry.grid?.id }/agent/${ entry.id }`;
  }
};

export const findEntityWithEntries = searchResult =>
  Object.keys(searchResult).find(key => searchResult[key].entries.length);
