"use client";

import { ChevronRight, ChevronDown, FolderTree } from "lucide-react";

import { useState } from "react";
import { NodeActionMenu } from "./node-action-menu";

function getNextLevel(level: string) {
  switch (level) {
    case "group":
      return "category";

    case "category":
      return "cluster";

    case "cluster":
      return "subcluster";

    default:
      return "subcluster";
  }
}

export function TreeNode({ node, level, editor }: any) {
  const [open, setOpen] = useState(true);

  const children =
    node.categories || node.assetClusters || node.assetSubClusters || [];

  return (
    <div className="ml-4">
      <div
        className="
flex
items-center
justify-between
rounded-lg
border
p-2
"
      >
        {/* hanya area label yg editable */}
        <div
          className="
flex
items-center
gap-2
flex-1
cursor-pointer
"
          onClick={() =>
            editor.editNode({
              id: node.id,
              level,
              data: node,
            })
          }
        >
          {children.length > 0 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setOpen(!open);
              }}
            >
              {open ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </button>
          )}

          <FolderTree size={16} />

          <span>
            {node.code} - {node.name}
          </span>
        </div>

        {/* menu terpisah dari edit click */}
        <div onClick={(e) => e.stopPropagation()}>
          <NodeActionMenu node={node} level={level} editor={editor} />
        </div>
      </div>

      {open && children.length > 0 && (
        <div
          className="
ml-6
mt-2
space-y-2
"
        >
          {children.map((child: any) => (
            <TreeNode
              key={child.id}
              node={child}
              level={getNextLevel(level)}
              editor={editor}
            />
          ))}
        </div>
      )}
    </div>
  );
}
