"use client";

import { useState } from "react";

export type NodeLevel = "group" | "category" | "cluster" | "subcluster";

export function useClassificationEditor() {
  const [selected, setSelected] = useState<any>(null);

  const [mode, setMode] = useState<"create" | "edit">("edit");

  function editNode(node: any) {
    setMode("edit");
    setSelected(node);
  }

  function createChild(level: NodeLevel, parentId?: string) {
    setMode("create");

    setSelected({
      id: "new",
      level,
      parentId,
      data: {
        code: "",
        name: "",
        notes: "",
      },
    });
  }

  function closeEditor() {
    setSelected(null);
  }

  return {
    selected,
    mode,
    editNode,
    createChild,
    closeEditor,
  };
}
