import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  BadgeCheck,
  CreditCard,
  DollarSign,
  FileText,
  Loader2,
  RefreshCw,
  Upload,
  UserPlus,
  Users,
} from "lucide-react";
import toast from "react-hot-toast";
import { getAllCourses } from "../../../services/courseService";
import { getAllBatches } from "../../../services/batchService";
import {
  createStudent,
  getAllStudents,
  getRegistrationSummary,
  getStudentDetails,
  getStudentsByStatus,
  recordCashPayment,
} from "../../../services/studentService";
import {
  deleteStudentDocument,
  getDocumentDownloadUrl,
  getStudentDocuments,
  uploadMultipleStudentDocuments,
  uploadStudentDocument,
} from "../../../services/studentDocumentService";
import {
  confirmPayment,
  createPaymentIntent,
  getPaymentDetails,
} from "../../../services/stripePaymentService";

const initialForm = {
  name: "",
  email: "",
  phone: "",
  courseId: "",
  batchId: "",
  feesTotal: "",
  address: "",
  emergencyContact: "",
  notes: "",
};

const documentTypeOptions = [
  { value: 1, label: "ID Card" },
  { value: 2, label: "Photo" },
  { value: 3, label: "Certificate" },
  { value: 4, label: "Other" },
];

const getId = (entity) =>
  entity?.studentId || entity?.id || entity?.userId || null;
const getDocumentId = (doc) => doc?.documentId || doc?.id;

