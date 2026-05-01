import { defineStore } from 'pinia';
import { baseSupabaseRepo } from '../repo/baseSupabaseRepo';
import { baseOpsRestRepo } from '../repo/baseOpsRestRepo';
import { jwtDecode } from 'jwt-decode';
import { usePresence } from '@nxt/libraries/global-presence';

// @HACK :: Doing check by hardcoded ID
import { NXT_ORG_ID } from '@nxt/libraries/constants';
export const isOrgNxtGrid = orgId => orgId === NXT_ORG_ID;

const { VITE_SUPABASE_REFERENCE_ID } = import.meta.env;
const SUPABASE_REF = VITE_SUPABASE_REFERENCE_ID === 'local' ? '127' : VITE_SUPABASE_REFERENCE_ID;

export const useAccountStore = defineStore('account', {
  state: () => ({
    _isLoggedIn: false,
    _grafanaToken: null,
    _grafanaTokenExp: null,
    _mySupabaseProfile: null,
    _myNxtProfile: null,
    _redirectAfterLogin: null,
    _brand: window.BRAND,
  }),

  getters: {
    grafanaToken: state => state._grafanaToken,
    isLoggedIn: state => state._isLoggedIn,
    redirectAfterLogin: state => state._redirectAfterLogin,
    mySupabaseProfile: state => state._mySupabaseProfile,
    myProfile: state => state._myNxtProfile,
    trainingLevel: state => state._myNxtProfile?.member?.training_level ?? 0,
    isNxtGridMember: state => isOrgNxtGrid(state._myNxtProfile?.organization.id),
    myOrgIdForFiltering(state) {
      return this.isNxtGridMember ? undefined : state._myNxtProfile?.organization.id;
    },
    brand: state => state._brand,
  },

  actions: {
    logInUser(user) {
      if(this._isLoggedIn) return;

      this._mySupabaseProfile = {
        id: user.id,
        picture: user.user_metadata.picture,
      };
      // @TODO :: Check if we can fetchMyProfile here
      this._isLoggedIn = true;
      usePresence().initFor(user);
    },

    fetchMyProfile() {
      return baseSupabaseRepo
        .getMyProfile(this._mySupabaseProfile.id)
        .then(profile => {
          this._myNxtProfile = profile;
          // console.info('FETCHED MY PROFILE', profile);
        })
      ;
    },

    setRedirectAfterLogin(routeOptions) {
      this._redirectAfterLogin = routeOptions;
    },

    async checkGrafanaToken() {
      if(!this._grafanaToken || this._grafanaTokenExp < Date.now()) {
        baseOpsRestRepo
          .getGrafanaToken()
          .then(({ access_token }) => {
            this._grafanaToken = access_token;
            this._grafanaTokenExp = jwtDecode(access_token).exp * 1000;
          })
          .catch(err => {
            console.error('Failed to fetch Grafana token:', err);
          })
        ;
      }
    },

    doLogOut() {
      console.info('doLogOut called');
      return baseSupabaseRepo.client.auth
        .signOut({ scope: 'local' })
        .then(res => {
          // If we get an error then sign out manually by clearing the cache
          if(res.error) {
            console.warn('Error logging out, going to clear data manually');
            localStorage.removeItem(`sb-${ SUPABASE_REF }-auth-token`);
            this.$reset();
          }
        })
      ;
    },
  },

  persist: {
    pick: [ '_grafanaToken', '_grafanaTokenExp', '_myNxtProfile' ],
  },
});
