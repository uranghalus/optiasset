export function getDepartmentCode(
  organizationSlug: string,
  departmentName: string
) {
  if (!organizationSlug || !departmentName) return '';

  // ambil 3 huruf pertama dari slug
  const orgCode = organizationSlug
    .replace(/[^a-zA-Z]/g, '')
    .slice(0, 3)
    .toUpperCase();

  // buat singkatan department
  const deptCode = departmentName
    .split(' ')
    .filter(Boolean)
    .map((word) => word[0])
    .join('')
    .toUpperCase();

  return `${orgCode}-${deptCode}`;
}