const formatMoney = (value) => {
  const amount = Number(value) || 0;
  return amount.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const StudentAdmission = () => {
  const [formData, setFormData] = useState(initialForm);
  const [courses, setCourses] = useState([]);
  const [batches, setBatches] = useState([]);

  const [activeStudent, setActiveStudent] = useState(null);
  const [registrationSummary, setRegistrationSummary] = useState(null);
  const [studentDocuments, setStudentDocuments] = useState([]);

  const [allStudents, setAllStudents] = useState([]);
  const [enrolledStudents, setEnrolledStudents] = useState([]);
  const [selectedStudentDetail, setSelectedStudentDetail] = useState(null);

  const [cashAmount, setCashAmount] = useState("");
  const [stripeAmount, setStripeAmount] = useState("");
  const [stripeInstallmentId, setStripeInstallmentId] = useState("");
  const [stripeCurrency, setStripeCurrency] = useState("usd");
  const [lastStripePayment, setLastStripePayment] = useState(null);

  const [documentType, setDocumentType] = useState(1);
  const [documentDescription, setDocumentDescription] = useState("");
  const [singleDocumentFile, setSingleDocumentFile] = useState(null);
  const [multiDocumentFiles, setMultiDocumentFiles] = useState([]);

  const [submitting, setSubmitting] = useState(false);
  const [loadingRefs, setLoadingRefs] = useState(true);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [loadingLists, setLoadingLists] = useState(true);

  const selectedCourse = useMemo(
    () =>
      courses.find(
        (course) =>
          Number(course.courseId || course.id) === Number(formData.courseId),
      ),
    [courses, formData.courseId],
  );

  const filteredBatches = useMemo(() => {
    if (!formData.courseId) return batches;
    return batches.filter(
      (batch) => Number(batch.courseId) === Number(formData.courseId),
    );
  }, [batches, formData.courseId]);

  const activeStudentId = useMemo(() => getId(activeStudent), [activeStudent]);

  const loadReferences = useCallback(async () => {
    setLoadingRefs(true);
    try {
      const [coursesData, batchesData] = await Promise.all([
        getAllCourses(),
        getAllBatches(),
      ]);

      setCourses(Array.isArray(coursesData) ? coursesData : []);
      setBatches(Array.isArray(batchesData) ? batchesData : []);
    } catch (error) {
      toast.error(error.message || "Failed to load course and batch options");
    } finally {
      setLoadingRefs(false);
    }
  }, []);

  const loadStudentLists = useCallback(async () => {
    setLoadingLists(true);
    try {
      const [allData, enrolledData] = await Promise.all([
        getAllStudents(),
        getStudentsByStatus("Enrolled"),
      ]);

      setAllStudents(Array.isArray(allData) ? allData : []);
      setEnrolledStudents(Array.isArray(enrolledData) ? enrolledData : []);
    } catch (error) {
      toast.error(error.message || "Failed to load student lists");
      setAllStudents([]);
      setEnrolledStudents([]);
    } finally {
      setLoadingLists(false);
    }
  }, []);

  const loadSummaryAndDocuments = useCallback(
    async (studentId) => {
      if (!studentId) return;
      setLoadingSummary(true);

      try {
        const [summary, documents] = await Promise.all([
          getRegistrationSummary(studentId),
          getStudentDocuments(studentId),
        ]);

        setRegistrationSummary(summary || null);
        setStudentDocuments(Array.isArray(documents) ? documents : []);

        const remainingFees = Number(
          summary?.feesRemaining ?? summary?.remainingFees ?? 0,
        );
        const totalFees = Number(summary?.feesTotal ?? formData.feesTotal ?? 0);
        const payable = remainingFees > 0 ? remainingFees : totalFees;

        setCashAmount(payable > 0 ? String(payable) : "");
        setStripeAmount(payable > 0 ? String(payable) : "");
      } catch (error) {
        toast.error(error.message || "Failed to load registration summary");
      } finally {
        setLoadingSummary(false);
      }
    },
    [formData.feesTotal],
  );

  useEffect(() => {
    loadReferences();
    loadStudentLists();
  }, [loadReferences, loadStudentLists]);

  const handleFormChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => {
      const next = { ...prev, [name]: value };
      if (name === "courseId") {
        next.batchId = "";
      }
      return next;
    });
  };

  const validateCreateForm = () => {
    if (!formData.name.trim()) return "Student name is required";
    if (!formData.email.trim()) return "Student email is required";
    if (!formData.phone.trim()) return "Student phone is required";
    if (!formData.courseId) return "Course is required";
    if (!formData.batchId) return "Batch is required";

    const total = Number(formData.feesTotal);
    if (Number.isNaN(total) || total <= 0) {
      return "Fees total must be greater than 0";
    }

    return null;
  };

  const handleCreateStudent = async (e) => {
    e.preventDefault();

    const validationError = validateCreateForm();
    if (validationError) {
      toast.error(validationError);
      return;
    }

    setSubmitting(true);
    try {
      const created = await createStudent({
        ...formData,
        courseId: Number(formData.courseId),
        batchId: Number(formData.batchId),
        feesTotal: Number(formData.feesTotal),
      });

      const createdStudentId = getId(created);
      if (!createdStudentId) {
        throw new Error("Student created but ID was not returned by API");
      }

      setActiveStudent(created);
      setLastStripePayment(null);
      await Promise.all([
        loadSummaryAndDocuments(createdStudentId),
        loadStudentLists(),
      ]);

      toast.success(
        "Student created with PendingPayment status. Proceed with optional docs and payment.",
      );
    } catch (error) {
      toast.error(error.message || "Failed to create student");
    } finally {
      setSubmitting(false);
    }
  };

  const refreshSummary = async () => {
    if (!activeStudentId) {
      toast.error("Create or select a student first");
      return;
    }

    await loadSummaryAndDocuments(activeStudentId);
    toast.success("Registration summary refreshed");
  };

  const handleSingleDocumentUpload = async () => {
    if (!activeStudentId) {
      toast.error("Create or select a student first");
      return;
    }

    if (!singleDocumentFile) {
      toast.error("Choose a document file first");
      return;
    }

    setSubmitting(true);
    try {
      await uploadStudentDocument({
        studentId: activeStudentId,
        file: singleDocumentFile,
        documentType,
        description: documentDescription,
      });

      setSingleDocumentFile(null);
      setDocumentDescription("");
      await loadSummaryAndDocuments(activeStudentId);
      toast.success("Document uploaded");
    } catch (error) {
      toast.error(error.message || "Failed to upload document");
    } finally {
      setSubmitting(false);
    }
  };

  const handleMultiDocumentUpload = async () => {
    if (!activeStudentId) {
      toast.error("Create or select a student first");
      return;
    }

    if (!multiDocumentFiles.length) {
      toast.error("Choose at least one file");
      return;
    }

    setSubmitting(true);
    try {
      await uploadMultipleStudentDocuments({
        studentId: activeStudentId,
        files: multiDocumentFiles,
        documentType,
        description: documentDescription,
      });

      setMultiDocumentFiles([]);
      setDocumentDescription("");
      await loadSummaryAndDocuments(activeStudentId);
      toast.success("Documents uploaded");
    } catch (error) {
      toast.error(error.message || "Failed to upload documents");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteDocument = async (documentId) => {
    if (!activeStudentId) return;

    setSubmitting(true);
    try {
      await deleteStudentDocument(documentId);
      await loadSummaryAndDocuments(activeStudentId);
      toast.success("Document deleted");
    } catch (error) {
      toast.error(error.message || "Failed to delete document");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCashPayment = async () => {
    if (!activeStudentId) {
      toast.error("Create or select a student first");
      return;
    }

    const amount = Number(cashAmount);
    if (Number.isNaN(amount) || amount <= 0) {
      toast.error("Cash amount must be greater than 0");
      return;
    }

    setSubmitting(true);
    try {
      await recordCashPayment(activeStudentId, amount);
      await Promise.all([
        loadSummaryAndDocuments(activeStudentId),
        loadStudentLists(),
      ]);
      toast.success(
        "Cash payment recorded. Student should now be Enrolled and email sent.",
      );
    } catch (error) {
      toast.error(error.message || "Failed to record cash payment");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateStripeIntent = async () => {
    if (!activeStudentId) {
      toast.error("Create or select a student first");
      return;
    }

    const amount = Number(stripeAmount);
    if (Number.isNaN(amount) || amount <= 0) {
      toast.error("Stripe amount must be greater than 0");
      return;
    }

    setSubmitting(true);
    try {
      const paymentIntent = await createPaymentIntent({
        studentId: Number(activeStudentId),
        installmentId: stripeInstallmentId
          ? Number(stripeInstallmentId)
          : undefined,
        amount,
        currency: stripeCurrency,
        description: `Admission payment for student ${activeStudentId}`,
        metadata: {
          flow: "student-admission",
          studentId: String(activeStudentId),
        },
      });

      setLastStripePayment(paymentIntent);

      if (paymentIntent?.checkoutUrl) {
        window.open(paymentIntent.checkoutUrl, "_blank", "noopener,noreferrer");
      }

      toast.success(
        "Stripe payment intent created. Complete checkout and refresh status.",
      );
    } catch (error) {
      toast.error(error.message || "Failed to create Stripe payment intent");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRefreshStripeStatus = async () => {
    if (!lastStripePayment?.paymentId) {
      toast.error("Create a payment intent first");
      return;
    }

    setSubmitting(true);
    try {
      const latest = await getPaymentDetails(
        Number(lastStripePayment.paymentId),
      );
      setLastStripePayment(latest);
      toast.success("Stripe payment status refreshed");

      const normalizedStatus = String(latest?.status || "").toLowerCase();
      if (["succeeded", "paid", "completed"].includes(normalizedStatus)) {
        await Promise.all([
          loadSummaryAndDocuments(activeStudentId),
          loadStudentLists(),
        ]);
      }
    } catch (error) {
      toast.error(error.message || "Failed to refresh Stripe status");
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmStripePayment = async () => {
    if (!lastStripePayment?.paymentId) {
      toast.error("Create a payment intent first");
      return;
    }

    setSubmitting(true);
    try {
      await confirmPayment(Number(lastStripePayment.paymentId));
      const latest = await getPaymentDetails(
        Number(lastStripePayment.paymentId),
      );
      setLastStripePayment(latest);

      await Promise.all([
        loadSummaryAndDocuments(activeStudentId),
        loadStudentLists(),
      ]);

      toast.success(
        "Stripe payment confirmed. Student should now be Enrolled.",
      );
    } catch (error) {
      toast.error(error.message || "Failed to confirm Stripe payment");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSelectExistingStudent = async (student) => {
    const studentId = getId(student);
    if (!studentId) return;

    setActiveStudent(student);
    setLastStripePayment(null);
    await loadSummaryAndDocuments(studentId);
  };

  const handleLoadStudentProfile = async (student) => {
    const studentId = getId(student);
    if (!studentId) return;

    setSubmitting(true);
    try {
      const details = await getStudentDetails(studentId);
      setSelectedStudentDetail(details);
      toast.success("Loaded full student profile");
    } catch (error) {
      toast.error(error.message || "Failed to load student details");
    } finally {
      setSubmitting(false);
    }
  };

  const renderStudentStatusBadge = (status) => {
    const normalized = String(status || "").toLowerCase();
    if (normalized === "enrolled") {
      return (
        <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700">
          Enrolled
        </span>
      );
    }
    if (normalized === "pendingpayment") {
      return (
        <span className="text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-700">
          PendingPayment
        </span>
      );
    }
    return (
      <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700">
        {status || "Unknown"}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-[#3D2817]">
            Student Admission Flow
          </h1>
          <p className="text-[#8B6F47] mt-1">
            Create student, optionally upload documents, collect payment, and
            verify enrollment.
          </p>
        </div>
        <button
          onClick={() => {
            loadReferences();
            loadStudentLists();
            if (activeStudentId) {
              loadSummaryAndDocuments(activeStudentId);
            }
          }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#4A2F19] text-white hover:bg-[#3d2715]"
          disabled={submitting}
        >
          <RefreshCw className="w-4 h-4" />
          Refresh Data
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <section className="bg-white p-6 rounded-xl border border-[#C8A27B]/30 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <UserPlus className="w-5 h-5 text-[#4A2F19]" />
              <h2 className="text-xl font-semibold text-[#4A2F19]">
                Step 1. Create Student
              </h2>
            </div>

            {loadingRefs ? (
              <div className="flex items-center gap-2 text-[#6B4423]">
                <Loader2 className="w-4 h-4 animate-spin" />
                Loading course and batch options...
              </div>
            ) : (
              <form
                onSubmit={handleCreateStudent}
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
              >
                <input
                  name="name"
                  value={formData.name}
                  onChange={handleFormChange}
                  placeholder="Student Name *"
                  className="px-3 py-2 border rounded-lg border-[#C8A27B]/40"
                />
                <input
                  name="email"
                  value={formData.email}
                  onChange={handleFormChange}
                  placeholder="Email *"
                  type="email"
                  className="px-3 py-2 border rounded-lg border-[#C8A27B]/40"
                />
                <input
                  name="phone"
                  value={formData.phone}
                  onChange={handleFormChange}
                  placeholder="Phone *"
                  className="px-3 py-2 border rounded-lg border-[#C8A27B]/40"
                />
                <select
                  name="courseId"
                  value={formData.courseId}
                  onChange={handleFormChange}
                  className="px-3 py-2 border rounded-lg border-[#C8A27B]/40"
                >
                  <option value="">Select Course *</option>
                  {courses.map((course) => {
                    const courseId = course.courseId || course.id;
                    return (
                      <option key={courseId} value={courseId}>
                        {course.name} ({formatMoney(course.fees)})
                      </option>
                    );
                  })}
                </select>
                <select
                  name="batchId"
                  value={formData.batchId}
                  onChange={handleFormChange}
                  className="px-3 py-2 border rounded-lg border-[#C8A27B]/40"
                >
                  <option value="">Select Batch *</option>
                  {filteredBatches.map((batch) => {
                    const batchId = batch.batchId || batch.id;
                    return (
                      <option key={batchId} value={batchId}>
                        {batch.name}{" "}
                        {batch.timeSlot ? `(${batch.timeSlot})` : ""}
                      </option>
                    );
                  })}
                </select>
                <input
                  name="feesTotal"
                  value={formData.feesTotal}
                  onChange={handleFormChange}
                  placeholder="Total Fees *"
                  type="number"
                  min="0"
                  step="0.01"
                  className="px-3 py-2 border rounded-lg border-[#C8A27B]/40"
                />
                <input
                  name="address"
                  value={formData.address}
                  onChange={handleFormChange}
                  placeholder="Address (optional)"
                  className="px-3 py-2 border rounded-lg border-[#C8A27B]/40 md:col-span-2"
                />
                <input
                  name="emergencyContact"
                  value={formData.emergencyContact}
                  onChange={handleFormChange}
                  placeholder="Emergency Contact (optional)"
                  className="px-3 py-2 border rounded-lg border-[#C8A27B]/40 md:col-span-2"
                />
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleFormChange}
                  placeholder="Notes (optional)"
                  rows={3}
                  className="px-3 py-2 border rounded-lg border-[#C8A27B]/40 md:col-span-2"
                />
                <div className="md:col-span-2 flex items-center justify-between">
                  <p className="text-sm text-[#8B6F47]">
                    New student is created in <strong>PendingPayment</strong>.
                    No email is sent at this stage.
                  </p>
                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#4A2F19] text-white hover:bg-[#3d2715] disabled:opacity-70"
                    disabled={submitting}
                  >
                    {submitting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <UserPlus className="w-4 h-4" />
                    )}
                    Create Student
                  </button>
                </div>
              </form>
            )}
          </section>

          <section className="bg-white p-6 rounded-xl border border-[#C8A27B]/30 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Upload className="w-5 h-5 text-[#4A2F19]" />
              <h2 className="text-xl font-semibold text-[#4A2F19]">
                Step 2. Upload Documents (Optional)
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <select
                value={documentType}
                onChange={(e) => setDocumentType(Number(e.target.value))}
                className="px-3 py-2 border rounded-lg border-[#C8A27B]/40"
              >
                {documentTypeOptions.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>

              <input
                value={documentDescription}
                onChange={(e) => setDocumentDescription(e.target.value)}
                placeholder="Document description (optional)"
                className="px-3 py-2 border rounded-lg border-[#C8A27B]/40"
              />

              <div className="space-y-2">
                <label className="block text-sm text-[#6B4423]">
                  Single document
                </label>
                <input
                  type="file"
                  onChange={(e) =>
                    setSingleDocumentFile(e.target.files?.[0] || null)
                  }
                  className="block w-full text-sm"
                />
                <button
                  type="button"
                  onClick={handleSingleDocumentUpload}
                  className="w-full px-4 py-2 rounded-lg bg-[#6B4423] text-white hover:bg-[#5A3A21] disabled:opacity-70"
                  disabled={submitting}
                >
                  Upload Single
                </button>
              </div>

              <div className="space-y-2">
                <label className="block text-sm text-[#6B4423]">
                  Multiple documents
                </label>
                <input
                  type="file"
                  multiple
                  onChange={(e) =>
                    setMultiDocumentFiles(Array.from(e.target.files || []))
                  }
                  className="block w-full text-sm"
                />
                <button
                  type="button"
                  onClick={handleMultiDocumentUpload}
                  className="w-full px-4 py-2 rounded-lg bg-[#6B4423] text-white hover:bg-[#5A3A21] disabled:opacity-70"
                  disabled={submitting}
                >
                  Upload Multiple
                </button>
              </div>
            </div>

            <p className="mt-4 text-sm text-[#8B6F47]">
              Document upload is optional. You can proceed to payment without
              any uploaded files.
            </p>
          </section>

          <section className="bg-white p-6 rounded-xl border border-[#C8A27B]/30 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-[#4A2F19]" />
              <h2 className="text-xl font-semibold text-[#4A2F19]">
                Step 4. Payment
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg border border-[#C8A27B]/30 bg-[#fffaf2]">
                <h3 className="font-semibold text-[#4A2F19] mb-3">
                  Option A: Cash Payment
                </h3>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={cashAmount}
                  onChange={(e) => setCashAmount(e.target.value)}
                  placeholder="Cash amount"
                  className="w-full px-3 py-2 border rounded-lg border-[#C8A27B]/40"
                />
                <button
                  type="button"
                  onClick={handleCashPayment}
                  className="mt-3 w-full px-4 py-2 rounded-lg bg-green-700 text-white hover:bg-green-800 disabled:opacity-70"
                  disabled={submitting}
                >
                  Record Cash Payment
                </button>
              </div>

              <div className="p-4 rounded-lg border border-[#C8A27B]/30 bg-[#fffaf2] space-y-3">
                <h3 className="font-semibold text-[#4A2F19]">
                  Option B: Stripe Payment
                </h3>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={stripeAmount}
                  onChange={(e) => setStripeAmount(e.target.value)}
                  placeholder="Stripe amount"
                  className="w-full px-3 py-2 border rounded-lg border-[#C8A27B]/40"
                />
                <input
                  value={stripeInstallmentId}
                  onChange={(e) => setStripeInstallmentId(e.target.value)}
                  placeholder="Installment ID (optional, use 0 if none)"
                  className="w-full px-3 py-2 border rounded-lg border-[#C8A27B]/40"
                />
                <select
                  value={stripeCurrency}
                  onChange={(e) => setStripeCurrency(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg border-[#C8A27B]/40"
                >
                  <option value="usd">USD</option>
                  <option value="eur">EUR</option>
                  <option value="gbp">GBP</option>
                  <option value="cad">CAD</option>
                  <option value="aud">AUD</option>
                  <option value="jpy">JPY</option>
                  <option value="inr">INR</option>
                </select>

                <button
                  type="button"
                  onClick={handleCreateStripeIntent}
                  className="w-full px-4 py-2 rounded-lg bg-blue-700 text-white hover:bg-blue-800 disabled:opacity-70 inline-flex items-center justify-center gap-2"
                  disabled={submitting}
                >
                  <CreditCard className="w-4 h-4" />
                  Create Payment Intent
                </button>

                {lastStripePayment?.paymentId && (
                  <div className="pt-2 space-y-2 text-sm">
                    <p className="text-[#4A2F19]">
                      Payment ID: <strong>{lastStripePayment.paymentId}</strong>
                    </p>
                    <p className="text-[#6B4423]">
                      Status:{" "}
                      <strong>{lastStripePayment.status || "Pending"}</strong>
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={handleRefreshStripeStatus}
                        className="px-3 py-2 rounded-lg bg-slate-700 text-white hover:bg-slate-800 disabled:opacity-70"
                        disabled={submitting}
                      >
                        Refresh Status
                      </button>
                      <button
                        type="button"
                        onClick={handleConfirmStripePayment}
                        className="px-3 py-2 rounded-lg bg-indigo-700 text-white hover:bg-indigo-800 disabled:opacity-70"
                        disabled={submitting}
                      >
                        Confirm Payment
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <p className="text-sm text-[#8B6F47]">
              Once cash or Stripe payment succeeds, backend should mark student
              as <strong>Enrolled</strong>, set admission date, and send one
              combined confirmation + credentials email.
            </p>
          </section>

          <section className="bg-white p-6 rounded-xl border border-[#C8A27B]/30 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-[#4A2F19]" />
              <h2 className="text-xl font-semibold text-[#4A2F19]">
                Step 5. Enrolled Verification
              </h2>
            </div>

            {loadingLists ? (
              <div className="flex items-center gap-2 text-[#6B4423]">
                <Loader2 className="w-4 h-4 animate-spin" />
                Loading student lists...
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border border-[#C8A27B]/30 rounded-lg p-4">
                  <h3 className="font-semibold text-[#4A2F19] mb-3">
                    All Students ({allStudents.length})
                  </h3>
                  <div className="space-y-2 max-h-72 overflow-y-auto">
                    {allStudents.length === 0 ? (
                      <p className="text-sm text-[#8B6F47]">
                        No students found
                      </p>
                    ) : (
                      allStudents.map((student) => {
                        const id = getId(student);
                        return (
                          <div
                            key={id}
                            className="p-2 rounded border border-[#C8A27B]/20"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <div>
                                <p className="font-medium text-[#4A2F19]">
                                  {student.name || "Unnamed"}
                                </p>
                                <p className="text-xs text-[#6B4423]">
                                  {student.email || "No email"}
                                </p>
                              </div>
                              {renderStudentStatusBadge(student.status)}
                            </div>
                            <div className="mt-2 flex gap-2">
                              <button
                                type="button"
                                onClick={() =>
                                  handleSelectExistingStudent(student)
                                }
                                className="text-xs px-2 py-1 rounded bg-[#4A2F19] text-white"
                              >
                                Select
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  handleLoadStudentProfile(student)
                                }
                                className="text-xs px-2 py-1 rounded bg-[#6B4423] text-white"
                              >
                                View Details
                              </button>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                <div className="border border-[#C8A27B]/30 rounded-lg p-4">
                  <h3 className="font-semibold text-[#4A2F19] mb-3">
                    Enrolled Students ({enrolledStudents.length})
                  </h3>
                  <div className="space-y-2 max-h-72 overflow-y-auto">
                    {enrolledStudents.length === 0 ? (
                      <p className="text-sm text-[#8B6F47]">
                        No enrolled students yet
                      </p>
                    ) : (
                      enrolledStudents.map((student) => {
                        const id = getId(student);
                        return (
                          <div
                            key={id}
                            className="p-2 rounded border border-green-200 bg-green-50"
                          >
                            <p className="font-medium text-green-900">
                              {student.name || "Unnamed"}
                            </p>
                            <p className="text-xs text-green-800">
                              {student.email || "No email"}
                            </p>
                            <button
                              type="button"
                              onClick={() => handleLoadStudentProfile(student)}
                              className="mt-2 text-xs px-2 py-1 rounded bg-green-700 text-white"
                            >
                              View Full Profile
                            </button>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
            )}

            {selectedStudentDetail && (
              <div className="p-4 rounded-lg border border-[#C8A27B]/30 bg-[#fffaf2]">
                <h3 className="font-semibold text-[#4A2F19] mb-2">
                  Student Details Snapshot
                </h3>
                <p className="text-sm text-[#4A2F19]">
                  Name: {selectedStudentDetail.name || "-"}
                </p>
                <p className="text-sm text-[#4A2F19]">
                  Email: {selectedStudentDetail.email || "-"}
                </p>
                <p className="text-sm text-[#4A2F19]">
                  Phone: {selectedStudentDetail.phone || "-"}
                </p>
                <p className="text-sm text-[#4A2F19]">
                  Status: {selectedStudentDetail.status || "-"}
                </p>
                <p className="text-sm text-[#4A2F19]">
                  Course:{" "}
                  {selectedStudentDetail.courseName ||
                    selectedStudentDetail.course?.name ||
                    "-"}
                </p>
                <p className="text-sm text-[#4A2F19]">
                  Batch:{" "}
                  {selectedStudentDetail.batchName ||
                    selectedStudentDetail.batch?.name ||
                    "-"}
                </p>
                <p className="text-sm text-[#4A2F19]">
                  Fees Paid: {formatMoney(selectedStudentDetail.feesPaid)}
                </p>
                <p className="text-sm text-[#4A2F19]">
                  Fees Total: {formatMoney(selectedStudentDetail.feesTotal)}
                </p>
                <p className="text-sm text-[#4A2F19]">
                  Admission Date:{" "}
                  {selectedStudentDetail.admissionDate
                    ? new Date(
                        selectedStudentDetail.admissionDate,
                      ).toLocaleString()
                    : "-"}
                </p>
              </div>
            )}
          </section>
        </div>

        <aside className="space-y-4">
          <section className="bg-white p-5 rounded-xl border border-[#C8A27B]/30 shadow-sm sticky top-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold text-[#4A2F19]">
                Step 3. Registration Summary
              </h2>
              <button
                type="button"
                onClick={refreshSummary}
                className="text-xs px-2 py-1 rounded bg-[#4A2F19] text-white"
                disabled={submitting || !activeStudentId}
              >
                Refresh
              </button>
            </div>

            {!activeStudentId ? (
              <p className="text-sm text-[#8B6F47]">
                Create or select a student to view summary.
              </p>
            ) : loadingSummary ? (
              <div className="flex items-center gap-2 text-sm text-[#6B4423]">
                <Loader2 className="w-4 h-4 animate-spin" />
                Loading summary...
              </div>
            ) : (
              <div className="space-y-3 text-sm">
                <div className="p-3 rounded-lg bg-[#fffaf2] border border-[#C8A27B]/20">
                  <p className="font-semibold text-[#4A2F19]">
                    {registrationSummary?.name || activeStudent?.name || "-"}
                  </p>
                  <p className="text-[#6B4423]">
                    {registrationSummary?.email || activeStudent?.email || "-"}
                  </p>
                  <p className="text-[#6B4423]">
                    {registrationSummary?.phone || activeStudent?.phone || "-"}
                  </p>
                  <div className="mt-2">
                    {renderStudentStatusBadge(
                      registrationSummary?.status || activeStudent?.status,
                    )}
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="text-[#4A2F19]">
                    <strong>Course:</strong>{" "}
                    {registrationSummary?.courseName ||
                      selectedCourse?.name ||
                      "-"}
                  </p>
                  <p className="text-[#4A2F19]">
                    <strong>Batch:</strong>{" "}
                    {registrationSummary?.batchName || "-"}
                  </p>
                  <p className="text-[#4A2F19]">
                    <strong>Fees Total:</strong>{" "}
                    {formatMoney(
                      registrationSummary?.feesTotal ?? formData.feesTotal,
                    )}
                  </p>
                  <p className="text-[#4A2F19]">
                    <strong>Fees Paid:</strong>{" "}
                    {formatMoney(registrationSummary?.feesPaid)}
                  </p>
                  <p className="text-[#4A2F19]">
                    <strong>Fees Remaining:</strong>{" "}
                    {formatMoney(
                      registrationSummary?.feesRemaining ??
                        registrationSummary?.remainingFees,
                    )}
                  </p>
                  <p className="text-[#4A2F19]">
                    <strong>Notes:</strong>{" "}
                    {registrationSummary?.notes || formData.notes || "-"}
                  </p>
                </div>

                <div className="pt-2 border-t border-[#C8A27B]/20">
                  <p className="font-semibold text-[#4A2F19]">Documents</p>
                  <p className="text-[#6B4423]">
                    {registrationSummary?.uploadedDocumentsCount ??
                      studentDocuments.length}
                    {registrationSummary?.requiredDocumentsCount
                      ? `/${registrationSummary.requiredDocumentsCount}`
                      : ""}{" "}
                    uploaded
                  </p>
                  <div className="space-y-2 mt-2 max-h-48 overflow-y-auto">
                    {studentDocuments.length === 0 ? (
                      <p className="text-xs text-[#8B6F47]">
                        No documents uploaded
                      </p>
                    ) : (
                      studentDocuments.map((doc) => {
                        const documentId = getDocumentId(doc);
                        const fileName =
                          doc.fileName ||
                          doc.documentName ||
                          `Document ${documentId}`;

                        if (!documentId) {
                          return (
                            <div
                              key={fileName}
                              className="text-xs p-2 rounded border border-[#C8A27B]/20 bg-white"
                            >
                              <p className="font-medium text-[#4A2F19]">
                                {fileName}
                              </p>
                              <p className="text-[#6B4423]">
                                Document ID unavailable
                              </p>
                            </div>
                          );
                        }

                        return (
                          <div
                            key={documentId}
                            className="text-xs p-2 rounded border border-[#C8A27B]/20 bg-white"
                          >
                            <p className="font-medium text-[#4A2F19]">
                              {fileName}
                            </p>
                            <p className="text-[#6B4423]">
                              Type:{" "}
                              {doc.documentTypeName || doc.documentType || "-"}
                            </p>
                            <div className="flex gap-2 mt-1">
                              <a
                                className="px-2 py-1 rounded bg-blue-700 text-white"
                                href={getDocumentDownloadUrl(documentId)}
                                target="_blank"
                                rel="noreferrer"
                              >
                                Download
                              </a>
                              <button
                                type="button"
                                onClick={() => handleDeleteDocument(documentId)}
                                className="px-2 py-1 rounded bg-red-700 text-white"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                <div className="pt-2 border-t border-[#C8A27B]/20 text-[#6B4423] text-xs">
                  <div className="flex items-center gap-2">
                    <FileText className="w-3 h-3" /> {studentDocuments.length}{" "}
                    document(s) listed
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <BadgeCheck className="w-3 h-3" /> Flow ready for payment
                    completion
                  </div>
                </div>
              </div>
            )}
          </section>
        </aside>
      </div>
    </div>
  );
};

export default StudentAdmission;
