/**
 * Navigation Configuration
 * Single nav model filtered by role
 */

export const ROLES = {
  INSPECTOR: 'inspector',
  CENTER_MANAGER: 'centerManager',
  DIRECTOR: 'director',
  AUDITOR: 'auditor',
  ADMIN: 'admin',
  FINANCE_MANAGER: 'financeManager',
  SECURITY_OFFICER: 'securityOfficer',
  INTERNAL_DEV: 'internalDev',
};

const ALL_ROLES = Object.values(ROLES);

export const PRIMARY_TOP_NAV = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: 'home',
    route: '/dashboard',
    roles: ALL_ROLES,
  },
  {
    id: 'inspections',
    label: 'Inspections',
    icon: 'clipboard-list',
    route: '/inspections',
    roles: [ROLES.INSPECTOR, ROLES.CENTER_MANAGER],
    children: [
      { id: 'inspections.new', label: 'New Inspection', route: '/inspection', roles: [ROLES.INSPECTOR, ROLES.CENTER_MANAGER] },
      { id: 'inspections.active', label: 'Active Inspections', route: '/inspections/active', roles: [ROLES.INSPECTOR, ROLES.CENTER_MANAGER] },
      { id: 'inspections.completed', label: 'Completed Inspections', route: '/inspections/completed', roles: [ROLES.INSPECTOR, ROLES.CENTER_MANAGER] },
      { id: 'inspections.vehicleHistory', label: 'Vehicle History', route: '/inspections/vehicle-history', roles: [ROLES.INSPECTOR, ROLES.CENTER_MANAGER, ROLES.AUDITOR] },
      { id: 'inspections.retests', label: 'Re-tests & Exceptions', route: '/inspections/retests', roles: [ROLES.INSPECTOR, ROLES.CENTER_MANAGER] },
    ],
  },
  {
    id: 'payments',
    label: 'Payments',
    icon: 'credit-card',
    route: '/payments',
    roles: [ROLES.CENTER_MANAGER, ROLES.FINANCE_MANAGER, ROLES.ADMIN],
    children: [
      { id: 'payments.dashboard', label: 'Payment Dashboard', route: '/payments/dashboard', roles: [ROLES.CENTER_MANAGER, ROLES.FINANCE_MANAGER, ROLES.ADMIN] },
      { id: 'payments.transactions', label: 'Transactions', route: '/payments/transactions', roles: [ROLES.CENTER_MANAGER, ROLES.FINANCE_MANAGER, ROLES.ADMIN] },
      { id: 'payments.fees', label: 'Fee Configuration', route: '/payments/fees', roles: [ROLES.FINANCE_MANAGER, ROLES.ADMIN] },
      { id: 'payments.reports', label: 'Reconciliation & Reports', route: '/payments/reports', roles: [ROLES.CENTER_MANAGER, ROLES.FINANCE_MANAGER, ROLES.ADMIN] },
    ],
  },
  {
    id: 'analytics',
    label: 'Analytics',
    icon: 'chart-bar',
    route: '/analytics',
    roles: [ROLES.DIRECTOR, ROLES.CENTER_MANAGER, ROLES.AUDITOR, ROLES.ADMIN],
    children: [
      { id: 'analytics.executive', label: 'Executive Dashboard', route: '/analytics/executive', roles: [ROLES.DIRECTOR, ROLES.ADMIN] },
      { id: 'analytics.failures', label: 'Failure Analysis', route: '/analytics/failures', roles: [ROLES.DIRECTOR, ROLES.CENTER_MANAGER, ROLES.AUDITOR, ROLES.ADMIN] },
      { id: 'analytics.centers', label: 'Center Performance', route: '/analytics/centers', roles: [ROLES.DIRECTOR, ROLES.CENTER_MANAGER, ROLES.ADMIN] },
      { id: 'analytics.compliance', label: 'Compliance & SLA', route: '/analytics/compliance', roles: [ROLES.DIRECTOR, ROLES.AUDITOR, ROLES.ADMIN] },
    ],
  },
  {
    id: 'centers',
    label: 'Centers',
    icon: 'building',
    route: '/centers',
    roles: [ROLES.ADMIN, ROLES.CENTER_MANAGER, ROLES.INSPECTOR],
    children: [
      { id: 'centers.list', label: 'Centers', route: '/centers/list', roles: [ROLES.ADMIN, ROLES.CENTER_MANAGER] },
      { id: 'centers.lanes', label: 'Lanes & Machines', route: '/centers/lanes', roles: [ROLES.ADMIN, ROLES.CENTER_MANAGER] },
      { id: 'centers.machineStatus', label: 'Machine Status', route: '/machine-status', roles: [ROLES.ADMIN, ROLES.CENTER_MANAGER, ROLES.INSPECTOR] },
      { id: 'centers.vms', label: 'VMS Integration', route: '/centers/vms', roles: [ROLES.ADMIN] },
      { id: 'centers.staff', label: 'Technicians & Staff', route: '/centers/staff', roles: [ROLES.ADMIN, ROLES.CENTER_MANAGER] },
    ],
  },
  {
    id: 'admin',
    label: 'Admin',
    icon: 'shield-check',
    route: '/admin',
    roles: [ROLES.ADMIN, ROLES.SECURITY_OFFICER, ROLES.INTERNAL_DEV],
    children: [
      { id: 'admin.users', label: 'User Management', route: '/admin/users', roles: [ROLES.ADMIN] },
      { id: 'admin.roles', label: 'Roles & Permissions', route: '/admin/roles', roles: [ROLES.ADMIN] },
      { id: 'admin.logs', label: 'Audit Logs', route: '/admin/logs', roles: [ROLES.ADMIN, ROLES.SECURITY_OFFICER] },
      { id: 'admin.security', label: 'Security Settings', route: '/admin/security', roles: [ROLES.ADMIN, ROLES.SECURITY_OFFICER] },
      { id: 'admin.health', label: 'System Health', route: '/admin/health', roles: [ROLES.ADMIN, ROLES.SECURITY_OFFICER] },
      { id: 'admin.devTools', label: 'Dev Tools', route: '/admin/dev-tools', roles: [ROLES.INTERNAL_DEV, ROLES.ADMIN] },
      { id: 'admin.apis', label: 'APIs', route: '/admin/apis', roles: [ROLES.INTERNAL_DEV, ROLES.ADMIN] },
    ],
  },
  {
    id: 'help',
    label: 'Help',
    icon: 'question-mark-circle',
    route: '/help',
    roles: ALL_ROLES,
  },
];

