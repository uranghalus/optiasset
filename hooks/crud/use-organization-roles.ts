'use client'


import { getAllRoles } from "@/action/role-action";
import { PaginationState } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

export function useOrganizationRoles() {
    const [pagination, setPagination] = useState<PaginationState>({
        page: 1,
        pageSize: 10,
    });

    const { data, isLoading, error } = useQuery({
        queryKey: ["roles", pagination.page, pagination.pageSize],
        queryFn: () => getAllRoles(pagination),
    });

    return {
        data,
        isLoading,
        error,
        pagination,
        setPagination,
    };
}