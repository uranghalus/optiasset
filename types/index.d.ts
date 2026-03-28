export type ActionState = {
  status: 'idle' | 'success' | 'error';
  message?: string;
  fieldErrors?: Record<string, string>;
};
export type PaginationState = {
  page: number;
  pageSize: number;
  total?: number;
  totalPages?: number;
}

/* ===================== */
/* SIDEBAR TYPES */
/* ===================== */

export type Team = {
  name: string;
  logo: React.ElementType;
  plan: string;
};

export type BaseNavItem = {
  title: string;
  badge?: string;
  icon?: React.ElementType;
  permission?: PermissionRequirement;
  /** Jika diisi, hanya role yang ada di array ini yang bisa melihat item ini.
   *  Jika tidak diisi (undefined), item visible untuk semua role. */
  roles?: string[];
};

export type NavLink = BaseNavItem & {
  url: LinkProps['to'] | (string & {});
  items?: never;
};

export type NavCollapsible = BaseNavItem & {
  items: NavItem[];
  url?: never;
};

export type NavItem = NavLink | NavCollapsible;

export type NavGroup = {
  title: string;
  items: NavItem[];
  /** Jika diisi, seluruh group ini hanya tampil untuk role yang terdaftar. */
  roles?: string[];
};

export type SidebarData = {
  user?: User;
  teams: Team[];
  navGroups: NavGroup[];
};
