"use client";
import { useDialog } from "@/context/dialog-provider";
import React from "react";
import ClassificationImportDialog from "./classification-import-dialog";

export default function ClassificationDialog() {
  const { open, setOpen } = useDialog();
  return (
    <ClassificationImportDialog
      key={"import-golongan"}
      open={open == "import-golongan"}
      onOpenChange={() => setOpen("import-golongan")}
    />
  );
}
