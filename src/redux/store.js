import { configureStore } from "@reduxjs/toolkit";
import { api } from "./api"; // Adjust path as needed
import rootReducer from "./rootReducer";
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";
import storage from "redux-persist/lib/storage"; // Defaults to localStorage for web

// Persist configuration
const persistConfig = {
  key: "root", // Key to identify persisted data
  storage, // Storage engine, can be customized (e.g., AsyncStorage for React Native)
  whitelist: ["configuration", "users", "defectStatus"], // Specify which reducers to persist
};

// Apply persistReducer to rootReducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Configure store
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }).concat(api.middleware),
});

// Create a persistor
export const persistor = persistStore(store);

export default store;
