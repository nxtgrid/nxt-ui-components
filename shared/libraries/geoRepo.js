import ky from 'ky';

const _base = ky.create({
  prefixUrl: import.meta.env.VITE_GEO_API_URL,
  timeout: false,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const geoRepo = {
  handleError: async err => {
    if(!err.response) throw err;

    const _err = await err.response.json();
    if(!_err.detail) throw _err;

    if(Array.isArray(_err.detail)) throw _err.detail[0];
    throw _err.detail;
  },

  getBuildings(json) {
    return _base
      .post('buildings', { json })
      .json()
      .catch(this.handleError)
    ;
  },

  getPoles(json) {
    return _base
      .post('poles-by-coverage', { json })
      .json()
      .catch(this.handleError)
    ;
  },

  getDistributionLines(json) {
    return _base
      .post('distribution-lines-by-poles', { json })
      .json()
      .catch(this.handleError)
    ;
  },
};
