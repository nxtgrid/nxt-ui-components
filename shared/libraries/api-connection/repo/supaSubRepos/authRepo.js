export const authRepo = {
  loginWithPassword(credentials) {
    return this.client.auth
      .signInWithPassword(credentials)
      .then(this.handleResponse)
    ;
  },

  loginWithSms(phone) {
    return this.client.auth
      .signInWithOtp({ phone, options: { shouldCreateUser: false } })
      .then(this.handleResponse)
    ;
  },

  loginWithMagicLink(email) {
    return this.client.auth
      .signInWithOtp({ email, options: {
        shouldCreateUser: false,
        emailRedirectTo: window.location.origin +  '/',
      } })
      .then(this.handleResponse)
    ;
  },

  verifySmsOtp(phone, token) {
    return this.client.auth
      .verifyOtp({ phone, token, type: 'sms' })
      .then(this.handleResponse)
    ;
  },

  loginWithOAuth(provider) {
    return this.client.auth
      .signInWithOAuth({
        provider,
        options: {
          redirectTo: window.location.origin +  '/',
        },
      })
      .then(this.handleResponse)
    ;
  },

  resetPassword(email, options) {
    return this.client.auth
      .resetPasswordForEmail(email, options)
      .then(this.handleResponse)
    ;
  },

  updateUser(updateObject) {
    return this.client.auth
      .updateUser(updateObject)
      .then(this.handleResponse)
    ;
  },

  getMyProfile(supabase_id) {
    return this.client
      .from('accounts')
      .select(`
        id,
        full_name,
        email,
        phone,
        organization:organizations(
          id,
          name,
          email,
          phone,
          wallet:wallets!organization_id(
            id,
            balance
          )
        ),

        member:members(
          id,
          member_type,
          training_level,
          busy_commissioning:grids!busy_commissioning_id(
            id,
            name,
            is_three_phase_supported
          )
        ),
        agent:agents(
          id,
          grid_id,
          wallet:wallets(
            id,
            balance
          )
        ),
        customer:customers(
          id,
          wallet:wallets(
            id,
            balance
          )
        )
      `)
      .match({ supabase_id })
      .maybeSingle()
      .then(this.handleResponse)
      .then(({ organization, agent, customer, member, ...accountRest }) => {
        const { wallet: organizationWallet, ...organizationRest } = organization;
        const myProfile = {
          ...accountRest,
          organization: organizationRest,
        };

        if(member) {
          const { busy_commissioning, ...memberRest } = member;
          myProfile.member = memberRest;
          myProfile.busy_commissioning = busy_commissioning;
          myProfile.primary_wallet = organizationWallet;
        }
        else if(agent) {
          const { wallet: agentWallet, ...agentRest } = agent;
          myProfile.agent = agentRest;
          myProfile.primary_wallet = agentWallet;
        }
        else if(customer) {
          const { wallet: customerWallet, ...customerRest } = customer;
          myProfile.customer = customerRest;
          myProfile.primary_wallet = customerWallet;
        }
        else {
          throw new Error('Your account has no related member/agent/customer');
        }

        return myProfile;
      })
    ;
  },
};
