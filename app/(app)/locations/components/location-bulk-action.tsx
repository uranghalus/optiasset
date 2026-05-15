"use client";
import { DataTableBulkActions } from "@/components/datatable/datatable-bulk-action";
import { Button } from "@/components/ui/button";
import { useDialog } from "@/context/dialog-provider";
import { Location } from "@/generated/prisma";
import { Table } from "@tanstack/react-table";
import { Trash2 } from "lucide-react";
import LocationMultiDeleteDialog from "./location-multi-delete-dialog";
interface LocationBulkActionProps<TData> {
  table: Table<TData>;
}
function LocationBulkAction<TData>({ table }: LocationBulkActionProps<TData>) {
  const { open, setOpen } = useDialog();
  const selectedRows = table.getFilteredSelectedRowModel().rows;
  const selectedLocations = selectedRows.map((row) => row.original as Location);
  const handleOpenDelete = () => {
    if (selectedLocations.length === 0) return;
    setOpen("delete-locations");
  };
  return (
    <>
      <DataTableBulkActions table={table} entityName="location">
        <Button
          variant="destructive"
          size="sm"
          onClick={handleOpenDelete}
          disabled={selectedLocations.length === 0}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Delete ({selectedLocations.length})
        </Button>
      </DataTableBulkActions>
      <LocationMultiDeleteDialog
        open={open === "delete-locations"}
        onOpenChange={(value) => setOpen("delete-locations")}
        table={table}
      />
    </>
  );
}

export default LocationBulkAction;
