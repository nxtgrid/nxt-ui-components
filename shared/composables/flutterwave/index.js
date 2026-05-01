import { useToast } from 'vue-toastification';
import { removeWs } from '../../libraries/primitive-helpers';

const isDev = import.meta.env.VITE_CONTEXT === 'development';
const public_key = import.meta.env.VITE_FLUTTERWAVE_PUBLIC_KEY;

// Flutterwave doesn't have a client-side
// NPM package, so add script to body manually 🤷🏻‍♂️
const initFlutterwave = () => {
  const inlineSdk = 'https://checkout.flutterwave.com/v3.js';
  if (!document.querySelector(`[src="${ inlineSdk }"]`)) {
    const script = document.createElement('script');
    script.src = inlineSdk;
    document.body.appendChild(script);
  }
};

const payWithFlutterwave = paymentData => new Promise(resolve => {
  let fwResponse;

  const payData = {
    ...paymentData,
    public_key,
    country: 'NG',
    payment_options: [ 'ussd' ],

    callback(res) {
      fwResponse = res;
    },

    onclose(incomplete) {
      resolve(incomplete ? { status: 'user_cancel' } : fwResponse);
    },
  };

  window.FlutterwaveCheckout(payData);
});

export const useFlutterwave = () => {
  initFlutterwave();
  const toast = useToast();

  const pay = async paymentData => {
    const fwResponse = await payWithFlutterwave(paymentData);

    if(fwResponse.status === 'user_cancel') return { result: 'canceled' };

    if(fwResponse.status === 'successful' || fwResponse.status === 'completed') {
      toast.success('Successfully purchased credit');
      return { result: 'successful' };
    }

    toast.error('Failed to purchase credit');
    return { result: 'failed' };
  };

  return { pay };
};

export const createFlutterwaveReference = identifier =>
  `${ isDev ? 'DEV__' : '' }${ removeWs(identifier) }__${ new Date().toISOString() }`;
