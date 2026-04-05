import React, { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
  Award,
  CheckCircle2,
  Download,
  Eye,
  RefreshCw,
  Search,
  Send,
  ShieldAlert,
  XCircle,
} from "lucide-react";
import {
  DELIVERY_MODE,
  checkCertificateEligibility,
  downloadCertificate,
  getCertificateById,
  getCertificateRecommendations,
  issueCertificate,
  revokeCertificate,
} from "../../../services/certificateService";

const toArray = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.recommendations)) return payload.recommendations;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
};

const parsePositiveInt = (value) => {
  const numeric = Number(value);
  if (!Number.isInteger(numeric) || numeric <= 0) return null;
  return numeric;
};

const getCertificateId = (source) => {
  return (
    parsePositiveInt(source?.certificateId) ||
    parsePositiveInt(source?.id) ||
    parsePositiveInt(source?.certificate?.id) ||
    parsePositiveInt(source?.certificate?.certificateId) ||
    null
  );
};

const pickDisplay = (source, keys, fallback = "-") => {
  for (const key of keys) {
    const value = source?.[key];
    if (value !== null && value !== undefined && value !== "") {
      return String(value);
    }
  }
  return fallback;
};

const formatDate = (value) => {
  if (!value) return "-";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "-";
  return parsed.toLocaleString();
};

const normalizeBoolean = (value) => {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value === 1;
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (["true", "yes", "pass", "passed", "eligible"].includes(normalized)) {
      return true;
    }
    if (["false", "no", "fail", "failed", "ineligible"].includes(normalized)) {
      return false;
    }
  }
  return null;
};

const buildEligibilityChecks = (eligibility) => {
  if (!eligibility || typeof eligibility !== "object") return [];

  if (Array.isArray(eligibility.checks)) {
    return eligibility.checks
      .map((item, index) => {
        const value = normalizeBoolean(
          item?.passed ?? item?.isPassed ?? item?.eligible ?? item?.value,
        );

        return {
          key: item?.key || item?.code || `check-${index}`,
          label: String(
            item?.label ||
              item?.name ||
              item?.description ||
              `Check ${index + 1}`,
          ),
          passed: value,
          note: String(item?.message || item?.note || ""),
        };
      })
      .filter((item) => item.passed !== null);
  }

  const definitions = [
    {
      key: "trainer-recommendation",
      label: "Trainer recommendation present",
      fields: [
        "hasTrainerRecommendation",
        "trainerRecommendationPresent",
        "isTrainerRecommendationPresent",
      ],
    },
    {
      key: "attendance",
      label: "Attendance at least 80%",
      fields: [
        "hasMinimumAttendance",
        "attendanceEligible",
        "attendanceRequirementMet",
      ],
    },
    {
      key: "fee-clearance",
      label: "Full fee payment cleared",
      fields: ["isFeeCleared", "feePaymentCleared", "paymentCleared"],
    },
  ];

  return definitions
    .map((definition) => {
      const value = definition.fields
        .map((field) => normalizeBoolean(eligibility?.[field]))
        .find((resolved) => resolved !== null);

      return {
        key: definition.key,
        label: definition.label,
        passed: value,
        note: "",
      };
    })
    .filter((item) => item.passed !== null);
};

const getOverallEligibility = (eligibility, checks) => {
  const explicit = normalizeBoolean(
    eligibility?.isEligible ?? eligibility?.eligible ?? eligibility?.canIssue,
  );

  if (explicit !== null) return explicit;
  if (checks.length === 0) return null;
  return checks.every((check) => check.passed === true);
};

const getStatusClass = (statusText) => {
  const normalized = String(statusText || "").toLowerCase();

  if (normalized.includes("issue") || normalized.includes("active")) {
    return "bg-emerald-100 text-emerald-800";
  }

  if (normalized.includes("revoke")) {
    return "bg-red-100 text-red-800";
  }

  if (normalized.includes("recommend") || normalized.includes("pending")) {
    return "bg-amber-100 text-amber-800";
  }

  return "bg-slate-100 text-slate-700";
};

