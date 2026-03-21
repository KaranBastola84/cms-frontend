import React, { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
  Users,
  Search,
  RefreshCw,
  Eye,
  Trash2,
  Filter,
  FileText,
  Wallet,
  X,
  Save,
  Mail,
} from "lucide-react";
import {
  deleteStudent,
  getAllStudents,
  getRegistrationSummary,
  getStudentByEmail,
  getStudentCashPayments,
  getStudentDetails,
  getStudentDocumentsList,
  getStudentPayments,
  updateStudentStatus,
} from "../../../services/studentService";

const STUDENT_STATUSES = [
  "All",
  "Enrolled",
  "PendingPayment",
  "Suspended",
  "Dropped",
];

const StudentManagementPanel = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("Enrolled");
  const [emailLookup, setEmailLookup] = useState("");

  const [statusDrafts, setStatusDrafts] = useState({});

  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedDetails, setSelectedDetails] = useState(null);
  const [selectedSummary, setSelectedSummary] = useState(null);
  const [selectedPayments, setSelectedPayments] = useState([]);
  const [selectedCashPayments, setSelectedCashPayments] = useState([]);
  const [selectedDocuments, setSelectedDocuments] = useState([]);
  const [detailsLoading, setDetailsLoading] = useState(false);

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAllStudents();
      const studentRows = Array.isArray(data) ? data : [];
      setStudents(studentRows);

      const nextDrafts = {};
      studentRows.forEach((student) => {
        const id = student.studentId || student.id;
        if (id) {
          nextDrafts[id] = student.status || "PendingPayment";
        }
      });
      setStatusDrafts(nextDrafts);
    } catch (error) {
      toast.error(error.message || "Failed to load students");
      setStudents([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const filteredStudents = useMemo(() => {
    let rows = [...students];

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      rows = rows.filter((student) => {
        const name = String(student.name || "").toLowerCase();
        const email = String(student.email || "").toLowerCase();
        const phone = String(student.phone || "").toLowerCase();
        return (
          name.includes(query) || email.includes(query) || phone.includes(query)
        );
      });
    }

    if (statusFilter !== "All") {
      rows = rows.filter(
        (student) =>
          String(student.status || "").toLowerCase() ===
          statusFilter.toLowerCase(),
      );
    }

    return rows;
  }, [students, searchQuery, statusFilter]);

  const formatDateTime = (value) => {
    if (!value) return "-";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "-";
    return date.toLocaleString();
  };

  const formatAmount = (value) => {
    const amount = Number(value || 0);
    return amount.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const handleFindByEmail = async () => {
    const email = String(emailLookup || "").trim();
    if (!email) {
      toast.error("Enter student email first");
      return;
    }

    try {
      const student = await getStudentByEmail(email);
      if (!student) {
        toast.error("No student found with this email");
        return;
      }

      const studentId = student.studentId || student.id;
      if (studentId) {
        await openStudentDetails(studentId);
      }
    } catch (error) {
      toast.error(error.message || "Failed to find student by email");
    }
  };

  const openStudentDetails = async (studentId) => {
    setDetailsLoading(true);
    try {
      const [details, summary, payments, cashPayments, documents] =
        await Promise.all([
          getStudentDetails(studentId),
          getRegistrationSummary(studentId),
          getStudentPayments(studentId),
          getStudentCashPayments(studentId),
          getStudentDocumentsList(studentId),
        ]);

      setSelectedStudent(details || null);
      setSelectedDetails(details || null);
      setSelectedSummary(summary || null);
      setSelectedPayments(Array.isArray(payments) ? payments : []);
      setSelectedCashPayments(Array.isArray(cashPayments) ? cashPayments : []);
      setSelectedDocuments(Array.isArray(documents) ? documents : []);
    } catch (error) {
      toast.error(error.message || "Failed to load student details");
    } finally {
      setDetailsLoading(false);
    }
  };

  const closeDetails = () => {
    setSelectedStudent(null);
    setSelectedDetails(null);
    setSelectedSummary(null);
    setSelectedPayments([]);
    setSelectedCashPayments([]);
    setSelectedDocuments([]);
  };

  const handleUpdateStatus = async (studentId) => {
    const nextStatus = statusDrafts[studentId];
    if (!nextStatus) {
      toast.error("Select a status first");
      return;
    }

    setActionLoadingId(studentId);
    try {
      await updateStudentStatus(studentId, nextStatus);
      toast.success("Student status updated");
      await fetchStudents();
    } catch (error) {
      toast.error(error.message || "Failed to update student status");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDeleteStudent = async (studentId) => {
    const confirmed = window.confirm(
      "Delete this student record? This action cannot be undone.",
    );
    if (!confirmed) return;

    setActionLoadingId(studentId);
    try {
      await deleteStudent(studentId);
      toast.success("Student deleted");
      await fetchStudents();
    } catch (error) {
      toast.error(error.message || "Failed to delete student");
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <section className="mt-8 bg-white rounded-xl shadow-coffee-md border border-[#C8A27B]/30 p-4 md:p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
        <div>
          <h2 className="text-2xl font-bold text-[#1A1A1A]">
            Student Management
          </h2>
          <p className="text-[#6B4423]">
            Manage student records and quickly view enrolled students.
          </p>
        </div>
        <button
          onClick={fetchStudents}
          disabled={loading}
          className="coffee-gradient text-white px-4 py-2 rounded-xl font-semibold hover:opacity-90 transition-all duration-200 shadow-coffee-md hover:shadow-coffee-lg flex items-center gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Refresh Students
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 mb-4">
        <div className="relative lg:col-span-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B4423]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, email, phone"
            className="w-full pl-10 pr-4 py-2 border-2 border-[#C8A27B]/40 rounded-lg bg-[#F8F4EE] focus:outline-none focus:border-[#4A2F19]"
          />
        </div>

        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B4423]" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border-2 border-[#C8A27B]/40 rounded-lg bg-[#F8F4EE] focus:outline-none focus:border-[#4A2F19] appearance-none"
          >
            {STUDENT_STATUSES.map((status) => (
              <option key={status} value={status}>
                {status === "PendingPayment" ? "Pending Payment" : status}
              </option>
            ))}
          </select>
        </div>

        <div className="flex gap-2">
          <div className="relative flex-1">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B4423]" />
            <input
              type="email"
              value={emailLookup}
              onChange={(e) => setEmailLookup(e.target.value)}
              placeholder="Find by exact email"
              className="w-full pl-10 pr-4 py-2 border-2 border-[#C8A27B]/40 rounded-lg bg-[#F8F4EE] focus:outline-none focus:border-[#4A2F19]"
            />
          </div>
          <button
            onClick={handleFindByEmail}
            className="px-4 py-2 rounded-lg bg-[#4A2F19] text-white hover:bg-[#3D2817]"
          >
            Find
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-10 flex items-center justify-center gap-2 text-[#6B4423]">
          <RefreshCw className="w-5 h-5 animate-spin" />
          Loading students...
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-[#C8A27B]/30">
          <table className="w-full min-w-245">
            <thead className="bg-[#EFE7D3] border-b border-[#C8A27B]/50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-bold text-[#1A1A1A]">
                  Student
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold text-[#1A1A1A]">
                  Contact
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold text-[#1A1A1A]">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold text-[#1A1A1A]">
                  Fees
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold text-[#1A1A1A]">
                  Admission
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold text-[#1A1A1A]">
                  Update Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold text-[#1A1A1A]">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#C8A27B]/20 bg-white">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-12 text-center text-[#6B4423]"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <Users className="w-10 h-10 opacity-50" />
                      No students found for the selected filters.
                    </div>
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student) => {
                  const studentId = student.studentId || student.id;
                  const rowBusy = actionLoadingId === studentId;
                  return (
                    <tr key={studentId} className="hover:bg-[#F8F4EE]/60">
                      <td className="px-4 py-3">
                        <p className="font-semibold text-[#1A1A1A]">
                          {student.name || "-"}
                        </p>
                        <p className="text-xs text-[#6B4423]">
                          ID: {studentId || "-"}
                        </p>
                      </td>
                      <td className="px-4 py-3 text-sm text-[#4A2F19]">
                        <p>{student.email || "-"}</p>
                        <p className="text-xs text-[#6B4423]">
                          {student.phone || "-"}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex px-2 py-1 rounded-md bg-[#EFE7D3] text-[#4A2F19] text-xs font-semibold">
                          {student.status || "-"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-[#4A2F19]">
                        {formatAmount(student.feesPaid)} /{" "}
                        {formatAmount(student.feesTotal)}
                      </td>
                      <td className="px-4 py-3 text-sm text-[#4A2F19]">
                        {formatDateTime(student.admissionDate)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <select
                            value={
                              statusDrafts[studentId] ||
                              student.status ||
                              "PendingPayment"
                            }
                            onChange={(e) =>
                              setStatusDrafts((prev) => ({
                                ...prev,
                                [studentId]: e.target.value,
                              }))
                            }
                            className="px-2 py-1 border border-[#C8A27B]/40 rounded-lg bg-[#F8F4EE] text-sm"
                          >
                            {STUDENT_STATUSES.filter((s) => s !== "All").map(
                              (status) => (
                                <option key={status} value={status}>
                                  {status === "PendingPayment"
                                    ? "Pending Payment"
                                    : status}
                                </option>
                              ),
                            )}
                          </select>
                          <button
                            onClick={() => handleUpdateStatus(studentId)}
                            disabled={rowBusy}
                            className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-blue-600 text-white text-xs hover:bg-blue-700 disabled:opacity-60"
                          >
                            <Save className="w-3 h-3" />
                            Save
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openStudentDetails(studentId)}
                            disabled={rowBusy}
                            className="p-2 rounded-lg bg-[#EFE7D3] text-[#4A2F19] hover:bg-[#E2D4BA]"
                            title="View details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteStudent(studentId)}
                            disabled={rowBusy}
                            className="p-2 rounded-lg bg-red-100 text-red-700 hover:bg-red-200"
                            title="Delete student"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {selectedStudent && (
        <div className="fixed inset-0 backdrop-blur-md bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-[#1A1A1A]">
                Student Profile
              </h3>
              <button
                onClick={closeDetails}
                className="text-[#6B4423] hover:text-[#1A1A1A]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {detailsLoading ? (
              <div className="py-8 text-center text-[#6B4423]">Loading...</div>
            ) : (
              <div className="space-y-6 text-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg bg-[#F8F4EE] border border-[#C8A27B]/30">
                    <p>
                      <strong>Name:</strong> {selectedDetails?.name || "-"}
                    </p>
                    <p>
                      <strong>Email:</strong> {selectedDetails?.email || "-"}
                    </p>
                    <p>
                      <strong>Phone:</strong> {selectedDetails?.phone || "-"}
                    </p>
                    <p>
                      <strong>Status:</strong> {selectedDetails?.status || "-"}
                    </p>
                  </div>
                  <div className="p-4 rounded-lg bg-[#F8F4EE] border border-[#C8A27B]/30">
                    <p>
                      <strong>Course:</strong>{" "}
                      {selectedSummary?.courseName || "-"}
                    </p>
                    <p>
                      <strong>Batch:</strong>{" "}
                      {selectedSummary?.batchName || "-"}
                    </p>
                    <p>
                      <strong>Fees Total:</strong>{" "}
                      {formatAmount(selectedSummary?.feesTotal)}
                    </p>
                    <p>
                      <strong>Fees Paid:</strong>{" "}
                      {formatAmount(selectedSummary?.feesPaid)}
                    </p>
                    <p>
                      <strong>Fees Remaining:</strong>{" "}
                      {formatAmount(
                        selectedSummary?.feesRemaining ||
                          selectedSummary?.remainingFees,
                      )}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="rounded-lg border border-[#C8A27B]/30 p-4">
                    <h4 className="font-semibold mb-2 text-[#4A2F19] inline-flex items-center gap-2">
                      <Wallet className="w-4 h-4" />
                      Payments ({selectedPayments.length})
                    </h4>
                    <div className="space-y-2 max-h-56 overflow-y-auto">
                      {selectedPayments.length === 0 ? (
                        <p className="text-xs text-[#6B4423]">
                          No payment records
                        </p>
                      ) : (
                        selectedPayments.map((item, idx) => (
                          <div
                            key={item.paymentId || item.id || idx}
                            className="p-2 rounded bg-[#F8F4EE]"
                          >
                            <p>Amount: {formatAmount(item.amount)}</p>
                            <p className="text-xs text-[#6B4423]">
                              {formatDateTime(
                                item.paidAt ||
                                  item.paymentDate ||
                                  item.createdAt,
                              )}
                            </p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  <div className="rounded-lg border border-[#C8A27B]/30 p-4">
                    <h4 className="font-semibold mb-2 text-[#4A2F19] inline-flex items-center gap-2">
                      <Wallet className="w-4 h-4" />
                      Cash Payments ({selectedCashPayments.length})
                    </h4>
                    <div className="space-y-2 max-h-56 overflow-y-auto">
                      {selectedCashPayments.length === 0 ? (
                        <p className="text-xs text-[#6B4423]">
                          No cash payment records
                        </p>
                      ) : (
                        selectedCashPayments.map((item, idx) => (
                          <div
                            key={item.cashPaymentId || item.id || idx}
                            className="p-2 rounded bg-[#F8F4EE]"
                          >
                            <p>Amount: {formatAmount(item.amount)}</p>
                            <p className="text-xs text-[#6B4423]">
                              By: {item.processedBy || "-"}
                            </p>
                            <p className="text-xs text-[#6B4423]">
                              {formatDateTime(item.paidAt)}
                            </p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  <div className="rounded-lg border border-[#C8A27B]/30 p-4">
                    <h4 className="font-semibold mb-2 text-[#4A2F19] inline-flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      Documents ({selectedDocuments.length})
                    </h4>
                    <div className="space-y-2 max-h-56 overflow-y-auto">
                      {selectedDocuments.length === 0 ? (
                        <p className="text-xs text-[#6B4423]">No documents</p>
                      ) : (
                        selectedDocuments.map((item, idx) => (
                          <div
                            key={item.documentId || item.id || idx}
                            className="p-2 rounded bg-[#F8F4EE]"
                          >
                            <p>{item.fileName || item.name || "Document"}</p>
                            <p className="text-xs text-[#6B4423]">
                              {item.documentTypeName ||
                                item.documentType ||
                                "-"}
                            </p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
};

export default StudentManagementPanel;
