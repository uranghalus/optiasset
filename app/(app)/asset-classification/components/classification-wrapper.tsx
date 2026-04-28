"use client";

import { useState } from "react";

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";

import { useClassificationEditor } from "@/hooks/crud/use-asset-classification";

import { ClassificationTree } from "./classification-tree";

import { TaxonomyEditorPanel } from "./taxonomy-editor-panel";

import { TaxonomyToolbar } from "./taxonomy-toolbar";

export default function AssetTaxonomyPage() {
  const editor = useClassificationEditor();
  const [expandAll, setExpandAll] = useState(false);

  const expandTree = () => setExpandAll(true);

  const collapseTree = () => setExpandAll(false);
  const [search, setSearch] = useState("");

  return (
    <div className="h-[calc(100vh-100px)] flex flex-col">
      <TaxonomyToolbar
        search={search}
        setSearch={setSearch}
        onCreateGroup={() => editor.createChild("group", "")}
        onExpandAll={() => {
          // nanti connect ke tree expansion state
          expandTree();
        }}
        onCollapseAll={() => {
          // nanti connect ke tree expansion state
          collapseTree();
        }}
      />

      <ResizablePanelGroup orientation="horizontal" className="flex-1">
        <ResizablePanel defaultSize={35}>
          <ClassificationTree editor={editor} search={search} />
        </ResizablePanel>

        <ResizableHandle />

        <ResizablePanel defaultSize={65}>
          <TaxonomyEditorPanel editor={editor} />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
