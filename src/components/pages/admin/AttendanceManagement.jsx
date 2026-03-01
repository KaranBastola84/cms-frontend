import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  CalendarClock,
  ClipboardCheck,
  Loader2,
  Plus,
  RefreshCw,
  Save,
  Search,
  Trash2,
  User,
  Users,
  X,
  Edit,
  FileBarChart2,
} from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../../../hooks/useAuth";
import { getAllBatches } from "../../../services/batchService";
import {
  markAttendance,
  markAttendanceBulk,
  getAttendanceByBatch,
  updateAttendance,
  deleteAttendance,
  getStudentAttendanceReport,
  getBatchAttendanceReport,
} from "../../../services/attendanceService";

const STATUS_OPTIONS = ["Present", "Absent", "Late", "Excused", "Holiday"];

const initialSingleForm = {
  studentId: "",
  batchId: "",
  attendanceDate: "",
  status: "Present",
  checkInTime: "",
  checkOutTime: "",
  remarks: "",
};

const initialBulkRow = {
  studentId: "",
  studentName: "",
  status: "Present",
  checkInTime: "",
  checkOutTime: "",
  remarks: "",
  attendanceId: null,
};

const normalizeList = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.records)) return data.records;
  return [];
};

const getEntityId = (entity, keys = []) => {
  for (const key of keys) {
    if (entity?.[key] !== undefined && entity?.[key] !== null) {
      return entity[key];
    }
  }
  return null;
};

const getStudentDisplayName = (record) =>
  record.studentName ||
  record.fullName ||
  `${record.firstName || ""} ${record.lastName || ""}`.trim() ||
  `Student #${record.studentId || "N/A"}`;

