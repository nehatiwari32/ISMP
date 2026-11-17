let reduxStore: any = null;
let storeReadyPromise: any = null;
let storeReadyResolve: any = null;

// Create promise once
const createStoreReadyPromise = () => {
  if (!storeReadyPromise) {
    storeReadyPromise = new Promise((resolve) => {
      storeReadyResolve = resolve;
    });
  }
  return storeReadyPromise;
};

export const setStore = (storeInstance) => {
  reduxStore = storeInstance;
  if (storeReadyResolve) {
    storeReadyResolve(storeInstance);
  }
};

export const getStore = () => reduxStore;

export const waitForStore = async () => {
  if (reduxStore) return reduxStore;
  return createStoreReadyPromise();
};