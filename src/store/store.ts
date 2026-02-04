import { configureStore } from "@reduxjs/toolkit";
import uiSlice from "./slices/uiSlice";
import coursesSlice from "./slices/coursesSlice";

export const store = configureStore({
  reducer: {
    ui: uiSlice,
    courses: coursesSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
