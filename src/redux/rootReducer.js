import { combineReducers } from "redux";
import configurationReducer from "./features/configuration/configurationSlice";
import usersReducer from "./features/users/usersSlice";
import vouchersReducer from "./features/vouchers/vouchersSlice";
import issueReducer from "./features/issues/issueSlice";

import { api } from "./api";

const rootReducer = combineReducers({
  configuration: configurationReducer,
  issues: issueReducer,
  users: usersReducer,
  vouchers: vouchersReducer,
  [api.reducerPath]: api.reducer,
});

export default rootReducer;
