import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  CalendarClock,
  Plus,
  Search,
  Edit,
  Trash2,
  Loader2,
  CheckCircle,
  XCircle,
  Save,
  X,
  Users,
  BookOpen,
  User,
} from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../../../hooks/useAuth";
import {
  getAllBatches,
  getActiveBatches,
  getBatchesByCourseId,
  getBatchById,
  createBatch,
  updateBatch,
  deleteBatch,
} from "../../../services/batchService";
import { getAllCourses } from "../../../services/courseService";
import trainerManagementService from "../../../services/trainerManagementService";

const initialFormState = {
  name: "",
  courseId: "",
  trainerId: "",
  startDate: "",
  endDate: "",
  timeSlot: "",
  maxStudents: "",
  isActive: true,
};

const getEntityId = (entity, keys = []) => {
  for (const key of keys) {
    if (entity?.[key] !== undefined && entity?.[key] !== null) {
      return entity[key];
    }
  }
  return null;
};

const toDateInputValue = (value) => {
  if (!value) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().split("T")[0];
};

const BatchManagement = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === "Admin";

  const [batches, setBatches] = useState([]);
  const [courses, setCourses] = useState([]);
  const [trainers, setTrainers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [showFormModal, setShowFormModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [activeOnly, setActiveOnly] = useState(false);
  const [selectedCourseFilter, setSelectedCourseFilter] = useState("");

  const [editingBatch, setEditingBatch] = useState(null);
  const [deletingBatch, setDeletingBatch] = useState(null);
  const [formData, setFormData] = useState(initialFormState);

  const loadReferenceData = useCallback(async () => {
    try {
      const [courseData, trainerData] = await Promise.all([
        getAllCourses(),
        trainerManagementService.getAllTrainers().catch(() => []),
      ]);

      setCourses(Array.isArray(courseData) ? courseData : []);
      setTrainers(Array.isArray(trainerData) ? trainerData : []);
    } catch {
      setCourses([]);
      setTrainers([]);
      toast.error("Failed to load course/trainer options");
    }
  }, []);

  const loadBatches = useCallback(async () => {
    setLoading(true);
    try {
      let data;

      if (selectedCourseFilter) {
        data = await getBatchesByCourseId(selectedCourseFilter);
      } else if (activeOnly) {
        data = await getActiveBatches();
      } else {
        data = await getAllBatches();
      }

      let normalized = Array.isArray(data) ? data : [];
      if (activeOnly && selectedCourseFilter) {
        normalized = normalized.filter((batch) => !!batch.isActive);
      }

      setBatches(normalized);
    } catch (error) {
      toast.error(error.message || "Failed to load batches");
      setBatches([]);
    } finally {
      setLoading(false);
    }
  }, [activeOnly, selectedCourseFilter]);

  useEffect(() => {
    loadReferenceData();
  }, [loadReferenceData]);

  useEffect(() => {
    loadBatches();
  }, [loadBatches]);

  const filteredBatches = useMemo(() => {
    if (!searchTerm.trim()) return batches;

    const query = searchTerm.trim().toLowerCase();
    return batches.filter((batch) => {
      const values = [
        batch.name,
        batch.courseName,
        batch.trainerName,
        batch.timeSlot,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return values.includes(query);
    });
  }, [batches, searchTerm]);

  const stats = useMemo(() => {
    const activeCount = batches.filter((batch) => !!batch.isActive).length;

    return {
      total: batches.length,
      active: activeCount,
      inactive: batches.length - activeCount,
    };
  }, [batches]);

  const resetModalState = () => {
    setEditingBatch(null);
    setFormData(initialFormState);
    setShowFormModal(false);
  };

  const openCreateModal = () => {
    setEditingBatch(null);
    setFormData(initialFormState);
    setShowFormModal(true);
  };

  const openEditModal = async (batchId) => {
    try {
      setSaving(true);
      const batch = await getBatchById(batchId);
      const resolvedBatchId = getEntityId(batch, ["batchId", "id"]);
      setEditingBatch({ ...batch, _resolvedBatchId: resolvedBatchId });
      setFormData({
        name: batch.name || "",
        courseId: String(batch.courseId || ""),
        trainerId:
          batch.trainerId === null || batch.trainerId === undefined
            ? ""
            : String(batch.trainerId),
        startDate: toDateInputValue(batch.startDate),
        endDate: toDateInputValue(batch.endDate),
        timeSlot: batch.timeSlot || "",
        maxStudents: batch.maxStudents ?? "",
        isActive: !!batch.isActive,
      });
      setShowFormModal(true);
    } catch (error) {
      toast.error(error.message || "Failed to load batch details");
    } finally {
      setSaving(false);
    }
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      toast.error("Batch name is required");
      return false;
    }

    if (!formData.courseId) {
      toast.error("Course is required");
      return false;
    }

    const maxStudents = Number(formData.maxStudents);
    if (!Number.isInteger(maxStudents) || maxStudents <= 0) {
      toast.error("Maximum students must be a positive whole number");
      return false;
    }

    if (!formData.startDate || !formData.endDate) {
      toast.error("Start date and end date are required");
      return false;
    }

    if (new Date(formData.endDate) < new Date(formData.startDate)) {
      toast.error("End date cannot be before start date");
      return false;
    }

    if (!formData.timeSlot.trim()) {
      toast.error("Time slot is required");
      return false;
    }

    return true;
  };

  const buildCreatePayload = () => ({
    name: formData.name.trim(),
    courseId: Number(formData.courseId),
    trainerId: formData.trainerId ? Number(formData.trainerId) : null,
    startDate: formData.startDate,
    endDate: formData.endDate,
    timeSlot: formData.timeSlot.trim(),
    maxStudents: Number(formData.maxStudents),
    isActive: !!formData.isActive,
  });

  const buildUpdatePayload = () => {
    const payload = {};
    const original = editingBatch || {};

    const currentName = formData.name.trim();
    if (currentName !== (original.name || "")) payload.name = currentName;

    const currentCourseId = Number(formData.courseId);
    if (currentCourseId !== Number(original.courseId))
      payload.courseId = currentCourseId;

    const currentTrainerId = formData.trainerId
      ? Number(formData.trainerId)
      : null;
    const originalTrainerId =
      original.trainerId === null || original.trainerId === undefined
        ? null
        : Number(original.trainerId);
    if (currentTrainerId !== originalTrainerId)
      payload.trainerId = currentTrainerId;

    if (formData.startDate !== toDateInputValue(original.startDate)) {
      payload.startDate = formData.startDate;
    }

    if (formData.endDate !== toDateInputValue(original.endDate)) {
      payload.endDate = formData.endDate;
    }

    const currentTimeSlot = formData.timeSlot.trim();
    if (currentTimeSlot !== (original.timeSlot || ""))
      payload.timeSlot = currentTimeSlot;

    const currentMaxStudents = Number(formData.maxStudents);
    if (currentMaxStudents !== Number(original.maxStudents)) {
      payload.maxStudents = currentMaxStudents;
    }

    const currentActive = !!formData.isActive;
    if (currentActive !== !!original.isActive) payload.isActive = currentActive;

    return payload;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSaving(true);
    try {
      if (editingBatch) {
        const payload = buildUpdatePayload();
        if (Object.keys(payload).length === 0) {
          toast("No changes detected");
          return;
        }

        await updateBatch(editingBatch._resolvedBatchId, payload);
        toast.success("Batch updated successfully");
      } else {
        await createBatch(buildCreatePayload());
        toast.success("Batch created successfully");
      }

      resetModalState();
      await loadBatches();
    } catch (error) {
      toast.error(error.message || "Failed to save batch");
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = (batch) => {
    setDeletingBatch(batch);
    setShowDeleteConfirm(true);
  };

  const handleDelete = async () => {
    if (!deletingBatch) return;
    setSaving(true);
    try {
      const batchId = getEntityId(deletingBatch, ["batchId", "id"]);
      await deleteBatch(batchId);
      toast.success("Batch deleted successfully");
      setShowDeleteConfirm(false);
      setDeletingBatch(null);
      await loadBatches();
    } catch (error) {
      toast.error(error.message || "Failed to delete batch");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-[#4A2F19] animate-spin mx-auto mb-2" />
          <p className="text-[#6B4423] text-sm">Loading batches...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#3D2817]">
            Batch & Schedule
          </h1>
          <p className="text-[#8B6F47] mt-1">
            Manage course batches, trainers, schedules, and student capacity
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="px-4 py-2 bg-[#4A2F19] text-white rounded-lg hover:bg-[#3D2817] transition-colors flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Batch
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          icon={CalendarClock}
          label="Total Batches"
          value={stats.total}
          iconBg="bg-blue-100"
          iconText="text-blue-600"
        />
        <StatCard
          icon={CheckCircle}
          label="Active Batches"
          value={stats.active}
          iconBg="bg-green-100"
          iconText="text-green-600"
        />
        <StatCard
          icon={XCircle}
          label="Inactive Batches"
          value={stats.inactive}
          iconBg="bg-gray-100"
          iconText="text-gray-600"
        />
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 border border-[#E8DCC8]">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-center">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8B6F47] w-5 h-5" />
            <input
              type="text"
              placeholder="Search by batch, course, trainer, time slot..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-[#E8DCC8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4A2F19]"
            />
          </div>

          <select
            value={selectedCourseFilter}
            onChange={(e) => setSelectedCourseFilter(e.target.value)}
            className="w-full px-3 py-2 border border-[#E8DCC8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4A2F19]"
          >
            <option value="">All Courses</option>
            {courses.map((course) => {
              const courseId = getEntityId(course, ["courseId", "id"]);
              return (
                <option key={courseId} value={courseId}>
                  {course.name}
                </option>
              );
            })}
          </select>

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
                  Batch
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B4423] uppercase">
                  Course / Trainer
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B4423] uppercase">
                  Schedule
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B4423] uppercase">
                  Capacity
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
              {filteredBatches.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-10 text-center text-[#8B6F47]"
                  >
                    No batches found
                  </td>
                </tr>
              ) : (
                filteredBatches.map((batch) => {
                  const batchId = getEntityId(batch, ["batchId", "id"]);
                  const maxStudents = Number(batch.maxStudents || 0);
                  const currentStudents = Number(batch.currentStudents || 0);

                  return (
                    <tr key={batchId} className="hover:bg-[#FFFBF5]">
                      <td className="px-6 py-4">
                        <p className="font-semibold text-[#3D2817]">
                          {batch.name}
                        </p>
                        <p className="text-sm text-[#8B6F47]">#{batchId}</p>
                      </td>
                      <td className="px-6 py-4 text-[#3D2817]">
                        <p className="font-medium">
                          {batch.courseName || "Unknown course"}
                        </p>
                        <p className="text-sm text-[#8B6F47]">
                          {batch.trainerName || "No trainer assigned"}
                        </p>
                      </td>
                      <td className="px-6 py-4 text-[#3D2817]">
                        <p>
                          {toDateInputValue(batch.startDate)} to{" "}
                          {toDateInputValue(batch.endDate)}
                        </p>
                        <p className="text-sm text-[#8B6F47]">
                          {batch.timeSlot || "No slot"}
                        </p>
                      </td>
                      <td className="px-6 py-4 text-[#3D2817]">
                        <span className="inline-flex items-center gap-1">
                          <Users className="w-4 h-4 text-[#8B6F47]" />
                          {currentStudents}/{maxStudents}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {batch.isActive ? (
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
                            onClick={() => openEditModal(batchId)}
                            disabled={saving}
                            className="p-2 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors"
                            title="Edit Batch"
                          >
                            <Edit className="w-4 h-4" />
                          </button>

                          {isAdmin && (
                            <button
                              onClick={() => confirmDelete(batch)}
                              disabled={saving}
                              className="p-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                              title="Delete Batch"
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
          <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-[#E8DCC8]">
              <h2 className="text-xl font-bold text-[#3D2817]">
                {editingBatch ? "Edit Batch" : "Create Batch"}
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
                    Batch Name *
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
                    Course *
                  </label>
                  <div className="relative">
                    <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8B6F47]" />
                    <select
                      value={formData.courseId}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          courseId: e.target.value,
                        }))
                      }
                      className="w-full pl-10 pr-3 py-2 border border-[#E8DCC8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4A2F19]"
                      required
                    >
                      <option value="">Select course</option>
                      {courses.map((course) => {
                        const courseId = getEntityId(course, [
                          "courseId",
                          "id",
                        ]);
                        return (
                          <option key={courseId} value={courseId}>
                            {course.name}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#3D2817] mb-1">
                    Trainer (Optional)
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8B6F47]" />
                    <select
                      value={formData.trainerId}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          trainerId: e.target.value,
                        }))
                      }
                      className="w-full pl-10 pr-3 py-2 border border-[#E8DCC8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4A2F19]"
                    >
                      <option value="">Unassigned</option>
                      {trainers.map((trainer) => {
                        const trainerId = getEntityId(trainer, [
                          "trainerId",
                          "userId",
                          "id",
                        ]);
                        const trainerName =
                          trainer.fullName ||
                          `${trainer.firstName || ""} ${trainer.lastName || ""}`.trim() ||
                          trainer.email ||
                          `Trainer #${trainerId}`;
                        return (
                          <option key={trainerId} value={trainerId}>
                            {trainerName}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#3D2817] mb-1">
                    Time Slot *
                  </label>
                  <input
                    type="text"
                    value={formData.timeSlot}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        timeSlot: e.target.value,
                      }))
                    }
                    placeholder="e.g. 9:00 AM - 11:00 AM"
                    className="w-full px-3 py-2 border border-[#E8DCC8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4A2F19]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#3D2817] mb-1">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        startDate: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-[#E8DCC8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4A2F19]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#3D2817] mb-1">
                    End Date *
                  </label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        endDate: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-[#E8DCC8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4A2F19]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#3D2817] mb-1">
                    Max Students *
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.maxStudents}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        maxStudents: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-[#E8DCC8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4A2F19]"
                    required
                  />
                </div>
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
                Active batch
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
                      {editingBatch ? "Update Batch" : "Create Batch"}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDeleteConfirm && deletingBatch && (
        <div className="fixed inset-0 backdrop-blur-sm bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-semibold text-[#3D2817] mb-2">
              Delete Batch
            </h3>
            <p className="text-sm text-[#6B4423] mb-6">
              Are you sure you want to delete{" "}
              <strong>{deletingBatch.name}</strong>? This action cannot be
              undone.
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setDeletingBatch(null);
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

export default BatchManagement;
