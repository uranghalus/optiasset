import { useClassificationTree } from "@/hooks/crud/use-asset-classification";
import { TreeNode } from "./tree-node";

export function ClassificationTree({ editor }: any) {
  const { data, isLoading } = useClassificationTree();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-4 space-y-2">
      {data?.map((group) => (
        <TreeNode key={group.id} node={group} level="group" editor={editor} />
      ))}
    </div>
  );
}
