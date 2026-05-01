import { readonly, ref, shallowRef } from 'vue';

const _isOpen = ref(false);
const _component = shallowRef();
const _options = ref();

const doOpen = (component, options) => {
  _component.value = component;
  _options.value = options;
  _isOpen.value = true;
};

const doClose = () => {
  _isOpen.value = false;
  _component.value = undefined;
  _options.value = undefined;
};

const onDone = (doneOptions = {}) => {
  // Wrapped in try so it will still close even if error in callback
  try {
    _options.value?.onDone?.(doneOptions);
  }
  finally {
    doClose();
  }
};

export const useNxtModal = () => {
  const options = readonly(_options);
  return {
    isOpen: readonly(_isOpen),
    component: _component,
    options,
    data: options.value?.data,
    props: options.value?.props,
    open: doOpen,
    close: doClose,
    done: onDone,
  };
};
