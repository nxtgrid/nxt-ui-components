export const agentsRepo = {
  getAgent(id) {
    return this.client
      .from('agents')
      .select(`
        id,
        account:accounts(
          id,
          full_name,
          phone,
          email,
          telegram_id,
          telegram_link_token
        ),
        wallet:wallets(
          id,
          balance
        )
      `)
      .eq('id', id)
      .maybeSingle()
      .then(this.handleResponse)
    ;
  },
};
