import ky from 'ky';
import { baseSupabaseRepo } from './baseSupabaseRepo';

/**
 * The base repo is for talking to our bespoke server,
 * with interceptor to inject the Supabase access token automatically
**/
export const baseOpsRepo = ky.create({
  prefixUrl: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  hooks: {
    beforeRequest: [
      async request => {
        const { session } = await baseSupabaseRepo
          .client.auth.getSession()
          .then(baseSupabaseRepo.handleResponse)
        ;

        if(session?.access_token) {
          request.headers.set('Authorization', `Bearer ${ session.access_token }`);
        }
      },
    ],
  },
});
