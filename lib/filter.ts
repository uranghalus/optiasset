/* eslint-disable @typescript-eslint/no-explicit-any */
type BuildAssetFilterArgs = {
  role?: string | null;
  userDepartmentId?: string | null;
  filterDepartmentId?: string[];
  condition?: string[];
  organizationId: string;
  search?: string;
};

export function isGlobalAccess(role?: string | null) {
  return role === 'owner' || role === 'admin' || role === 'staff_asset';
}

export function buildAssetFilter({
  role,
  userDepartmentId,
  filterDepartmentId,
  condition,
  organizationId,
  search, // 👈 Tambahkan parameter ini
}: BuildAssetFilterArgs & { search?: string }) { // Pastikan type args mendukung search
  const where: any = {
    organizationId,
  };

  const isGlobal =
    role === 'owner' || role === 'admin' || role === 'staff_asset';

  // ✅ 1. SEARCH LOGIC (Global Search)
  if (search) {
    where.AND = [
      {
        OR: [
          { kode_asset: { contains: search, mode: 'insensitive' } },
          { brand: { contains: search, mode: 'insensitive' } },
          { model: { contains: search, mode: 'insensitive' } },
          // Jika ingin search berdasarkan nama item (relasi)
          { item: { name: { contains: search, mode: 'insensitive' } } },
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