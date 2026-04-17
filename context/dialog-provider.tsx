/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useContext, useState } from "react";
import useDialogState from "@/hooks/use-dialog-state";

// Tipe dialog-nya bisa disesuaikan
export type DialogType = string | null;

type DialogContextType<T> = {
  open: DialogType 
  setOpen: (type: DialogType | null) => void;
  currentRow: T | null;
  setCurrentRow: React.Dispatch<React.SetStateAction<T | null>>;
};

const DialogContext = React.createContext<DialogContextType<any> | undefined>(
  undefined,
);

export function DialogProvider({ children }: { children: React.ReactNode }) {
  // gunakan state generic
  const [open, setOpen] = useDialogState<string>("");
  const [currentRow, setCurrentRow] = useState<any | null>(null);

  return (
    <DialogContext.Provider
      value={{ open, setOpen, currentRow, setCurrentRow }}
    >
      {children}
    </DialogContext.Provider>
  );
}

export function useDialog<T>() {
  const context = useContext(DialogContext);
  if (!context) {
    throw new Error("useDialog must be used within a DialogProvider");
  }

  // kita beri type casting supaya bisa fleksibel
  return context as DialogContextType<T>;
}
