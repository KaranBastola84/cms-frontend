import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  BookOpen,
  Plus,
  Search,
  Edit,
  Trash2,
  Loader2,
  CheckCircle,
  XCircle,
  Save,
  X,
  Clock3,
  DollarSign,
} from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../../../hooks/useAuth";
import {
  getAllCourses,
  getActiveCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
} from "../../../services/courseService";

const initialFormState = {
  name: "",
  code: "",
  description: "",
  durationMonths: "",
  fees: "",
  isActive: true,
};

const CourseManagement = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === "Admin";

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFormModal, setShowFormModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeOnly, setActiveOnly] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [deletingCourse, setDeletingCourse] = useState(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState(initialFormState);

  const loadCourses = useCallback(async () => {
    setLoading(true);
    try {
      const data = activeOnly
        ? await getActiveCourses()
        : await getAllCourses();
      setCourses(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error(error.message || "Failed to load courses");
      setCourses([]);
    } finally {
      setLoading(false);
    }
  }, [activeOnly]);

  useEffect(() => {
    loadCourses();
  }, [loadCourses]);

  const filteredCourses = useMemo(() => {
    if (!searchTerm.trim()) return courses;

    const query = searchTerm.trim().toLowerCase();
    return courses.filter((course) => {
      const name = course.name?.toLowerCase() || "";
      const code = course.code?.toLowerCase() || "";
      const description = course.description?.toLowerCase() || "";
      return (
        name.includes(query) ||
        code.includes(query) ||
        description.includes(query)
      );
    });
  }, [courses, searchTerm]);

  const stats = useMemo(() => {
    const activeCount = courses.filter((course) => course.isActive).length;
    return {
      total: courses.length,
      active: activeCount,
      inactive: courses.length - activeCount,
    };
  }, [courses]);

  const resetModalState = () => {
    setEditingCourse(null);
    setFormData(initialFormState);
    setShowFormModal(false);
  };

  const openCreateModal = () => {
    setEditingCourse(null);
    setFormData(initialFormState);
    setShowFormModal(true);
  };

  const openEditModal = async (courseId) => {
    try {
      setSaving(true);
      const course = await getCourseById(courseId);
      setEditingCourse(course);
      setFormData({
        name: course.name || "",
        code: course.code || "",
        description: course.description || "",
        durationMonths: course.durationMonths ?? "",
        fees: course.fees ?? "",
        isActive: !!course.isActive,
      });
      setShowFormModal(true);
    } catch (error) {
      toast.error(error.message || "Failed to load course details");
    } finally {
      setSaving(false);
    }
  };

  const buildCreatePayload = () => ({
    name: formData.name.trim(),
    code: formData.code.trim() || null,
    description: formData.description.trim(),
    durationMonths: Number(formData.durationMonths),
    fees: Number(formData.fees),
    isActive: !!formData.isActive,
  });

  const buildUpdatePayload = () => {
    const payload = {};
    const original = editingCourse || {};

    const currentName = formData.name.trim();
    if (currentName !== (original.name || "")) payload.name = currentName;

    const currentCode = formData.code.trim() || null;
    const originalCode = original.code || null;
    if (currentCode !== originalCode) payload.code = currentCode;

    const currentDescription = formData.description.trim();
    if (currentDescription !== (original.description || "")) {
      payload.description = currentDescription;
    }

    const currentDuration = Number(formData.durationMonths);
    if (currentDuration !== Number(original.durationMonths)) {
      payload.durationMonths = currentDuration;
    }

    const currentFees = Number(formData.fees);
    if (currentFees !== Number(original.fees)) {
      payload.fees = currentFees;
    }

    const currentActive = !!formData.isActive;
    if (currentActive !== !!original.isActive) {
      payload.isActive = currentActive;
    }

    return payload;
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      toast.error("Course name is required");
      return false;
    }

    const duration = Number(formData.durationMonths);
    if (!Number.isInteger(duration) || duration <= 0) {
      toast.error("Duration must be a positive whole number");
      return false;
    }

    const fees = Number(formData.fees);
    if (Number.isNaN(fees) || fees < 0) {
      toast.error("Fees must be a non-negative number");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSaving(true);
    try {
      if (editingCourse) {
        const payload = buildUpdatePayload();
        if (Object.keys(payload).length === 0) {
          toast("No changes detected");
          return;
        }
        await updateCourse(editingCourse.courseId || editingCourse.id, payload);
        toast.success("Course updated successfully");
      } else {
        await createCourse(buildCreatePayload());
        toast.success("Course created successfully");
      }

      resetModalState();
      await loadCourses();
    } catch (error) {
      toast.error(error.message || "Failed to save course");
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = (course) => {
    setDeletingCourse(course);
    setShowDeleteConfirm(true);
  };

  const handleDelete = async () => {
    if (!deletingCourse) return;
    setSaving(true);
    try {
      await deleteCourse(deletingCourse.courseId || deletingCourse.id);
      toast.success("Course deleted successfully");
      setShowDeleteConfirm(false);
      setDeletingCourse(null);
      await loadCourses();
    } catch (error) {
      toast.error(error.message || "Failed to delete course");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-[#4A2F19] animate-spin mx-auto mb-2" />
          <p className="text-[#6B4423] text-sm">Loading courses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#3D2817]">
            Course Management
          </h1>
          <p className="text-[#8B6F47] mt-1">
            Create, update, activate or deactivate academic courses
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="px-4 py-2 bg-[#4A2F19] text-white rounded-lg hover:bg-[#3D2817] transition-colors flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Course
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          icon={BookOpen}
          label="Total Courses"
          value={stats.total}
          iconBg="bg-blue-100"
          iconText="text-blue-600"
        />
        <StatCard
          icon={CheckCircle}
          label="Active Courses"
          value={stats.active}
          iconBg="bg-green-100"
          iconText="text-green-600"
        />
        <StatCard
          icon={XCircle}
          label="Inactive Courses"
          value={stats.inactive}
          iconBg="bg-gray-100"
          iconText="text-gray-600"
        />
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 border border-[#E8DCC8]">
        <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
          <div className="relative w-full md:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8B6F47] w-5 h-5" />
            <input
              type="text"
              placeholder="Search by name, code or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-[#E8DCC8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4A2F19]"
            />
          </div>

          <label className="inline-flex items-center gap-2 text-sm text-[#3D2817]">
            <input
              type="checkbox"
              checked={activeOnly}
              onChange={(e) => setActiveOnly(e.target.checked)}
              className="w-4 h-4 text-[#4A2F19] rounded border-[#E8DCC8] focus:ring-[#4A2F19]"
            />
            Show active only
          </label>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md border border-[#E8DCC8] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-[#FFF8F0] border-b border-[#E8DCC8]">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B4423] uppercase">
                  Course
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B4423] uppercase">
                  Duration
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B4423] uppercase">
                  Fees
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B4423] uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-[#6B4423] uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F3E8D8]">
              {filteredCourses.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-10 text-center text-[#8B6F47]"
                  >
                    No courses found
                  </td>
                </tr>
              ) : (
                filteredCourses.map((course) => {
                  const courseId = course.courseId || course.id;
                  return (
                    <tr key={courseId} className="hover:bg-[#FFFBF5]">
                      <td className="px-6 py-4">
                        <p className="font-semibold text-[#3D2817]">
                          {course.name}
                        </p>
                        <p className="text-sm text-[#8B6F47]">
                          {course.code || "No code"}
                        </p>
                        <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                          {course.description || "No description"}
                        </p>
                      </td>
                      <td className="px-6 py-4 text-[#3D2817]">
                        <span className="inline-flex items-center gap-1">
                          <Clock3 className="w-4 h-4 text-[#8B6F47]" />
                          {course.durationMonths} months
                        </span>
                      </td>
                      <td className="px-6 py-4 text-[#3D2817] font-semibold">
                        <span className="inline-flex items-center gap-1">
                          <DollarSign className="w-4 h-4 text-[#8B6F47]" />
                          {Number(course.fees || 0).toLocaleString()}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {course.isActive ? (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-200 text-gray-700">
                            Inactive
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => openEditModal(courseId)}
                            disabled={saving}
                            className="p-2 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors"
                            title="Edit Course"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          {isAdmin && (
                            <button
                              onClick={() => confirmDelete(course)}
                              disabled={saving}
                              className="p-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                              title="Delete Course"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showFormModal && (
        <div className="fixed inset-0 backdrop-blur-sm bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-[#E8DCC8]">
              <h2 className="text-xl font-bold text-[#3D2817]">
                {editingCourse ? "Edit Course" : "Create Course"}
              </h2>
              <button
                onClick={resetModalState}
                className="p-2 rounded-lg hover:bg-gray-100"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#3D2817] mb-1">
                    Course Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, name: e.target.value }))
                    }
                    className="w-full px-3 py-2 border border-[#E8DCC8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4A2F19]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#3D2817] mb-1">
                    Course Code
                  </label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, code: e.target.value }))
                    }
                    placeholder="e.g. CS101"
                    className="w-full px-3 py-2 border border-[#E8DCC8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4A2F19]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#3D2817] mb-1">
                    Duration (Months) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.durationMonths}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        durationMonths: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-[#E8DCC8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4A2F19]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#3D2817] mb-1">
                    Fees *
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.fees}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, fees: e.target.value }))
                    }
                    className="w-full px-3 py-2 border border-[#E8DCC8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4A2F19]"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#3D2817] mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  rows={4}
                  className="w-full px-3 py-2 border border-[#E8DCC8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4A2F19]"
                />
              </div>

              <label className="inline-flex items-center gap-2 text-sm text-[#3D2817]">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      isActive: e.target.checked,
                    }))
                  }
                  className="w-4 h-4 text-[#4A2F19] rounded border-[#E8DCC8] focus:ring-[#4A2F19]"
                />
                Active course
              </label>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={resetModalState}
                  className="px-4 py-2 border border-[#E8DCC8] rounded-lg text-[#6B4423] hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-[#4A2F19] text-white rounded-lg hover:bg-[#3D2817] flex items-center disabled:opacity-60"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      {editingCourse ? "Update Course" : "Create Course"}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDeleteConfirm && deletingCourse && (
        <div className="fixed inset-0 backdrop-blur-md bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-semibold text-[#3D2817] mb-2">
              Delete Course
            </h3>
            <p className="text-sm text-[#6B4423] mb-6">
              Are you sure you want to delete{" "}
              <strong>{deletingCourse.name}</strong>? This action cannot be
              undone.
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setDeletingCourse(null);
                }}
                className="px-4 py-2 border border-[#E8DCC8] rounded-lg text-[#6B4423] hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={saving}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-60"
              >
                {saving ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const StatCard = ({ icon, label, value, iconBg, iconText }) => (
  <div className="bg-white rounded-lg shadow-md p-6 border border-[#E8DCC8]">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-[#8B6F47] mb-1">{label}</p>
        <h3 className="text-2xl font-bold text-[#3D2817]">{value}</h3>
      </div>
      <div className={`p-3 rounded-full ${iconBg} ${iconText}`}>
        {React.createElement(icon, { className: "w-6 h-6" })}
      </div>
    </div>
  </div>
);

export default CourseManagement;