/**
 * Filter nav items by role
 */
export function getNavForRole(role) {
  return PRIMARY_TOP_NAV
    .filter((item) => item.roles.includes(role))
    .map((item) => ({
      ...item,
      children: item.children?.filter((child) => child.roles.includes(role)),
    }));
}

/**
 * Design tokens
 */
export const DESIGN_TOKENS = {
  colors: {
    primary: '#88bf47',
    primaryDark: '#0fa84a',
    primaryLight: '#88bf47',
    secondary: '#1d8dcc',
    accent: '#1d8dcc',
    success: '#0fa84a',
    error: '#DC2626',
    warning: '#F59E0B',
    bg: '#F4F6F5',
    bgDark: '#1F2937',
    text: '#111827',
    textMuted: '#6B7280',
    border: '#E5E7EB',
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
  },
  fontSizes: {
    xs: '11px',
    sm: '12px',
    md: '14px',
    lg: '16px',
    xl: '20px',
  },
  borderRadius: {
    sm: '4px',
    md: '8px',
    lg: '12px',
  },
};

/**
 * Keyboard shortcuts
 */
export const KEYBOARD_SHORTCUTS = {
  newInspection: { key: 'n', ctrl: true, label: 'Ctrl+N', action: 'New Inspection' },
  search: { key: 'f', ctrl: true, label: 'Ctrl+F', action: 'Search' },
  dashboard: { key: 'd', ctrl: true, label: 'Ctrl+D', action: 'Dashboard' },
  print: { key: 'p', ctrl: true, label: 'Ctrl+P', action: 'Print/Export' },
};

