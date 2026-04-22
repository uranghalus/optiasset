/* eslint-disable @typescript-eslint/no-explicit-any */
type BuildAssetFilterArgs = {
  role?: string | null;
  userDepartmentId?: string | null;
  filterDepartmentId?: string[];
  condition?: string[];
  organizationId: string;
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
}: BuildAssetFilterArgs) {
  const where: any = {
    organizationId,
  };

  const isGlobal =
    role === 'owner' || role === 'admin' || role === 'staff_asset';

  // ✅ CONDITION (MULTI)
  if (condition?.length) {
    where.condition = {
      in: condition,
    };
  }

  // ✅ DEPARTMENT LOGIC
  if (isGlobal) {
    if (filterDepartmentId?.length) {
      where.departmentId = {
        in: filterDepartmentId,
      };
    }
  } else {
    where.departmentId = userDepartmentId;
  }

  return where;
}
