import { baseGqlRepo } from '../../../../libraries/api-connection/repo/baseGqlRepo';

const unwrapGqlCollection = collectionName => collection => {
  const { edges, totalCount } = collection[collectionName];
  return {
    entries: edges.map(({ node }) => node),
    totalRecords: totalCount,
  };
};

export const createSupabaseGqlClient = ({ gqlQuery, collectionName }) => {
  const fetch = variables => {
    const translatedVariables = {
      first: variables.limit,
      offset: variables.offset,
    };
    return baseGqlRepo
      .query(gqlQuery, translatedVariables)
      .then(unwrapGqlCollection(collectionName))
    ;
  };

  return { fetch };
};
