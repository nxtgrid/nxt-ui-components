import ky from 'ky';
import { print } from 'graphql/language/printer';

import { baseSupabaseRepo, SUPABASE_URL } from './baseSupabaseRepo';

const _client = ky.create({
  prefixUrl: `${ SUPABASE_URL }/graphql`,
  headers: {
    'Content-Type': 'application/json',
    apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
  },
  hooks: {
    beforeRequest: [
      async request => {
        const { session } = await baseSupabaseRepo
          .client.auth.getSession()
          .then(baseSupabaseRepo.handleResponse)
        ;

        if(session.access_token) {
          request.headers.set('Authorization', `Bearer ${ session.access_token }`);
        }
      },
    ],
  },
});

export const baseSupabaseGqlRepo = {
  query(gql, variables) {
    const options = {
      json: {
        query: print(gql),
        variables,
      },
    };

    return _client
      .post('v1', options)
      .json()
      .then(({ data, errors }) => {
        if(errors) throw errors[0];
        return data;
      })
    ;
  },
};
