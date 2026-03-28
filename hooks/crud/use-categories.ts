import { createCategory, getAllCategories } from "@/action/category-action";
import { PaginationState } from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// Get all categories
export function useCategories({ page, pageSize }: PaginationState) {
    return useQuery({
        queryKey: ["categories", page, pageSize],
        queryFn: () => getAllCategories({ page, pageSize }),
    })
}

// Create category
export function useCreateCategory() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (formData: FormData) => createCategory(formData),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["categories"] })
        }
    })
}
