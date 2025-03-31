// resetPersistedState.js

import { persistor } from "./store"; // Adjust the path as needed
import { store } from "./store";
import { resetState as resetUsers } from "./features/users/usersSlice";
import { resetState as resetConfiguration } from "./features/products/productSlice";
import { resetState as resetDefectStatus } from "./features/vouchers/vouchersSlice";

export const resetPersistedState = () => {
  // Purge persisted data from storage
  persistor.purge();

  // Dispatch reset actions to reset Redux state in memory
  store.dispatch(resetUsers());
  store.dispatch(resetConfiguration());
  store.dispatch(resetDefectStatus());
};
