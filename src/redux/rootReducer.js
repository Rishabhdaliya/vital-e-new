import { combineReducers } from "redux";
import configurationReducer from "./features/products/productSlice";
import usersReducer from "./features/users/usersSlice";
import vouchersReducer from "./features/vouchers/vouchersSlice";
import productsReducer from "./features/products/productSlice";
import issueReducer from "./features/issues/issueSlice";

import { api } from "./api";

const rootReducer = combineReducers({
  configuration: configurationReducer,
  issues: issueReducer,
  users: usersReducer,
  vouchers: vouchersReducer,
  products: productsReducer,

  [api.reducerPath]: api.reducer,
});

export default rootReducer;
