/* eslint-disable @typescript-eslint/no-explicit-any */
type BuildAssetFilterArgs = {
  role?: string | null;
  userDepartmentId?: string | null;
  filterDepartmentId?: string[];
  condition?: string[];
  organizationId: string;
  categoryId?: string;
  search?: string;
  status?: string;
};

export function isGlobalAccess(role?: string | null) {
  return role === "owner" || role === "admin" || role === "staff_asset";
}

export function buildAssetFilter({
  role,
  userDepartmentId,
  filterDepartmentId,
  condition,
  organizationId,
  categoryId,
  search,
  status,
}: BuildAssetFilterArgs) {
  const where: any = {
    organizationId,
  };

  // Status filter
  if (status) {
    where.status = status;
  }

  if (categoryId) {
    where.item = {
      categoryId,
    };
  }

  const isGlobal = isGlobalAccess(role); // ✅ Bisa pakai fungsi yang sudah dibuat di atas

  // ✅ 1. SEARCH LOGIC (Global Search)
  if (search) {
    where.AND = [
      {
        OR: [
          // 👇 Hapus 'mode: "insensitive"' dari semua baris ini
          { kode_asset: { contains: search } },
          { brand: { contains: search } },
          { model: { contains: search } },
          // Jika ingin search berdasarkan nama item (relasi)
          { item: { name: { contains: search } } },
        ],
      },
    ];
  }

  // ✅ 2. CONDITION (MULTI)
  if (condition?.length) {
    where.condition = {
      in: condition,
    };
  }

  // ✅ 3. DEPARTMENT LOGIC
  if (isGlobal) {
    if (filterDepartmentId?.length) {
      where.departmentId = {
        in: filterDepartmentId,
      };
    }
  } else {
    // User biasa hanya bisa lihat departemen mereka sendiri
    where.departmentId = userDepartmentId;
  }

  return where;
}
