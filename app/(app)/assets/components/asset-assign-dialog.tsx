/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import React from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Combobox } from "@/components/ui/combobox";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

import {
    Field,
    FieldError,
    FieldLabel
} from "@/components/ui/field";

import { Asset } from "@/generated/prisma/client";

import { useDepartmentsForSelect }
    from "@/hooks/crud/use-divisi";

import {
    useUsersByDepartment
} from "@/hooks/crud/use-users";

import {
    AssignForm,
    AssignSchema
} from "@/schema/assign-schema";
import { useAssignAsset } from "@/hooks/crud/use-asset-loans";

type Props = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    currentRow: Asset;
};

export default function AssetAssignDialog({
    open,
    onOpenChange,
    currentRow
}: Props) {

    const form = useForm<AssignForm>({
        resolver: zodResolver(
            AssignSchema
        ),
        defaultValues: {
            departmentId: "",
            user_id: "",
        }
    });

    const departmentId =
        form.watch("departmentId");

    const {
        data: departments = [],
        isLoading: isDeptLoading
    } = useDepartmentsForSelect();

    const {
        data: users = [],
        isLoading: isUserLoading
    } = useUsersByDepartment(
        departmentId
    );
    const assignMutation =
        useAssignAsset(
            () => {
                onOpenChange(false);
                form.reset();
            }
        );
    function onSubmit(
        values: AssignForm
    ) {
        assignMutation.mutate({
            assetId:
                currentRow.id,

            departmentId:
                values.departmentId,

            userId:
                values.user_id
        });
    }


    return (
        <Dialog
            open={open}
            onOpenChange={onOpenChange}
        >
            <DialogContent
                onPointerDownOutside={(e) =>
                    e.preventDefault()
                }
                onEscapeKeyDown={(e) =>
                    e.preventDefault()
                }
                showCloseButton={false}
            >

                <DialogHeader>
                    <DialogTitle>
                        Serah Terima Asset
                    </DialogTitle>

                    <DialogDescription>
                        Fitur ini digunakan untuk
                        melakukan serah terima asset
                        kepada pengguna lain.
                    </DialogDescription>
                </DialogHeader>


                <form
                    onSubmit={form.handleSubmit(
                        onSubmit
                    )}
                    className="space-y-5 max-h-[60vh] overflow-y-auto"
                >

                    {/* DEPARTMENT */}

                    <Controller
                        name="departmentId"
                        control={form.control}
                        render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid}>
                                <FieldLabel>Departemen</FieldLabel>
                                <Combobox<{
                                    id_department: string;
                                    nama_department: string;
                                }>
                                    title="Cari Departemen"
                                    valueKey="id_department"
                                    value={departments?.find((loc) => loc.id_department === field.value)}
                                    searchFn={(search: string, offset: number, size: number) =>
                                        Promise.resolve(
                                            departments
                                                ?.filter((loc) =>
                                                    loc.nama_department.toLowerCase().includes(search.toLowerCase())
                                                )
                                                .slice(offset, offset + size) || []
                                        )
                                    }
                                    renderText={(loc) => loc.nama_department}
                                    onChange={(loc) => field.onChange(loc.id_department)}
                                />
                            </Field>
                        )}
                    />


                    {/* USER / PIC */}
                    <Controller
                        name="user_id"
                        control={form.control}
                        render={({
                            field,
                            fieldState
                        }) => (
                            <Field
                                data-invalid={
                                    fieldState.invalid
                                }
                            >
                                <FieldLabel>
                                    Penerima Asset
                                </FieldLabel>

                                <Combobox<any>
                                    title={
                                        !departmentId
                                            ? "Pilih Department dulu"
                                            : "Cari User"
                                    }

                                    disabled={
                                        !departmentId ||
                                        isUserLoading
                                    }

                                    valueKey="user_id"

                                    value={
                                        users.find(
                                            (u) =>
                                                u.value === field.value
                                        )
                                    }

                                    searchFn={(
                                        search,
                                        offset,
                                        size
                                    ) =>
                                        Promise.resolve(
                                            users
                                                .filter((u) =>
                                                    u.label
                                                        .toLowerCase()
                                                        .includes(
                                                            search.toLowerCase()
                                                        )
                                                )
                                                .slice(
                                                    offset,
                                                    offset + size
                                                )
                                        )
                                    }

                                    renderText={(item) =>
                                        item.label
                                    }

                                    onChange={(item) =>
                                        field.onChange(
                                            item.value
                                        )
                                    }
                                />

                                {fieldState.invalid && (
                                    <FieldError
                                        errors={[
                                            fieldState.error
                                        ]}
                                    />
                                )}

                            </Field>
                        )}
                    />



                    <DialogFooter>

                        <DialogClose asChild>
                            <Button variant="outline">
                                Close
                            </Button>
                        </DialogClose>

                        <Button
                            type="submit"
                        >
                            Assign Asset
                        </Button>

                    </DialogFooter>

                </form>

            </DialogContent>
        </Dialog>
    )
}