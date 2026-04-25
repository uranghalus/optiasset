"use client";

import React from "react";
import { Row } from "@tanstack/react-table";

import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";

import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuLabel,
    DropdownMenuItem,
    DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";

import {
    useDialog
} from "@/context/dialog-provider";

import {
    usePermission
} from "@/hooks/use-permission";

import {
    Pencil,
    Trash2,
    Plus,
    FolderTree,
    ArrowUpDown,
    MoreHorizontalIcon
} from "lucide-react";


interface ClassificationNode {
    id: string;
    code: string;
    name: string;
    level:
    "GROUP"
    | "CATEGORY"
    | "CLUSTER"
    | "SUBCLUSTER";
}

interface DataTableRowActionsProps<TData> {
    row: Row<TData>
}

export default function ClassificationRowAction<TData>({
    row
}: DataTableRowActionsProps<TData>) {

    const node =
        row.original as ClassificationNode;

    const {
        setOpen,
        setCurrentRow
    } = useDialog();

    const { can } =
        usePermission();


    const childLabel = {
        GROUP: "Tambah Kategori",
        CATEGORY: "Tambah Kelompok",
        CLUSTER: "Tambah Sub",
        SUBCLUSTER: null
    };

    return (

        <ButtonGroup>

            {/* PRIMARY DELETE */}
            {can("asset.classification", ["delete"])
                &&
                <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => {
                        setCurrentRow(node);
                        setOpen("delete");
                    }}
                >
                    <Trash2 className="h-4 w-4" />
                </Button>
            }



            {/* PRIMARY EDIT */}
            {can("asset.classification", ["edit"])
                &&
                <Button
                    variant="outline"
                    size="icon"
                    onClick={() => {
                        setCurrentRow(node);
                        setOpen("edit");
                    }}
                >
                    <Pencil className="h-4 w-4" />
                </Button>
            }



            {/* PRIMARY ADD CHILD */}
            {childLabel[node.level]
                &&
                can("asset.classification", ["create"])
                &&
                <Button
                    variant="outline"
                    size="icon"
                    onClick={() => {
                        setCurrentRow(node);
                        setOpen("add-child");
                    }}
                >
                    <Plus className="h-4 w-4" />
                </Button>
            }



            <DropdownMenu>

                <DropdownMenuTrigger asChild>
                    <Button
                        variant="outline"
                        size="icon"
                    >
                        <MoreHorizontalIcon />
                    </Button>
                </DropdownMenuTrigger>


                <DropdownMenuContent
                    align="end"
                    className="w-52"
                >

                    <DropdownMenuGroup>

                        <DropdownMenuLabel>
                            Hierarki
                        </DropdownMenuLabel>

                        <DropdownMenuItem
                            onClick={() => {
                                setCurrentRow(node);
                                setOpen("view-tree");
                            }}
                        >
                            <FolderTree className="h-4 w-4 mr-2" />
                            Lihat Struktur
                        </DropdownMenuItem>


                        {node.level !== "GROUP" && (
                            <DropdownMenuItem
                                onClick={() => {
                                    setCurrentRow(node);
                                    setOpen("move-parent");
                                }}
                            >
                                <ArrowUpDown className="h-4 w-4 mr-2" />
                                Pindah Parent
                            </DropdownMenuItem>
                        )}

                    </DropdownMenuGroup>



                    <DropdownMenuGroup>

                        <DropdownMenuLabel>
                            Konfigurasi
                        </DropdownMenuLabel>

                        <DropdownMenuItem
                            onClick={() => {
                                setCurrentRow(node);
                                setOpen("duplicate");
                            }}
                        >
                            Duplicate
                        </DropdownMenuItem>

                        <DropdownMenuItem
                            onClick={() => {
                                setCurrentRow(node);
                                setOpen("archive");
                            }}
                        >
                            Archive
                        </DropdownMenuItem>

                    </DropdownMenuGroup>

                    <DropdownMenuSeparator />

                </DropdownMenuContent>

            </DropdownMenu>

        </ButtonGroup>

    )

}