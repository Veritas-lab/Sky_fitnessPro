import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import DeleteConfirmModal from "../deleteConfirmModal";

describe("DeleteConfirmModal", () => {
  const mockOnConfirm = jest.fn();
  const mockOnCancel = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("должен отображать текст подтверждения", () => {
    render(
      <DeleteConfirmModal onConfirm={mockOnConfirm} onCancel={mockOnCancel} />
    );

    expect(
      screen.getByText("Вы точно хотите удалить курс?")
    ).toBeInTheDocument();
    expect(screen.getByText("Прогресс будет утерян.")).toBeInTheDocument();
  });

  it('должен отображать кнопки "Да" и "Нет"', () => {
    render(
      <DeleteConfirmModal onConfirm={mockOnConfirm} onCancel={mockOnCancel} />
    );

    expect(screen.getByText("Да")).toBeInTheDocument();
    expect(screen.getByText("Нет")).toBeInTheDocument();
  });

  it('должен вызывать onConfirm при нажатии на кнопку "Да"', () => {
    render(
      <DeleteConfirmModal onConfirm={mockOnConfirm} onCancel={mockOnCancel} />
    );

    const confirmButton = screen.getByText("Да");
    fireEvent.click(confirmButton);

    expect(mockOnConfirm).toHaveBeenCalledTimes(1);
    expect(mockOnCancel).not.toHaveBeenCalled();
  });

  it('должен вызывать onCancel при нажатии на кнопку "Нет"', () => {
    render(
      <DeleteConfirmModal onConfirm={mockOnConfirm} onCancel={mockOnCancel} />
    );

    const cancelButton = screen.getByText("Нет");
    fireEvent.click(cancelButton);

    expect(mockOnCancel).toHaveBeenCalledTimes(1);
    expect(mockOnConfirm).not.toHaveBeenCalled();
  });

  it("должен вызывать onCancel при клике на overlay", () => {
    render(
      <DeleteConfirmModal onConfirm={mockOnConfirm} onCancel={mockOnCancel} />
    );

    // Находим overlay - это первый div, который содержит modalContent
    const modalContent = screen
      .getByText("Вы точно хотите удалить курс?")
      .closest('[class*="modalContent"]');
    const overlay = modalContent?.parentElement;

    expect(overlay).toBeTruthy();
    if (overlay) {
      fireEvent.click(overlay);
      expect(mockOnCancel).toHaveBeenCalled();
    }
  });

  it("не должен вызывать onCancel при клике на содержимое модального окна", () => {
    render(
      <DeleteConfirmModal onConfirm={mockOnConfirm} onCancel={mockOnCancel} />
    );

    const modalContent = screen.getByText("Вы точно хотите удалить курс?");
    fireEvent.click(modalContent);

    // stopPropagation должен предотвратить вызов onCancel
    expect(mockOnCancel).not.toHaveBeenCalled();
  });
});