const AttendanceManagement = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === "Admin";

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [batches, setBatches] = useState([]);
  const [selectedBatchId, setSelectedBatchId] = useState("");
  const [selectedDate, setSelectedDate] = useState(
    () => new Date().toISOString().split("T")[0],
  );
  const [searchTerm, setSearchTerm] = useState("");

  const [bulkRows, setBulkRows] = useState([]);
  const [singleForm, setSingleForm] = useState(initialSingleForm);

  const [editingRow, setEditingRow] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const [reportBatchId, setReportBatchId] = useState("");
  const [reportStudentId, setReportStudentId] = useState("");
  const [reportStartDate, setReportStartDate] = useState("");
  const [reportEndDate, setReportEndDate] = useState("");
  const [batchReport, setBatchReport] = useState(null);
  const [studentReport, setStudentReport] = useState(null);

  const loadBatches = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAllBatches();
      const list = normalizeList(data);
      setBatches(list);
    } catch (error) {
      toast.error(error.message || "Failed to load batches");
      setBatches([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBatches();
  }, [loadBatches]);

  const fetchBatchAttendance = useCallback(async () => {
    if (!selectedBatchId) {
      toast.error("Select a batch first");
      return;
    }

    setSaving(true);
    try {
      const data = await getAttendanceByBatch(selectedBatchId, selectedDate);
      const records = normalizeList(data).map((record) => ({
        studentId: String(record.studentId || ""),
        studentName: getStudentDisplayName(record),
        status: record.status || "Present",
        checkInTime: record.checkInTime || "",
        checkOutTime: record.checkOutTime || "",
        remarks: record.remarks || "",
        attendanceId: getEntityId(record, ["attendanceId", "id"]),
      }));

      setBulkRows(records);
      setSingleForm((prev) => ({
        ...prev,
        batchId: String(selectedBatchId),
        attendanceDate: selectedDate,
      }));

      if (records.length === 0) {
        toast(
          "No attendance records yet for this batch/date. Add students manually for bulk mark.",
        );
      } else {
        toast.success(`Loaded ${records.length} attendance record(s)`);
      }
    } catch (error) {
      toast.error(error.message || "Failed to load batch attendance");
      setBulkRows([]);
    } finally {
      setSaving(false);
    }
  }, [selectedBatchId, selectedDate]);

  const filteredBulkRows = useMemo(() => {
    if (!searchTerm.trim()) return bulkRows;
    const query = searchTerm.trim().toLowerCase();
    return bulkRows.filter((row) => {
      const fullText =
        `${row.studentId} ${row.studentName} ${row.status} ${row.remarks}`.toLowerCase();
      return fullText.includes(query);
    });
  }, [bulkRows, searchTerm]);

  const attendanceSummary = useMemo(() => {
    const counts = STATUS_OPTIONS.reduce((acc, status) => {
      acc[status] = 0;
      return acc;
    }, {});

    filteredBulkRows.forEach((row) => {
      const status = STATUS_OPTIONS.includes(row.status)
        ? row.status
        : "Absent";
      counts[status] += 1;
    });

    const total = filteredBulkRows.length;
    const effectiveTotal = Math.max(0, total - counts.Holiday);
    const attended = counts.Present + counts.Late;
    const attendanceRate =
      effectiveTotal > 0
        ? ((attended / effectiveTotal) * 100).toFixed(1)
        : "0.0";

    return {
      counts,
      total,
      effectiveTotal,
      attended,
      attendanceRate,
    };
  }, [filteredBulkRows]);

  const addBulkRow = () => {
    setBulkRows((prev) => [...prev, { ...initialBulkRow }]);
  };

  const removeBulkRow = (index) => {
    setBulkRows((prev) => prev.filter((_, rowIndex) => rowIndex !== index));
  };

  const updateBulkField = (index, field, value) => {
    setBulkRows((prev) =>
      prev.map((row, rowIndex) =>
        rowIndex === index ? { ...row, [field]: value } : row,
      ),
    );
  };

  const handleBulkSubmit = async () => {
    if (!selectedBatchId) {
      toast.error("Select a batch first");
      return;
    }

    const validRows = bulkRows.filter(
      (row) =>
        row.studentId && row.status && STATUS_OPTIONS.includes(row.status),
    );

    if (validRows.length === 0) {
      toast.error("Add at least one valid student attendance row");
      return;
    }

    setSaving(true);
    try {
      await markAttendanceBulk({
        batchId: Number(selectedBatchId),
        attendanceDate: selectedDate,
        markedBy: user?.email || user?.name || null,
        attendances: validRows.map((row) => ({
          studentId: Number(row.studentId),
          batchId: Number(selectedBatchId),
          attendanceDate: selectedDate,
          status: row.status,
          checkInTime: row.checkInTime || null,
          checkOutTime: row.checkOutTime || null,
          remarks: row.remarks || "",
        })),
      });

      toast.success("Bulk attendance submitted successfully");
      await fetchBatchAttendance();
    } catch (error) {
      toast.error(error.message || "Failed to submit bulk attendance");
    } finally {
      setSaving(false);
    }
  };

  const handleSingleSubmit = async (event) => {
    event.preventDefault();

    if (
      !singleForm.studentId ||
      !singleForm.batchId ||
      !singleForm.attendanceDate
    ) {
      toast.error("Student ID, Batch, and Date are required");
      return;
    }

    setSaving(true);
    try {
      await markAttendance({
        studentId: Number(singleForm.studentId),
        batchId: Number(singleForm.batchId),
        attendanceDate: singleForm.attendanceDate,
        status: singleForm.status,
        checkInTime: singleForm.checkInTime || null,
        checkOutTime: singleForm.checkOutTime || null,
        remarks: singleForm.remarks || "",
        markedBy: user?.email || user?.name || null,
      });

      toast.success("Attendance marked successfully");
      setSingleForm((prev) => ({
        ...initialSingleForm,
        batchId: prev.batchId,
        attendanceDate: prev.attendanceDate,
      }));

      if (String(selectedBatchId) === String(singleForm.batchId)) {
        await fetchBatchAttendance();
      }
    } catch (error) {
      toast.error(error.message || "Failed to mark attendance");
    } finally {
      setSaving(false);
    }
  };

  const openEditModal = (row) => {
    if (!row.attendanceId) {
      toast.error(
        "This row has no attendance record ID yet. Submit bulk first.",
      );
      return;
    }

    setEditingRow({ ...row });
    setShowEditModal(true);
  };

  const handleUpdateRecord = async (event) => {
    event.preventDefault();
    if (!editingRow?.attendanceId) return;

    setSaving(true);
    try {
      await updateAttendance(editingRow.attendanceId, {
        studentId: Number(editingRow.studentId),
        batchId: Number(selectedBatchId),
        attendanceDate: selectedDate,
        status: editingRow.status,
        checkInTime: editingRow.checkInTime || null,
        checkOutTime: editingRow.checkOutTime || null,
        remarks: editingRow.remarks || "",
      });

      toast.success("Attendance updated successfully");
      setShowEditModal(false);
      setEditingRow(null);
      await fetchBatchAttendance();
    } catch (error) {
      toast.error(error.message || "Failed to update attendance");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteRecord = async (row) => {
    if (!row?.attendanceId || !isAdmin) return;

    setSaving(true);
    try {
      await deleteAttendance(row.attendanceId);
      toast.success("Attendance record deleted");
      await fetchBatchAttendance();
    } catch (error) {
      toast.error(error.message || "Failed to delete attendance");
    } finally {
      setSaving(false);
    }
  };

  const loadBatchReport = async () => {
    if (!reportBatchId) {
      toast.error("Select a batch for report");
      return;
    }

    setSaving(true);
    try {
      const data = await getBatchAttendanceReport(reportBatchId, {
        startDate: reportStartDate || undefined,
        endDate: reportEndDate || undefined,
      });
      setBatchReport(data || null);
      toast.success("Batch report loaded");
    } catch (error) {
      toast.error(error.message || "Failed to load batch report");
      setBatchReport(null);
    } finally {
      setSaving(false);
    }
  };

  const loadStudentReport = async () => {
    if (!reportStudentId) {
      toast.error("Enter student ID for report");
      return;
    }

    setSaving(true);
    try {
      const data = await getStudentAttendanceReport(reportStudentId, {
        startDate: reportStartDate || undefined,
        endDate: reportEndDate || undefined,
      });
      setStudentReport(data || null);
      toast.success("Student report loaded");
    } catch (error) {
      toast.error(error.message || "Failed to load student report");
      setStudentReport(null);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-[#4A2F19] animate-spin mx-auto mb-2" />
          <p className="text-[#6B4423] text-sm">Loading attendance module...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#3D2817]">
            Attendance Tracking
          </h1>
          <p className="text-[#8B6F47] mt-1">
            Mark attendance by batch/date, correct individual records, and view
            reports.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 border border-[#E8DCC8] space-y-4">
        <div className="flex items-center gap-2 text-[#3D2817] font-semibold">
          <ClipboardCheck className="w-5 h-5" />
          Batch Daily Attendance
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
          <div>
            <label className="block text-sm font-medium text-[#3D2817] mb-1">
              Batch
            </label>
            <select
              value={selectedBatchId}
              onChange={(e) => {
                setSelectedBatchId(e.target.value);
                setSingleForm((prev) => ({ ...prev, batchId: e.target.value }));
              }}
              className="w-full px-3 py-2 border border-[#E8DCC8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4A2F19]"
            >
              <option value="">Select batch</option>
              {batches.map((batch) => {
                const batchId = getEntityId(batch, ["batchId", "id"]);
                return (
                  <option key={batchId} value={batchId}>
                    {batch.name}
                  </option>
                );
              })}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#3D2817] mb-1">
              Date
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => {
                setSelectedDate(e.target.value);
                setSingleForm((prev) => ({
                  ...prev,
                  attendanceDate: e.target.value,
                }));
              }}
              className="w-full px-3 py-2 border border-[#E8DCC8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4A2F19]"
            />
          </div>

          <button
            onClick={fetchBatchAttendance}
            disabled={saving}
            className="px-4 py-2 bg-[#4A2F19] text-white rounded-lg hover:bg-[#3D2817] transition-colors flex items-center justify-center disabled:opacity-60"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4 mr-2" />
            )}
            Load Snapshot
          </button>

          <button
            onClick={handleBulkSubmit}
            disabled={saving}
            className="px-4 py-2 bg-green-700 text-white rounded-lg hover:bg-green-800 transition-colors flex items-center justify-center disabled:opacity-60"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Submit Bulk
          </button>
        </div>

        <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
          <div className="relative w-full md:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8B6F47] w-5 h-5" />
            <input
              type="text"
              placeholder="Search by student id/name/status..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-[#E8DCC8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4A2F19]"
            />
          </div>

          <button
            onClick={addBulkRow}
            className="px-4 py-2 border border-[#E8DCC8] rounded-lg text-[#3D2817] hover:bg-[#FFFBF5] flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Student Row
          </button>
        </div>

        <div className="overflow-x-auto border border-[#F3E8D8] rounded-lg">
          <div className="px-4 py-3 border-b border-[#F3E8D8] bg-[#FFFBF5]">
            <div className="flex flex-wrap items-center gap-2">
              <SummaryBadge
                label="Total"
                value={attendanceSummary.total}
                tone="neutral"
              />
              <SummaryBadge
                label="Present"
                value={attendanceSummary.counts.Present}
                tone="green"
              />
              <SummaryBadge
                label="Absent"
                value={attendanceSummary.counts.Absent}
                tone="red"
              />
              <SummaryBadge
                label="Late"
                value={attendanceSummary.counts.Late}
                tone="amber"
              />
              <SummaryBadge
                label="Excused"
                value={attendanceSummary.counts.Excused}
                tone="blue"
              />
              <SummaryBadge
                label="Holiday"
                value={attendanceSummary.counts.Holiday}
                tone="gray"
              />
              <SummaryBadge
                label="Attendance %"
                value={`${attendanceSummary.attendanceRate}%`}
                tone="brown"
              />
            </div>
          </div>
          <table className="min-w-full">
            <thead className="bg-[#FFF8F0] border-b border-[#E8DCC8]">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-semibold text-[#6B4423] uppercase">
                  Student
                </th>
                <th className="px-4 py-2 text-left text-xs font-semibold text-[#6B4423] uppercase">
                  Status
                </th>
                <th className="px-4 py-2 text-left text-xs font-semibold text-[#6B4423] uppercase">
                  Check In
                </th>
                <th className="px-4 py-2 text-left text-xs font-semibold text-[#6B4423] uppercase">
                  Check Out
                </th>
                <th className="px-4 py-2 text-left text-xs font-semibold text-[#6B4423] uppercase">
                  Remarks
                </th>
                <th className="px-4 py-2 text-right text-xs font-semibold text-[#6B4423] uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F3E8D8]">
              {filteredBulkRows.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-8 text-center text-[#8B6F47]"
                  >
                    No rows. Load batch snapshot or add rows manually.
                  </td>
                </tr>
              ) : (
                filteredBulkRows.map((row, index) => (
                  <tr key={`${row.attendanceId || "new"}-${index}`}>
                    <td className="px-4 py-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        <input
                          type="number"
                          min="1"
                          value={row.studentId}
                          onChange={(e) =>
                            updateBulkField(index, "studentId", e.target.value)
                          }
                          placeholder="Student ID"
                          className="w-full px-2 py-1 border border-[#E8DCC8] rounded"
                        />
                        <input
                          type="text"
                          value={row.studentName}
                          onChange={(e) =>
                            updateBulkField(
                              index,
                              "studentName",
                              e.target.value,
                            )
                          }
                          placeholder="Student Name (optional)"
                          className="w-full px-2 py-1 border border-[#E8DCC8] rounded"
                        />
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={row.status}
                        onChange={(e) =>
                          updateBulkField(index, "status", e.target.value)
                        }
                        className="w-full px-2 py-1 border border-[#E8DCC8] rounded"
                      >
                        {STATUS_OPTIONS.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="time"
                        value={row.checkInTime}
                        onChange={(e) =>
                          updateBulkField(index, "checkInTime", e.target.value)
                        }
                        className="w-full px-2 py-1 border border-[#E8DCC8] rounded"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="time"
                        value={row.checkOutTime}
                        onChange={(e) =>
                          updateBulkField(index, "checkOutTime", e.target.value)
                        }
                        className="w-full px-2 py-1 border border-[#E8DCC8] rounded"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="text"
                        value={row.remarks}
                        onChange={(e) =>
                          updateBulkField(index, "remarks", e.target.value)
                        }
                        placeholder="Remarks"
                        className="w-full px-2 py-1 border border-[#E8DCC8] rounded"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => openEditModal(row)}
                          className="p-2 rounded text-blue-600 hover:bg-blue-50"
                          title="Edit persisted record"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        {isAdmin && row.attendanceId && (
                          <button
                            onClick={() => handleDeleteRecord(row)}
                            className="p-2 rounded text-red-600 hover:bg-red-50"
                            title="Delete record"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => removeBulkRow(index)}
                          className="p-2 rounded text-gray-600 hover:bg-gray-100"
                          title="Remove row"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6 border border-[#E8DCC8]">
          <div className="flex items-center gap-2 text-[#3D2817] font-semibold mb-4">
            <User className="w-5 h-5" />
            Single Attendance Entry
          </div>

          <form onSubmit={handleSingleSubmit} className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input
                type="number"
                min="1"
                value={singleForm.studentId}
                onChange={(e) =>
                  setSingleForm((prev) => ({
                    ...prev,
                    studentId: e.target.value,
                  }))
                }
                placeholder="Student ID"
                className="w-full px-3 py-2 border border-[#E8DCC8] rounded-lg"
                required
              />

              <select
                value={singleForm.batchId}
                onChange={(e) =>
                  setSingleForm((prev) => ({
                    ...prev,
                    batchId: e.target.value,
                  }))
                }
                className="w-full px-3 py-2 border border-[#E8DCC8] rounded-lg"
                required
              >
                <option value="">Select batch</option>
                {batches.map((batch) => {
                  const batchId = getEntityId(batch, ["batchId", "id"]);
                  return (
                    <option key={batchId} value={batchId}>
                      {batch.name}
                    </option>
                  );
                })}
              </select>

              <input
                type="date"
                value={singleForm.attendanceDate}
                onChange={(e) =>
                  setSingleForm((prev) => ({
                    ...prev,
                    attendanceDate: e.target.value,
                  }))
                }
                className="w-full px-3 py-2 border border-[#E8DCC8] rounded-lg"
                required
              />

              <select
                value={singleForm.status}
                onChange={(e) =>
                  setSingleForm((prev) => ({ ...prev, status: e.target.value }))
                }
                className="w-full px-3 py-2 border border-[#E8DCC8] rounded-lg"
              >
                {STATUS_OPTIONS.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>

              <input
                type="time"
                value={singleForm.checkInTime}
                onChange={(e) =>
                  setSingleForm((prev) => ({
                    ...prev,
                    checkInTime: e.target.value,
                  }))
                }
                className="w-full px-3 py-2 border border-[#E8DCC8] rounded-lg"
              />

              <input
                type="time"
                value={singleForm.checkOutTime}
                onChange={(e) =>
                  setSingleForm((prev) => ({
                    ...prev,
                    checkOutTime: e.target.value,
                  }))
                }
                className="w-full px-3 py-2 border border-[#E8DCC8] rounded-lg"
              />
            </div>

            <textarea
              rows={3}
              value={singleForm.remarks}
              onChange={(e) =>
                setSingleForm((prev) => ({ ...prev, remarks: e.target.value }))
              }
              placeholder="Remarks (optional)"
              className="w-full px-3 py-2 border border-[#E8DCC8] rounded-lg"
            />

            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-[#4A2F19] text-white rounded-lg hover:bg-[#3D2817] flex items-center disabled:opacity-60"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Mark Attendance
            </button>
          </form>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border border-[#E8DCC8]">
          <div className="flex items-center gap-2 text-[#3D2817] font-semibold mb-4">
            <FileBarChart2 className="w-5 h-5" />
            Attendance Reports
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
            <input
              type="number"
              min="1"
              value={reportStudentId}
              onChange={(e) => setReportStudentId(e.target.value)}
              placeholder="Student ID"
              className="w-full px-3 py-2 border border-[#E8DCC8] rounded-lg"
            />

            <select
              value={reportBatchId}
              onChange={(e) => setReportBatchId(e.target.value)}
              className="w-full px-3 py-2 border border-[#E8DCC8] rounded-lg"
            >
              <option value="">Select batch for report</option>
              {batches.map((batch) => {
                const batchId = getEntityId(batch, ["batchId", "id"]);
                return (
                  <option key={batchId} value={batchId}>
                    {batch.name}
                  </option>
                );
              })}
            </select>

            <input
              type="date"
              value={reportStartDate}
              onChange={(e) => setReportStartDate(e.target.value)}
              className="w-full px-3 py-2 border border-[#E8DCC8] rounded-lg"
            />

            <input
              type="date"
              value={reportEndDate}
              onChange={(e) => setReportEndDate(e.target.value)}
              className="w-full px-3 py-2 border border-[#E8DCC8] rounded-lg"
            />
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            <button
              onClick={loadStudentReport}
              disabled={saving}
              className="px-3 py-2 bg-[#4A2F19] text-white rounded-lg hover:bg-[#3D2817] text-sm disabled:opacity-60"
            >
              Student Report
            </button>
            <button
              onClick={loadBatchReport}
              disabled={saving}
              className="px-3 py-2 bg-[#6B4423] text-white rounded-lg hover:bg-[#5A3A1E] text-sm disabled:opacity-60"
            >
              Batch Report
            </button>
          </div>

          <div className="space-y-3">
            {studentReport && (
              <ReportCard
                title={`Student #${reportStudentId} Report`}
                data={studentReport}
              />
            )}
            {batchReport && (
              <ReportCard
                title={`Batch #${reportBatchId} Report`}
                data={batchReport}
              />
            )}
            {!studentReport && !batchReport && (
              <p className="text-sm text-[#8B6F47]">No reports loaded yet.</p>
            )}
          </div>
        </div>
      </div>

      {showEditModal && editingRow && (
        <div className="fixed inset-0 backdrop-blur-sm bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg">
            <div className="flex items-center justify-between p-6 border-b border-[#E8DCC8]">
              <h2 className="text-xl font-bold text-[#3D2817]">
                Edit Attendance Record
              </h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-2 rounded hover:bg-gray-100"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            <form onSubmit={handleUpdateRecord} className="p-6 space-y-3">
              <p className="text-sm text-[#6B4423]">
                Student ID: {editingRow.studentId}
              </p>

              <select
                value={editingRow.status}
                onChange={(e) =>
                  setEditingRow((prev) => ({ ...prev, status: e.target.value }))
                }
                className="w-full px-3 py-2 border border-[#E8DCC8] rounded-lg"
              >
                {STATUS_OPTIONS.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>

              <div className="grid grid-cols-2 gap-3">
                <input
                  type="time"
                  value={editingRow.checkInTime || ""}
                  onChange={(e) =>
                    setEditingRow((prev) => ({
                      ...prev,
                      checkInTime: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-[#E8DCC8] rounded-lg"
                />
                <input
                  type="time"
                  value={editingRow.checkOutTime || ""}
                  onChange={(e) =>
                    setEditingRow((prev) => ({
                      ...prev,
                      checkOutTime: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-[#E8DCC8] rounded-lg"
                />
              </div>

              <textarea
                rows={3}
                value={editingRow.remarks || ""}
                onChange={(e) =>
                  setEditingRow((prev) => ({
                    ...prev,
                    remarks: e.target.value,
                  }))
                }
                className="w-full px-3 py-2 border border-[#E8DCC8] rounded-lg"
              />

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 border border-[#E8DCC8] rounded-lg text-[#6B4423] hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-[#4A2F19] text-white rounded-lg hover:bg-[#3D2817] disabled:opacity-60"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const ReportCard = ({ title, data }) => (
  <div className="border border-[#E8DCC8] rounded-lg p-3 bg-[#FFFBF5]">
    <p className="font-semibold text-[#3D2817] mb-2">{title}</p>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-1 text-sm">
      {Object.entries(data || {}).map(([key, value]) => (
        <div key={key} className="flex justify-between gap-2">
          <span className="text-[#6B4423] capitalize">{key}</span>
          <span className="text-[#3D2817] font-medium">{String(value)}</span>
        </div>
      ))}
    </div>
  </div>
);

const SummaryBadge = ({ label, value, tone }) => {
  const toneStyles = {
    neutral: "bg-[#EFE7D3] text-[#3D2817]",
    green: "bg-green-100 text-green-700",
    red: "bg-red-100 text-red-700",
    amber: "bg-amber-100 text-amber-700",
    blue: "bg-blue-100 text-blue-700",
    gray: "bg-gray-200 text-gray-700",
    brown: "bg-[#E8DCC8] text-[#4A2F19]",
  };

  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${toneStyles[tone] || toneStyles.neutral}`}
    >
      {label}: {value}
    </span>
  );
};

export default AttendanceManagement;
