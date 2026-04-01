import apiInstance from "../config/api";
import {
  CANONICAL_PERMISSION_CATALOG,
  getDefaultPermissionsForRole,
  normalizePermissionKey,
  normalizePermissionList,
} from "../constants/permissions";

const normalizeList = (value) => {
  if (!value) return [];

  if (Array.isArray(value)) {
    return value;
  }

  if (Array.isArray(value.permissions)) {
    return value.permissions;
  }

  if (Array.isArray(value.result)) {
    return value.result;
  }

  return [];
};

const normalizeMessages = (error) => {
  const messages = error?.response?.data?.errorMessage;
  if (Array.isArray(messages)) return messages.join(", ");
  if (typeof messages === "string") return messages;
  return error?.response?.data?.message || error?.message || "Request failed";
};

const mapPermissionItem = (item) => {
  if (typeof item === "string") {
    return {
      key: normalizePermissionKey(item),
      name: item,
      description: "",
      category: "General",
    };
  }

  const rawKey = item.key || item.permissionKey || item.name || "";

  return {
    key: normalizePermissionKey(rawKey),
    name: item.label || item.name || item.key || item.permissionKey || "",
    description: item.description || "",
    category: item.category || item.group || "General",
  };
};

const unwrap = (response) => response?.data?.result ?? response?.data;

const CATALOG_BY_KEY = CANONICAL_PERMISSION_CATALOG.reduce((acc, item) => {
  acc[item.key] = item;
  return acc;
}, {});

const toCanonicalPermissionItems = (items) => {
  const map = new Map();

  items.forEach((item) => {
    const mapped = mapPermissionItem(item);
    const key = mapped.key;
    const canonicalMeta = CATALOG_BY_KEY[key];

    if (!canonicalMeta) return;

    map.set(key, {
      key,
      name:
        mapped.name && mapped.name !== key ? mapped.name : canonicalMeta.name,
      description: mapped.description || canonicalMeta.description,
      category: canonicalMeta.category,
    });
  });

  CANONICAL_PERMISSION_CATALOG.forEach((item) => {
    if (!map.has(item.key)) {
      map.set(item.key, item);
    }
  });

  return Array.from(map.values());
};

const permissionService = {
  getAllPermissions: async () => {
    try {
      const response = await apiInstance.get("/api/permissions");
      const payload = normalizeList(unwrap(response));

      // API returns grouped shape: [{ group, permissions: [{ key, label }] }]
      const flattened = payload.flatMap((groupItem) => {
        const groupName = groupItem?.group || "General";
        const permissions = normalizeList(groupItem?.permissions);
        return permissions.map((permission) => ({
          ...permission,
          group: groupName,
        }));
      });

      return toCanonicalPermissionItems(flattened);
    } catch (error) {
      throw new Error(
        normalizeMessages(error) || "Failed to fetch permissions",
      );
    }
  },

  getRolePermissions: async (role) => {
    try {
      const response = await apiInstance.get(`/api/permissions/roles/${role}`);
      const payload = unwrap(response);

      const rawPermissions = normalizeList(payload).map((x) =>
        typeof x === "string" ? x : x.key || x.permissionKey,
      );
      const normalized = normalizePermissionList(rawPermissions);

      return normalized.length > 0
        ? normalized
        : getDefaultPermissionsForRole(role);
    } catch (error) {
      throw new Error(
        normalizeMessages(error) ||
          `Failed to fetch permissions for role ${role}`,
      );
    }
  },

  updateRolePermissions: async (role, permissions) => {
    try {
      const normalizedPermissions = normalizePermissionList(permissions);
      const response = await apiInstance.put(`/api/permissions/roles/${role}`, {
        permissions: normalizedPermissions,
      });
      return unwrap(response);
    } catch (error) {
      throw new Error(
        normalizeMessages(error) ||
          `Failed to update permissions for role ${role}`,
      );
    }
  },

  getUserPermissions: async (userId) => {
    try {
      const response = await apiInstance.get(
        `/api/permissions/users/${userId}`,
      );
      const payload = unwrap(response);

      if (Array.isArray(payload)) {
        return {
          role: null,
          effectivePermissions: normalizePermissionList(payload),
          overrides: [],
        };
      }

      return {
        userId: payload?.userId || null,
        username: payload?.username || "",
        role: payload?.role || payload?.userRole || null,
        rolePermissions: normalizePermissionList(payload?.rolePermissions),
        grantedOverrides: normalizePermissionList(payload?.grantedOverrides),
        revokedOverrides: normalizePermissionList(payload?.revokedOverrides),
        effectivePermissions: normalizePermissionList(
          payload?.effectivePermissions || payload?.permissions || payload,
        ),
      };
    } catch (error) {
      throw new Error(
        normalizeMessages(error) ||
          `Failed to fetch permissions for user ${userId}`,
      );
    }
  },

  updateUserPermissions: async (userId, grant = [], revoke = []) => {
    try {
      const normalizedGrant = normalizePermissionList(grant);
      const normalizedRevoke = normalizePermissionList(revoke);

      const response = await apiInstance.put(
        `/api/permissions/users/${userId}`,
        {
          grant: normalizedGrant,
          revoke: normalizedRevoke,
        },
      );
      const payload = unwrap(response);
      return {
        userId: payload?.userId || null,
        username: payload?.username || "",
        role: payload?.role || payload?.userRole || null,
        rolePermissions: normalizePermissionList(payload?.rolePermissions),
        grantedOverrides: normalizePermissionList(payload?.grantedOverrides),
        revokedOverrides: normalizePermissionList(payload?.revokedOverrides),
        effectivePermissions: normalizePermissionList(
          payload?.effectivePermissions,
        ),
      };
    } catch (error) {
      throw new Error(
        normalizeMessages(error) ||
          `Failed to update user overrides for user ${userId}`,
      );
    }
  },
};

export default permissionService;
