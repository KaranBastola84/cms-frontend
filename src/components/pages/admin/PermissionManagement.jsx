import React, { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Loader2, RefreshCw, Save, ShieldCheck, UserCog } from "lucide-react";
import permissionService from "../../../services/permissionService";

const ROLE_LIST = ["Staff", "Trainer", "Student"];

const toSet = (arr) => new Set(Array.isArray(arr) ? arr : []);

const PermissionManagement = () => {
  const [loading, setLoading] = useState(true);
  const [savingRole, setSavingRole] = useState("");
  const [permissions, setPermissions] = useState([]);
  const [rolePermissions, setRolePermissions] = useState({
    Staff: new Set(),
    Trainer: new Set(),
    Student: new Set(),
  });

  const [userId, setUserId] = useState("");
  const [username, setUsername] = useState("");
  const [userRole, setUserRole] = useState("");
  const [userLoading, setUserLoading] = useState(false);
  const [userLoaded, setUserLoaded] = useState(false);
  const [savingUser, setSavingUser] = useState(false);
  const [userEffectiveSet, setUserEffectiveSet] = useState(new Set());
  const [userInitialSet, setUserInitialSet] = useState(new Set());
  const [userRoleSet, setUserRoleSet] = useState(new Set());
  const [grantedOverrides, setGrantedOverrides] = useState([]);
  const [revokedOverrides, setRevokedOverrides] = useState([]);

  const groupedPermissions = useMemo(() => {
    const groups = {};
    permissions.forEach((item) => {
      const category = item.category || "General";
      if (!groups[category]) groups[category] = [];
      groups[category].push(item);
    });
    return groups;
  }, [permissions]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [master, staffPerms, trainerPerms, studentPerms] =
        await Promise.all([
          permissionService.getAllPermissions(),
          permissionService.getRolePermissions("Staff"),
          permissionService.getRolePermissions("Trainer"),
          permissionService.getRolePermissions("Student"),
        ]);

      setPermissions(master);
      setRolePermissions({
        Staff: toSet(staffPerms),
        Trainer: toSet(trainerPerms),
        Student: toSet(studentPerms),
      });
    } catch (error) {
      toast.error(error.message || "Failed to load permission management data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const toggleRolePermission = (role, key) => {
    setRolePermissions((prev) => {
      const next = {
        ...prev,
        [role]: new Set(prev[role]),
      };

      if (next[role].has(key)) {
        next[role].delete(key);
      } else {
        next[role].add(key);
      }

      return next;
    });
  };

  const saveRole = async (role) => {
    setSavingRole(role);
    try {
      await permissionService.updateRolePermissions(
        role,
        Array.from(rolePermissions[role] || []),
      );
      toast.success(`${role} permissions updated`);
    } catch (error) {
      toast.error(error.message || `Failed to update ${role} permissions`);
    } finally {
      setSavingRole("");
    }
  };

  const loadUserPermissions = async () => {
    const parsedId = Number(userId);
    if (!Number.isInteger(parsedId) || parsedId <= 0) {
      toast.error("Enter a valid user ID");
      return;
    }

    setUserLoading(true);
    try {
      const data = await permissionService.getUserPermissions(parsedId);
      const effective = toSet(data.effectivePermissions);
      const roleSet = toSet(data.rolePermissions);

      setUsername(data.username || "");
      setUserRole(data.role || "Unknown");
      setUserEffectiveSet(effective);
      setUserInitialSet(new Set(effective));
      setUserRoleSet(roleSet);
      setGrantedOverrides(
        Array.isArray(data.grantedOverrides) ? data.grantedOverrides : [],
      );
      setRevokedOverrides(
        Array.isArray(data.revokedOverrides) ? data.revokedOverrides : [],
      );
      setUserLoaded(true);
      toast.success("Loaded user permissions");
    } catch (error) {
      toast.error(error.message || "Failed to load user permissions");
    } finally {
      setUserLoading(false);
    }
  };

  const toggleUserPermission = (key) => {
    setUserEffectiveSet((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const saveUserOverrides = async () => {
    const parsedId = Number(userId);
    if (!Number.isInteger(parsedId) || parsedId <= 0) {
      toast.error("Enter a valid user ID");
      return;
    }

    const allKeys = permissions.map((x) => x.key);
    const grant = [];
    const revoke = [];

    allKeys.forEach((key) => {
      const initial = userInitialSet.has(key);
      const current = userEffectiveSet.has(key);
      if (initial !== current) {
        if (current) {
          grant.push(key);
        } else {
          revoke.push(key);
        }
      }
    });

    setSavingUser(true);
    try {
      const updated = await permissionService.updateUserPermissions(
        parsedId,
        grant,
        revoke,
      );

      const nextEffective = toSet(updated.effectivePermissions);
      setUserInitialSet(new Set(nextEffective));
      setUserEffectiveSet(nextEffective);
      setUserRoleSet(toSet(updated.rolePermissions));
      setGrantedOverrides(
        Array.isArray(updated.grantedOverrides) ? updated.grantedOverrides : [],
      );
      setRevokedOverrides(
        Array.isArray(updated.revokedOverrides) ? updated.revokedOverrides : [],
      );
      toast.success("User permission overrides updated");
    } catch (error) {
      toast.error(error.message || "Failed to update user overrides");
    } finally {
      setSavingUser(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96 text-[#4A2F19]">
        <Loader2 className="w-6 h-6 mr-2 animate-spin" />
        Loading permission management...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#1A1A1A]">
            Permission Management
          </h1>
          <p className="text-[#6B4423] mt-1">
            Configure role defaults and per-user permission overrides.
          </p>
        </div>
        <button
          onClick={loadData}
          className="px-4 py-2 rounded-lg bg-[#4A2F19] text-white hover:bg-[#3D2817] inline-flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      <section className="bg-white rounded-xl border border-[#C8A27B]/30 shadow-sm p-4 md:p-6">
        <div className="flex items-center gap-2 mb-4">
          <ShieldCheck className="w-5 h-5 text-[#4A2F19]" />
          <h2 className="text-xl font-semibold text-[#1A1A1A] m-0">
            Role Defaults
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-250 border border-[#E5D4BC]">
            <thead className="bg-[#F8F4EE]">
              <tr>
                <th className="text-left px-3 py-2 text-sm font-semibold text-[#4A2F19] border-b border-[#E5D4BC]">
                  Permission
                </th>
                {ROLE_LIST.map((role) => (
                  <th
                    key={role}
                    className="text-center px-3 py-2 text-sm font-semibold text-[#4A2F19] border-b border-[#E5D4BC]"
                  >
                    {role}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Object.entries(groupedPermissions).map(([category, items]) => (
                <React.Fragment key={category}>
                  <tr>
                    <td
                      colSpan={1 + ROLE_LIST.length}
                      className="px-3 py-2 text-xs font-bold uppercase text-[#6B4423] bg-[#FFF9F0] border-y border-[#E5D4BC]"
                    >
                      {category}
                    </td>
                  </tr>
                  {items.map((perm) => (
                    <tr key={perm.key} className="border-b border-[#F1E7D8]">
                      <td className="px-3 py-2">
                        <p className="text-sm font-medium text-[#1A1A1A] m-0">
                          {perm.name}
                        </p>
                        <p className="text-xs text-[#6B4423] m-0">{perm.key}</p>
                      </td>
                      {ROLE_LIST.map((role) => (
                        <td
                          key={`${role}-${perm.key}`}
                          className="px-3 py-2 text-center"
                        >
                          <input
                            type="checkbox"
                            checked={
                              rolePermissions[role]?.has(perm.key) || false
                            }
                            onChange={() =>
                              toggleRolePermission(role, perm.key)
                            }
                            className="w-4 h-4"
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex flex-wrap gap-2 mt-4">
          {ROLE_LIST.map((role) => (
            <button
              key={role}
              onClick={() => saveRole(role)}
              disabled={savingRole === role}
              className="px-4 py-2 rounded-lg bg-blue-700 text-white hover:bg-blue-800 disabled:opacity-60 inline-flex items-center gap-2"
            >
              {savingRole === role ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              Save {role}
            </button>
          ))}
        </div>
      </section>

      <section className="bg-white rounded-xl border border-[#C8A27B]/30 shadow-sm p-4 md:p-6">
        <div className="flex items-center gap-2 mb-4">
          <UserCog className="w-5 h-5 text-[#4A2F19]" />
          <h2 className="text-xl font-semibold text-[#1A1A1A] m-0">
            Per-User Overrides
          </h2>
        </div>

        <div className="flex flex-col md:flex-row gap-2 mb-4">
          <input
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            placeholder="Enter user ID"
            className="px-3 py-2 border border-[#C8A27B]/40 rounded-lg w-full md:w-64"
          />
          <button
            onClick={loadUserPermissions}
            disabled={userLoading}
            className="px-4 py-2 rounded-lg bg-[#4A2F19] text-white hover:bg-[#3D2817] disabled:opacity-60 inline-flex items-center gap-2"
          >
            {userLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
            Load User Permissions
          </button>
          {userRole && (
            <span className="px-3 py-2 rounded-lg bg-[#F8F4EE] text-[#4A2F19] text-sm">
              Role: {userRole}
            </span>
          )}
        </div>

        {userLoaded && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-4 text-sm">
              <div className="p-3 rounded-lg border border-[#E5D4BC] bg-[#FFFDF9]">
                <p className="m-0 font-semibold text-[#1A1A1A]">User</p>
                <p className="m-0 text-[#6B4423]">{username || "-"}</p>
              </div>
              <div className="p-3 rounded-lg border border-[#E5D4BC] bg-[#FFFDF9]">
                <p className="m-0 font-semibold text-[#1A1A1A]">
                  Granted Overrides
                </p>
                <p className="m-0 text-[#6B4423]">
                  {grantedOverrides.join(", ") || "None"}
                </p>
              </div>
              <div className="p-3 rounded-lg border border-[#E5D4BC] bg-[#FFFDF9]">
                <p className="m-0 font-semibold text-[#1A1A1A]">
                  Revoked Overrides
                </p>
                <p className="m-0 text-[#6B4423]">
                  {revokedOverrides.join(", ") || "None"}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 mb-4">
              {permissions.map((perm) => (
                <label
                  key={`user-${perm.key}`}
                  className="flex items-start gap-2 p-2 rounded border border-[#E5D4BC] bg-[#FFFDF9]"
                >
                  <input
                    type="checkbox"
                    checked={userEffectiveSet.has(perm.key)}
                    onChange={() => toggleUserPermission(perm.key)}
                    className="mt-1 w-4 h-4"
                  />
                  <div>
                    <p className="text-sm font-medium text-[#1A1A1A] m-0">
                      {perm.name}
                    </p>
                    <p className="text-xs text-[#6B4423] m-0">{perm.key}</p>
                    <p className="text-xs text-[#8B6F47] m-0">
                      {userRoleSet.has(perm.key)
                        ? "Role default"
                        : "Not in role default"}
                    </p>
                  </div>
                </label>
              ))}
            </div>

            <button
              onClick={saveUserOverrides}
              disabled={savingUser}
              className="px-4 py-2 rounded-lg bg-green-700 text-white hover:bg-green-800 disabled:opacity-60 inline-flex items-center gap-2"
            >
              {savingUser ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              Save User Overrides
            </button>
          </>
        )}
      </section>
    </div>
  );
};

export default PermissionManagement;
