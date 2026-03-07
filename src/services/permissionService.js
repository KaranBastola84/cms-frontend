import apiInstance from "../config/api";

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
      key: item,
      name: item,
      description: "",
      category: "General",
    };
  }

  return {
    key: item.key || item.permissionKey || item.name || "",
    name: item.label || item.name || item.key || item.permissionKey || "",
    description: item.description || "",
    category: item.category || item.group || "General",
  };
};

const unwrap = (response) => response?.data?.result ?? response?.data;

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

      return flattened.map(mapPermissionItem).filter((x) => x.key);
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
      return normalizeList(payload)
        .map((x) => (typeof x === "string" ? x : x.key || x.permissionKey))
        .filter(Boolean);
    } catch (error) {
      throw new Error(
        normalizeMessages(error) ||
          `Failed to fetch permissions for role ${role}`,
      );
    }
  },

  updateRolePermissions: async (role, permissions) => {
    try {
      const response = await apiInstance.put(`/api/permissions/roles/${role}`, {
        permissions,
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
          effectivePermissions: payload,
          overrides: [],
        };
      }

      return {
        userId: payload?.userId || null,
        username: payload?.username || "",
        role: payload?.role || payload?.userRole || null,
        rolePermissions: normalizeList(payload?.rolePermissions),
        grantedOverrides: normalizeList(payload?.grantedOverrides),
        revokedOverrides: normalizeList(payload?.revokedOverrides),
        effectivePermissions: normalizeList(
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
      const response = await apiInstance.put(
        `/api/permissions/users/${userId}`,
        {
          grant,
          revoke,
        },
      );
      const payload = unwrap(response);
      return {
        userId: payload?.userId || null,
        username: payload?.username || "",
        role: payload?.role || payload?.userRole || null,
        rolePermissions: normalizeList(payload?.rolePermissions),
        grantedOverrides: normalizeList(payload?.grantedOverrides),
        revokedOverrides: normalizeList(payload?.revokedOverrides),
        effectivePermissions: normalizeList(payload?.effectivePermissions),
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
