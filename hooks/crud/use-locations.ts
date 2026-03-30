import {
  createLocation,
  deleteLocation,
  getAllLocations,
  updateLocation,
} from "@/action/location-action";
import { PaginationState } from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// Get all locations
export function useLocations({ page, pageSize }: PaginationState) {
  return useQuery({
    queryKey: ["locations", page, pageSize],
    queryFn: () => getAllLocations({ page, pageSize }),
  });
}

// Create location
export function useCreateLocation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (formData: FormData) => createLocation(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["locations"] });
    },
  });
}

// Update location
export function useUpdateLocation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, formData }: { id: string; formData: FormData }) =>
      updateLocation(id, formData),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["locations"],
      });
    },
  });
}

// Delete location
export function useDeleteLocation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteLocation(id),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["locations"],
      });
    },
  });
}
