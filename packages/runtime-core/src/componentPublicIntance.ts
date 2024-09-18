export const componentPublicInstance = {
  get({ _: instance }, key) {
    const { setupState, props, data } = instance;
    if (key in setupState) {
      return setupState[key];
    } else if (key in props) {
      return props[key];
    }
    // else {
    //   return data[key];
    // }
  },
  set({ _: instance }, key, value) {
    const { setupState, props, data } = instance;
    if (key in setupState) {
      setupState[key] = value;
    } else if (key in props) {
      props[key] = value;
    }
    // else {
    //   data[key] = value;
    // }
  },
};
