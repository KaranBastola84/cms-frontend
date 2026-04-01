export const CANONICAL_PERMISSION_KEYS = [
  "dashboard",
  "view-students",
  "manage-students",
  "courses-batches",
  "attendance",
  "inquiries",
  "payment-finance",
  "student-documents",
  "reports",
];

export const LEGACY_PERMISSION_ALIASES = {
  "view-courses": "courses-batches",
  "course-management": "courses-batches",
  "batch-schedule": "courses-batches",
  "view-classes": "courses-batches",
  "view-schedule": "courses-batches",
  "view-inquiries": "inquiries",
  "student-registration": "manage-students",
};

const CANONICAL_PERMISSION_SET = new Set(CANONICAL_PERMISSION_KEYS);

export const ROLE_DEFAULT_PERMISSIONS = {
  Admin: [...CANONICAL_PERMISSION_KEYS],
  Staff: [
    "dashboard",
    "view-students",
    "manage-students",
    "courses-batches",
    "attendance",
    "inquiries",
    "payment-finance",
    "reports",
    "student-documents",
  ],
  Trainer: [
    "dashboard",
    "view-students",
    "manage-students",
    "courses-batches",
    "attendance",
    "inquiries",
    "payment-finance",
    "reports",
  ],
  Student: ["dashboard"],
  EnrolledStudent: ["dashboard"],
};

export const CANONICAL_PERMISSION_CATALOG = [
  {
    key: "dashboard",
    name: "Dashboard",
    category: "General",
    description: "Access dashboard features",
  },
  {
    key: "view-students",
    name: "View Students",
    category: "Student Management",
    description: "View student records",
  },
  {
    key: "manage-students",
    name: "Manage Students",
    category: "Student Management",
    description: "Create and update student records",
  },
  {
    key: "student-documents",
    name: "Student Documents",
    category: "Student Management",
    description: "Manage student document workflows",
  },
  {
    key: "courses-batches",
    name: "Courses and Batches",
    category: "Academic",
    description: "Manage courses, schedules, and batches",
  },
  {
    key: "attendance",
    name: "Attendance",
    category: "Academic",
    description: "Manage attendance operations",
  },
  {
    key: "inquiries",
    name: "Inquiries",
    category: "CRM",
    description: "Manage inquiry follow-ups",
  },
  {
    key: "payment-finance",
    name: "Payment and Finance",
    category: "Finance",
    description: "Access payment and finance modules",
  },
  {
    key: "reports",
    name: "Reports",
    category: "Finance",
    description: "Access reporting modules",
  },
];

const normalizeRole = (role) => String(role || "").trim();

export const normalizePermissionKey = (permissionKey) => {
  const key = String(permissionKey || "")
    .trim()
    .toLowerCase();
  return LEGACY_PERMISSION_ALIASES[key] || key;
};

export const isCanonicalPermissionKey = (permissionKey) => {
  const key = normalizePermissionKey(permissionKey);
  return CANONICAL_PERMISSION_SET.has(key);
};

export const normalizePermissionList = (permissions) => {
  if (!Array.isArray(permissions)) return [];

  const mapped = permissions
    .map(normalizePermissionKey)
    .filter((key) => CANONICAL_PERMISSION_SET.has(key));

  return [...new Set(mapped)];
};

export const getDefaultPermissionsForRole = (role) => {
  const normalizedRole = normalizeRole(role);
  return [...(ROLE_DEFAULT_PERMISSIONS[normalizedRole] || [])];
};