const saveBlob = (blob, filename) => {
  const objectUrl = window.URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = objectUrl;
  anchor.download = filename || "certificate.pdf";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.URL.revokeObjectURL(objectUrl);
};

function CertificateManagement() {
  const [recommendationsLoading, setRecommendationsLoading] = useState(true);
  const [recommendations, setRecommendations] = useState([]);

  const [certificateIdInput, setCertificateIdInput] = useState("");
  const [selectedCertificateId, setSelectedCertificateId] = useState(null);

  const [detailsLoading, setDetailsLoading] = useState(false);
  const [certificateDetails, setCertificateDetails] = useState(null);

  const [eligibilityLoading, setEligibilityLoading] = useState(false);
  const [eligibility, setEligibility] = useState(null);

  const [issuing, setIssuing] = useState(false);
  const [revoking, setRevoking] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const [issueData, setIssueData] = useState({
    deliveryMode: DELIVERY_MODE.DIGITAL,
    adminNotes: "",
  });
  const [revokeReason, setRevokeReason] = useState("");

  const fetchRecommendations = useCallback(
    async ({ showToast = false } = {}) => {
      setRecommendationsLoading(true);
      try {
        const response = await getCertificateRecommendations();
        const list = toArray(response);
        setRecommendations(list);
        if (showToast) {
          toast.success("Certificate recommendations refreshed");
        }
      } catch (error) {
        setRecommendations([]);
        toast.error(error.message || "Failed to load recommendations");
      } finally {
        setRecommendationsLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    fetchRecommendations();
  }, [fetchRecommendations]);

  const resolveTargetCertificateId = (overrideId) => {
    const resolved =
      parsePositiveInt(overrideId) ||
      parsePositiveInt(selectedCertificateId) ||
      parsePositiveInt(certificateIdInput);

    if (!resolved) {
      throw new Error("Select or enter a valid certificate ID");
    }

    return resolved;
  };

  const loadCertificateDetails = async (overrideId) => {
    const certificateId = resolveTargetCertificateId(overrideId);
    setDetailsLoading(true);

    try {
      const details = await getCertificateById(certificateId);
      setCertificateDetails(details || null);
      setSelectedCertificateId(certificateId);
      setCertificateIdInput(String(certificateId));
    } catch (error) {
      toast.error(error.message || "Failed to load certificate details");
    } finally {
      setDetailsLoading(false);
    }
  };

  const loadEligibility = async (overrideId) => {
    const certificateId = resolveTargetCertificateId(overrideId);
    setEligibilityLoading(true);

    try {
      const response = await checkCertificateEligibility(certificateId);
      setEligibility(response || null);
      setSelectedCertificateId(certificateId);
      setCertificateIdInput(String(certificateId));
    } catch (error) {
      toast.error(error.message || "Failed to load eligibility");
    } finally {
      setEligibilityLoading(false);
    }
  };

  const handleSelectRecommendation = async (recommendation) => {
    const certificateId = getCertificateId(recommendation);
    if (!certificateId) {
      toast.error("This recommendation does not include a certificate ID yet");
      return;
    }

    setSelectedCertificateId(certificateId);
    setCertificateIdInput(String(certificateId));

    await Promise.all([
      loadCertificateDetails(certificateId),
      loadEligibility(certificateId),
    ]);
  };

  const handleLoadByInput = async () => {
    const certificateId = parsePositiveInt(certificateIdInput);
    if (!certificateId) {
      toast.error("Enter a valid certificate ID");
      return;
    }

    setSelectedCertificateId(certificateId);
    await Promise.all([
      loadCertificateDetails(certificateId),
      loadEligibility(certificateId),
    ]);
  };

  const handleIssueCertificate = async () => {
    let certificateId = null;
    try {
      certificateId = resolveTargetCertificateId();
    } catch (error) {
      toast.error(error.message || "Select a certificate first");
      return;
    }

    setIssuing(true);
    try {
      await issueCertificate(certificateId, {
        deliveryMode: issueData.deliveryMode,
        adminNotes: issueData.adminNotes,
      });

      toast.success("Certificate issued successfully");
      await Promise.all([
        fetchRecommendations(),
        loadCertificateDetails(certificateId),
        loadEligibility(certificateId),
      ]);
    } catch (error) {
      toast.error(error.message || "Failed to issue certificate");
    } finally {
      setIssuing(false);
    }
  };

  const handleRevokeCertificate = async () => {
    let certificateId = null;
    try {
      certificateId = resolveTargetCertificateId();
    } catch (error) {
      toast.error(error.message || "Select a certificate first");
      return;
    }

    setRevoking(true);
    try {
      await revokeCertificate(certificateId, { reason: revokeReason });
      toast.success("Certificate revoked successfully");
      setRevokeReason("");

      await Promise.all([
        fetchRecommendations(),
        loadCertificateDetails(certificateId),
        loadEligibility(certificateId),
      ]);
    } catch (error) {
      toast.error(error.message || "Failed to revoke certificate");
    } finally {
      setRevoking(false);
    }
  };

  const handleDownload = async () => {
    let certificateId = null;
    try {
      certificateId = resolveTargetCertificateId();
    } catch (error) {
      toast.error(error.message || "Select a certificate first");
      return;
    }

    setDownloading(true);
    try {
      const file = await downloadCertificate(certificateId);
      saveBlob(file.blob, file.filename);
      toast.success("Certificate download started");
    } catch (error) {
      toast.error(error.message || "Failed to download certificate");
    } finally {
      setDownloading(false);
    }
  };

  const eligibilityChecks = useMemo(
    () => buildEligibilityChecks(eligibility),
    [eligibility],
  );

  const overallEligibility = useMemo(
    () => getOverallEligibility(eligibility, eligibilityChecks),
    [eligibility, eligibilityChecks],
  );

  const selectedIdForDisplay =
    parsePositiveInt(selectedCertificateId) ||
    parsePositiveInt(certificateIdInput);

  return (
    <div className="min-h-screen bg-[#F8F4EE] p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl font-bold text-[#1A1A1A] mb-2">
              Certificate Lifecycle Management
            </h1>
            <p className="text-[#6B4423]">
              Review trainer recommendations, validate eligibility, issue
              certificates, and revoke when required.
            </p>
          </div>

          <button
            type="button"
            onClick={() => fetchRecommendations({ showToast: true })}
            disabled={recommendationsLoading}
            className="coffee-gradient text-white px-4 py-2.5 rounded-xl font-semibold hover:opacity-90 transition-all duration-200 shadow-coffee-md flex items-center gap-2 disabled:opacity-60"
          >
            {recommendationsLoading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
            <span>Refresh Queue</span>
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-coffee-md border border-[#C8A27B]/30 p-6">
          <h2 className="text-xl font-bold text-[#1A1A1A] mb-4">
            Pending Recommendation Queue
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#EFE7D3] border-b border-[#C8A27B]">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-bold text-[#1A1A1A]">
                    Certificate ID
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-bold text-[#1A1A1A]">
                    Student
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-bold text-[#1A1A1A]">
                    Module
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-bold text-[#1A1A1A]">
                    Progress
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-bold text-[#1A1A1A]">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-bold text-[#1A1A1A]">
                    Recommended
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-bold text-[#1A1A1A]">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#C8A27B]/25">
                {recommendationsLoading ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-4 py-10 text-center text-[#6B4423]"
                    >
                      <span className="inline-flex items-center gap-2">
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Loading recommendation queue...
                      </span>
                    </td>
                  </tr>
                ) : recommendations.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-4 py-10 text-center text-[#6B4423]"
                    >
                      No recommendations in the queue.
                    </td>
                  </tr>
                ) : (
                  recommendations.map((recommendation, index) => {
                    const certificateId = getCertificateId(recommendation);
                    const status = pickDisplay(
                      recommendation,
                      ["status", "certificateStatus", "state"],
                      "Recommended",
                    );

                    return (
                      <tr
                        key={`${certificateId || "recommendation"}-${index}`}
                        className="hover:bg-[#F8F4EE]/60"
                      >
                        <td className="px-4 py-3 text-sm text-[#1A1A1A]">
                          {certificateId || "-"}
                        </td>
                        <td className="px-4 py-3 text-sm text-[#4A2F19]">
                          {pickDisplay(
                            recommendation,
                            ["studentName", "fullName"],
                            "-",
                          )}
                          <div className="text-xs text-[#6B4423]">
                            ID:{" "}
                            {pickDisplay(recommendation, ["studentId"], "-")}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-[#4A2F19]">
                          {pickDisplay(recommendation, [
                            "moduleName",
                            "module",
                            "courseName",
                            "title",
                          ])}
                        </td>
                        <td className="px-4 py-3 text-sm text-[#4A2F19]">
                          {pickDisplay(
                            recommendation,
                            ["progressPercent", "progress"],
                            "-",
                          )}
                          {"%"}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <span
                            className={`px-2 py-1 rounded-md font-semibold ${getStatusClass(status)}`}
                          >
                            {status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-[#6B4423]">
                          {formatDate(
                            recommendation?.recommendedAt ||
                              recommendation?.createdAt ||
                              recommendation?.updatedAt,
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <button
                            type="button"
                            onClick={() =>
                              handleSelectRecommendation(recommendation)
                            }
                            disabled={!certificateId}
                            className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-[#C8A27B] text-[#4A2F19] hover:bg-[#F8F4EE] flex items-center gap-1 disabled:opacity-50"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            Select
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-coffee-md border border-[#C8A27B]/30 p-6 space-y-4">
          <h2 className="text-xl font-bold text-[#1A1A1A]">
            Certificate Control Panel
          </h2>

          <div className="flex flex-wrap items-end gap-3">
            <div>
              <label className="block text-sm font-semibold text-[#4A2F19] mb-2">
                Certificate ID
              </label>
              <input
                type="number"
                min="1"
                value={certificateIdInput}
                onChange={(event) => setCertificateIdInput(event.target.value)}
                className="px-4 py-2 rounded-lg border-2 border-[#C8A27B]/40 bg-[#F8F4EE] focus:outline-none focus:border-[#4A2F19]"
                placeholder="Enter certificate ID"
              />
            </div>

            <button
              type="button"
              onClick={handleLoadByInput}
              disabled={detailsLoading || eligibilityLoading}
              className="px-4 py-2 rounded-lg bg-[#4A2F19] text-white font-semibold hover:bg-[#6B4423] transition-colors flex items-center gap-2 disabled:opacity-60"
            >
              {detailsLoading || eligibilityLoading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Search className="w-4 h-4" />
              )}
              <span>Load Details + Eligibility</span>
            </button>

            <button
              type="button"
              onClick={handleDownload}
              disabled={downloading || !selectedIdForDisplay}
              className="px-4 py-2 rounded-lg border border-[#C8A27B] text-[#4A2F19] font-semibold hover:bg-[#F8F4EE] transition-colors flex items-center gap-2 disabled:opacity-60"
            >
              {downloading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              <span>Download</span>
            </button>
          </div>

          {selectedIdForDisplay && (
            <p className="text-sm text-[#6B4423]">
              Selected Certificate ID: {selectedIdForDisplay}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl shadow-coffee-md border border-[#C8A27B]/30 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-[#1A1A1A]">
                Certificate Details
              </h2>
              {detailsLoading && (
                <RefreshCw className="w-4 h-4 text-[#6B4423] animate-spin" />
              )}
            </div>

            {!certificateDetails ? (
              <p className="text-[#6B4423]">
                Load a certificate ID to view detail summary.
              </p>
            ) : (
              <div className="space-y-2 text-sm">
                <p className="text-[#4A2F19]">
                  <span className="font-semibold text-[#1A1A1A]">Number:</span>{" "}
                  {pickDisplay(certificateDetails, [
                    "certificateNumber",
                    "number",
                    "code",
                  ])}
                </p>
                <p className="text-[#4A2F19]">
                  <span className="font-semibold text-[#1A1A1A]">Status:</span>{" "}
                  {pickDisplay(certificateDetails, [
                    "status",
                    "certificateStatus",
                    "state",
                  ])}
                </p>
                <p className="text-[#4A2F19]">
                  <span className="font-semibold text-[#1A1A1A]">Student:</span>{" "}
                  {pickDisplay(certificateDetails, ["studentName", "fullName"])}
                </p>
                <p className="text-[#4A2F19]">
                  <span className="font-semibold text-[#1A1A1A]">Module:</span>{" "}
                  {pickDisplay(certificateDetails, [
                    "moduleName",
                    "module",
                    "courseName",
                    "title",
                  ])}
                </p>
                <p className="text-[#4A2F19]">
                  <span className="font-semibold text-[#1A1A1A]">
                    Issued At:
                  </span>{" "}
                  {formatDate(
                    certificateDetails?.issuedAt ||
                      certificateDetails?.issueDate,
                  )}
                </p>
                <p className="text-[#4A2F19]">
                  <span className="font-semibold text-[#1A1A1A]">
                    Delivery Mode:
                  </span>{" "}
                  {pickDisplay(certificateDetails, ["deliveryMode"], "-")}
                </p>

                <details className="mt-4">
                  <summary className="cursor-pointer text-[#4A2F19] font-semibold">
                    View Raw Payload
                  </summary>
                  <pre className="mt-2 bg-[#F8F4EE] border border-[#C8A27B]/30 rounded-xl p-3 overflow-auto text-xs text-[#4A2F19]">
                    {JSON.stringify(certificateDetails, null, 2)}
                  </pre>
                </details>
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl shadow-coffee-md border border-[#C8A27B]/30 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-[#1A1A1A]">
                Eligibility Review
              </h2>
              {eligibilityLoading && (
                <RefreshCw className="w-4 h-4 text-[#6B4423] animate-spin" />
              )}
            </div>

            {!eligibility ? (
              <p className="text-[#6B4423]">
                Run eligibility check for trainer recommendation, attendance,
                and fee clearance.
              </p>
            ) : (
              <div className="space-y-3">
                {overallEligibility !== null && (
                  <div
                    className={`rounded-xl px-3 py-2 font-semibold flex items-center gap-2 ${
                      overallEligibility
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {overallEligibility ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : (
                      <XCircle className="w-4 h-4" />
                    )}
                    {overallEligibility
                      ? "Eligible for issuance"
                      : "Not eligible yet"}
                  </div>
                )}

                {eligibilityChecks.length === 0 ? (
                  <p className="text-sm text-[#6B4423]">
                    No structured check list was returned by the API. Open the
                    raw payload for details.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {eligibilityChecks.map((check) => (
                      <div
                        key={check.key}
                        className="border border-[#C8A27B]/30 rounded-xl p-3"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-semibold text-[#1A1A1A] m-0">
                            {check.label}
                          </p>
                          <span
                            className={`px-2 py-1 rounded-md text-xs font-semibold ${
                              check.passed
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {check.passed ? "Pass" : "Fail"}
                          </span>
                        </div>
                        {check.note && (
                          <p className="text-sm text-[#6B4423] mt-1 m-0">
                            {check.note}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                <details className="mt-4">
                  <summary className="cursor-pointer text-[#4A2F19] font-semibold">
                    View Raw Eligibility Payload
                  </summary>
                  <pre className="mt-2 bg-[#F8F4EE] border border-[#C8A27B]/30 rounded-xl p-3 overflow-auto text-xs text-[#4A2F19]">
                    {JSON.stringify(eligibility, null, 2)}
                  </pre>
                </details>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl shadow-coffee-md border border-[#C8A27B]/30 p-6 space-y-3">
            <h2 className="text-xl font-bold text-[#1A1A1A]">
              Issue Certificate
            </h2>

            <div>
              <label className="block text-sm font-semibold text-[#4A2F19] mb-2">
                Delivery Mode
              </label>
              <select
                value={issueData.deliveryMode}
                onChange={(event) =>
                  setIssueData((prev) => ({
                    ...prev,
                    deliveryMode: event.target.value,
                  }))
                }
                className="w-full px-4 py-2 rounded-lg border-2 border-[#C8A27B]/40 bg-[#F8F4EE] focus:outline-none focus:border-[#4A2F19]"
              >
                <option value={DELIVERY_MODE.DIGITAL}>Digital</option>
                <option value={DELIVERY_MODE.OFFICE_PICKUP}>
                  Office Pickup
                </option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#4A2F19] mb-2">
                Admin Notes (optional)
              </label>
              <textarea
                maxLength={1000}
                rows={4}
                value={issueData.adminNotes}
                onChange={(event) =>
                  setIssueData((prev) => ({
                    ...prev,
                    adminNotes: event.target.value,
                  }))
                }
                className="w-full px-4 py-2 rounded-lg border-2 border-[#C8A27B]/40 bg-[#F8F4EE] focus:outline-none focus:border-[#4A2F19]"
                placeholder="Optional issuance notes"
              />
            </div>

            <button
              type="button"
              onClick={handleIssueCertificate}
              disabled={issuing || !selectedIdForDisplay}
              className="px-4 py-2.5 rounded-lg bg-emerald-700 text-white font-semibold hover:bg-emerald-800 transition-colors flex items-center gap-2 disabled:opacity-60"
            >
              {issuing ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              <span>{issuing ? "Issuing..." : "Issue Certificate"}</span>
            </button>
          </div>

          <div className="bg-white rounded-2xl shadow-coffee-md border border-[#C8A27B]/30 p-6 space-y-3">
            <h2 className="text-xl font-bold text-[#1A1A1A]">
              Revoke Certificate
            </h2>

            <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-700 flex items-start gap-2">
              <ShieldAlert className="w-4 h-4 mt-0.5 shrink-0" />
              Revoke should only be used for invalidated or withdrawn
              certifications.
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#4A2F19] mb-2">
                Reason
              </label>
              <textarea
                maxLength={500}
                rows={4}
                value={revokeReason}
                onChange={(event) => setRevokeReason(event.target.value)}
                className="w-full px-4 py-2 rounded-lg border-2 border-[#C8A27B]/40 bg-[#F8F4EE] focus:outline-none focus:border-[#4A2F19]"
                placeholder="Provide revocation reason"
              />
            </div>

            <button
              type="button"
              onClick={handleRevokeCertificate}
              disabled={revoking || !selectedIdForDisplay}
              className="px-4 py-2.5 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 transition-colors flex items-center gap-2 disabled:opacity-60"
            >
              {revoking ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <XCircle className="w-4 h-4" />
              )}
              <span>{revoking ? "Revoking..." : "Revoke Certificate"}</span>
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-xl bg-[#EFE7D3] border border-[#C8A27B]/40 px-4 py-3 text-sm text-[#4A2F19]">
          <Award className="w-4 h-4" />
          Lifecycle: Recommended to Eligibility Check to Issued to Optional
          Revoked.
        </div>
      </div>
    </div>
  );
}

export default CertificateManagement;
