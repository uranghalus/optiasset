"use client";

import { useState } from "react";

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";

import { useClassificationEditor } from "@/hooks/crud/use-asset-classification";

import { ClassificationCards } from "./classification-cards";

import { TaxonomyEditorPanel } from "./taxonomy-editor-panel";

import { TaxonomyToolbar } from "./taxonomy-toolbar";

export default function AssetTaxonomyPage() {
  const editor = useClassificationEditor();
  const [search, setSearch] = useState("");

  return (
    <div className="h-[calc(100vh-170px)] flex flex-col overflow-hidden rounded-lg border bg-card">
      <TaxonomyToolbar
        search={search}
        setSearch={setSearch}
        onCreateGroup={() => editor.createChild("group", "")}
      />

      <ResizablePanelGroup orientation="horizontal" className="flex-1">
        <ResizablePanel
          defaultSize={40}
          className="bg-gradient-to-b from-background to-muted/20"
        >
          <ClassificationCards editor={editor} search={search} />
        </ResizablePanel>

        <ResizableHandle withHandle />

        <ResizablePanel defaultSize={60}>
          <TaxonomyEditorPanel editor={editor} />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
