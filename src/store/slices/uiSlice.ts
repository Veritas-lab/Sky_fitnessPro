import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface UiState {
  isLoading: boolean;
  error: string | null;
  modals: {
    deleteConfirm: boolean;
    courseDeleted: boolean;
    courseAdd: boolean;
    workoutSelection: boolean;
  };
}

const initialState: UiState = {
  isLoading: false,
  error: null,
  modals: {
    deleteConfirm: false,
    courseDeleted: false,
    courseAdd: false,
    workoutSelection: false,
  },
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    openModal: (state, action: PayloadAction<keyof UiState["modals"]>) => {
      state.modals[action.payload] = true;
    },
    closeModal: (state, action: PayloadAction<keyof UiState["modals"]>) => {
      state.modals[action.payload] = false;
    },
    closeAllModals: (state) => {
      Object.keys(state.modals).forEach((key) => {
        state.modals[key as keyof UiState["modals"]] = false;
      });
    },
  },
});

export const { setLoading, setError, openModal, closeModal, closeAllModals } =
  uiSlice.actions;
export default uiSlice.reducer;
