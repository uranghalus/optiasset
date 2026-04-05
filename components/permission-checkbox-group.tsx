"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PERMISSIONS, PERMISSION_LABELS } from "@/constants/permissions";

type Props = {
  value: Record<string, string[]>;
  onChange: (value: Record<string, string[]>) => void;
};

export function PermissionCheckboxGroup({ value, onChange }: Props) {
  const toggle = (resource: string, action: string, checked: boolean) => {
    const current = value[resource] ?? [];
    const updated = checked
      ? [...new Set([...current, action])]
      : current.filter((a) => a !== action);

    const next = { ...value };
    if (updated.length === 0) delete next[resource];
    else next[resource] = updated;

    onChange(next);
  };

  return (
    <ScrollArea className="h-[380px] pr-3">
      <div className="space-y-3">
        {Object.entries(PERMISSIONS).map(([resource, actions]) => {
          // Berapa aksi yang sudah dicentang untuk resource ini
          const checkedCount = value[resource]?.length ?? 0;
          const label = PERMISSION_LABELS[resource] ?? resource;

          return (
            <div key={resource} className="rounded-md border p-3">
              {/* Header resource */}
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-semibold">{label}</h4>
                {checkedCount > 0 && (
                  <span className="text-xs text-muted-foreground">
                    {checkedCount}/{actions.length} dipilih
                  </span>
                )}
              </div>

              {/* Daftar aksi */}
              <div className="grid grid-cols-2 gap-2">
                {(actions as readonly string[]).map((action) => {
                  const checked = value[resource]?.includes(action) ?? false;
                  return (
                    <Label
                      key={action}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <Checkbox
                        checked={checked}
                        onCheckedChange={(v) =>
                          toggle(resource, action, Boolean(v))
                        }
                      />
                      <span className="text-sm capitalize">
                        {action.replace(/_/g, " ")}
                      </span>
                    </Label>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
}
