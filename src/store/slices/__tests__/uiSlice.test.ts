import uiReducer, {
  setLoading,
  setError,
  openModal,
  closeModal,
  closeAllModals,
} from "../uiSlice";

describe("uiSlice", () => {
  const initialState = {
    isLoading: false,
    error: null,
    modals: {
      deleteConfirm: false,
      courseDeleted: false,
      courseAdd: false,
      workoutSelection: false,
    },
  };

  it("должен возвращать начальное состояние", () => {
    expect(uiReducer(undefined, { type: "unknown" })).toEqual(initialState);
  });

  it("должен устанавливать loading состояние", () => {
    const actual = uiReducer(initialState, setLoading(true));
    expect(actual.isLoading).toBe(true);
  });

  it("должен сбрасывать loading состояние", () => {
    const stateWithLoading = { ...initialState, isLoading: true };
    const actual = uiReducer(stateWithLoading, setLoading(false));
    expect(actual.isLoading).toBe(false);
  });

  it("должен устанавливать ошибку", () => {
    const errorMessage = "Произошла ошибка";
    const actual = uiReducer(initialState, setError(errorMessage));
    expect(actual.error).toBe(errorMessage);
  });

  it("должен очищать ошибку", () => {
    const stateWithError = { ...initialState, error: "Ошибка" };
    const actual = uiReducer(stateWithError, setError(null));
    expect(actual.error).toBe(null);
  });

  it("должен открывать модальное окно deleteConfirm", () => {
    const actual = uiReducer(initialState, openModal("deleteConfirm"));
    expect(actual.modals.deleteConfirm).toBe(true);
    expect(actual.modals.courseDeleted).toBe(false);
  });

  it("должен открывать модальное окно courseDeleted", () => {
    const actual = uiReducer(initialState, openModal("courseDeleted"));
    expect(actual.modals.courseDeleted).toBe(true);
    expect(actual.modals.deleteConfirm).toBe(false);
  });

  it("должен закрывать модальное окно", () => {
    const stateWithOpenModal = {
      ...initialState,
      modals: { ...initialState.modals, deleteConfirm: true },
    };
    const actual = uiReducer(stateWithOpenModal, closeModal("deleteConfirm"));
    expect(actual.modals.deleteConfirm).toBe(false);
  });

  it("должен закрывать все модальные окна", () => {
    const stateWithOpenModals = {
      ...initialState,
      modals: {
        deleteConfirm: true,
        courseDeleted: true,
        courseAdd: true,
        workoutSelection: true,
      },
    };
    const actual = uiReducer(stateWithOpenModals, closeAllModals());
    expect(actual.modals.deleteConfirm).toBe(false);
    expect(actual.modals.courseDeleted).toBe(false);
    expect(actual.modals.courseAdd).toBe(false);
    expect(actual.modals.workoutSelection).toBe(false);
  });
});
