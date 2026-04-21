import React, { useState } from "react";
import toast from "react-hot-toast";
import { Award, Download, Eye, RefreshCw, Search, Send } from "lucide-react";
import {
  createCertificateRecommendation,
  downloadCertificate,
  getCertificateById,
  getCertificatesByStudentId,
} from "../../../services/certificateService";

const toArray = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.certificates)) return payload.certificates;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
};

const getCertificateId = (certificate) => {
  return Number(
    certificate?.certificateId ||
      certificate?.id ||
      certificate?.certificate?.id ||
      0,
  );
};

const getCertificateNumber = (certificate) => {
  return (
    certificate?.certificateNumber ||
    certificate?.number ||
    certificate?.code ||
    "-"
  );
};

const getModuleName = (certificate) => {
  return (
    certificate?.moduleName ||
    certificate?.module ||
    certificate?.courseName ||
    certificate?.title ||
    "-"
  );
};

const getStatus = (certificate) => {
  return (
    certificate?.status ||
    certificate?.certificateStatus ||
    certificate?.state ||
    "Unknown"
  );
};

const getIssuedDate = (certificate) => {
  const rawValue =
    certificate?.issuedAt ||
    certificate?.issueDate ||
    certificate?.createdAt ||
    certificate?.recommendedAt;

  if (!rawValue) return "-";
  const parsed = new Date(rawValue);
  if (Number.isNaN(parsed.getTime())) return "-";
  return parsed.toLocaleString();
};

const downloadBlob = (blob, filename) => {
  const objectUrl = window.URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = objectUrl;
  anchor.download = filename || "certificate.pdf";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.URL.revokeObjectURL(objectUrl);
};

function CertificateRecommendations() {
  const [submitting, setSubmitting] = useState(false);
  const [fetchingCertificates, setFetchingCertificates] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [downloadingId, setDownloadingId] = useState(null);

  const [formData, setFormData] = useState({
    studentId: "",
    moduleName: "",
    progressPercent: "",
    recommendationNotes: "",
  });

  const [lookupStudentId, setLookupStudentId] = useState("");
  const [certificates, setCertificates] = useState([]);
  const [selectedCertificate, setSelectedCertificate] = useState(null);

  const handleSubmitRecommendation = async (event) => {
    event.preventDefault();
    setSubmitting(true);

    try {
      await createCertificateRecommendation({
        studentId: formData.studentId,
        moduleName: formData.moduleName,
        progressPercent: formData.progressPercent,
        recommendationNotes: formData.recommendationNotes,
      });

      toast.success("Certificate recommendation submitted");
      setFormData((prev) => ({
        ...prev,
        moduleName: "",
        progressPercent: "",
        recommendationNotes: "",
      }));
    } catch (error) {
      toast.error(error.message || "Failed to submit recommendation");
    } finally {
      setSubmitting(false);
    }
  };

  const handleLookupCertificates = async () => {
    setFetchingCertificates(true);
    setSelectedCertificate(null);

    try {
      const result = await getCertificatesByStudentId(lookupStudentId);
      const resolved = toArray(result);
      setCertificates(resolved);
      toast.success(
        resolved.length > 0
          ? `Loaded ${resolved.length} certificate record(s)`
          : "No certificates found for this student",
      );
    } catch (error) {
      setCertificates([]);
      toast.error(error.message || "Failed to load student certificates");
    } finally {
      setFetchingCertificates(false);
    }
  };

  const handleViewDetails = async (certificate) => {
    const certificateId = getCertificateId(certificate);
    if (!certificateId) {
      toast.error("Certificate ID is missing in this record");
      return;
    }

    setLoadingDetails(true);
    try {
      const details = await getCertificateById(certificateId);
      setSelectedCertificate(details || null);
    } catch (error) {
      toast.error(error.message || "Failed to load certificate details");
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleDownload = async (certificate) => {
    const certificateId = getCertificateId(certificate);
    if (!certificateId) {
      toast.error("Certificate ID is missing in this record");
      return;
    }

    setDownloadingId(certificateId);
    try {
      const result = await downloadCertificate(certificateId);
      downloadBlob(result.blob, result.filename);
      toast.success("Certificate download started");
    } catch (error) {
      toast.error(error.message || "Failed to download certificate");
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F4EE] p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[#1A1A1A] mb-2">
              Certificate Recommendations
            </h1>
            <p className="text-[#6B4423]">
              Recommend students for module completion certificates and review
              current certificate records.
            </p>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-[#EFE7D3] text-[#4A2F19] flex items-center justify-center">
            <Award className="w-7 h-7" />
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-coffee-md border border-[#C8A27B]/30 p-6">
          <h2 className="text-xl font-bold text-[#1A1A1A] mb-4">
            Submit Recommendation
          </h2>

          <form
            onSubmit={handleSubmitRecommendation}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            <div>
              <label className="block text-sm font-semibold text-[#4A2F19] mb-2">
                Student ID
              </label>
              <input
                type="number"
                min="1"
                value={formData.studentId}
                onChange={(event) =>
                  setFormData((prev) => ({
                    ...prev,
                    studentId: event.target.value,
                  }))
                }
                required
                className="w-full px-4 py-2 rounded-lg border-2 border-[#C8A27B]/40 bg-[#F8F4EE] focus:outline-none focus:border-[#4A2F19]"
                placeholder="Enter student ID"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#4A2F19] mb-2">
                Module Name
              </label>
              <input
                type="text"
                maxLength={150}
                value={formData.moduleName}
                onChange={(event) =>
                  setFormData((prev) => ({
                    ...prev,
                    moduleName: event.target.value,
                  }))
                }
                required
                className="w-full px-4 py-2 rounded-lg border-2 border-[#C8A27B]/40 bg-[#F8F4EE] focus:outline-none focus:border-[#4A2F19]"
                placeholder="Example: Advanced Latte Art"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#4A2F19] mb-2">
                Progress Percent (0-100)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={formData.progressPercent}
                onChange={(event) =>
                  setFormData((prev) => ({
                    ...prev,
                    progressPercent: event.target.value,
                  }))
                }
                required
                className="w-full px-4 py-2 rounded-lg border-2 border-[#C8A27B]/40 bg-[#F8F4EE] focus:outline-none focus:border-[#4A2F19]"
                placeholder="95"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-[#4A2F19] mb-2">
                Recommendation Notes (optional)
              </label>
              <textarea
                maxLength={1000}
                rows={4}
                value={formData.recommendationNotes}
                onChange={(event) =>
                  setFormData((prev) => ({
                    ...prev,
                    recommendationNotes: event.target.value,
                  }))
                }
                className="w-full px-4 py-2 rounded-lg border-2 border-[#C8A27B]/40 bg-[#F8F4EE] focus:outline-none focus:border-[#4A2F19]"
                placeholder="Share key readiness notes for admin review"
              />
            </div>

            <div className="md:col-span-2 flex justify-end">
              <button
                type="submit"
                disabled={submitting}
                className="coffee-gradient text-white px-5 py-2.5 rounded-xl font-semibold hover:opacity-90 transition-all duration-200 shadow-coffee-md flex items-center gap-2 disabled:opacity-60"
              >
                {submitting ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                <span>
                  {submitting ? "Submitting Recommendation..." : "Submit"}
                </span>
              </button>
            </div>
          </form>
        </div>

        <div className="bg-white rounded-2xl shadow-coffee-md border border-[#C8A27B]/30 p-6">
          <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
            <h2 className="text-xl font-bold text-[#1A1A1A]">
              Student Certificate Records
            </h2>

            <div className="flex items-center gap-2">
              <input
                type="number"
                min="1"
                value={lookupStudentId}
                onChange={(event) => setLookupStudentId(event.target.value)}
                className="px-3 py-2 rounded-lg border-2 border-[#C8A27B]/40 bg-[#F8F4EE] focus:outline-none focus:border-[#4A2F19]"
                placeholder="Student ID"
              />
              <button
                type="button"
                onClick={handleLookupCertificates}
                disabled={fetchingCertificates}
                className="px-4 py-2 rounded-lg bg-[#4A2F19] text-white font-semibold hover:bg-[#6B4423] transition-colors flex items-center gap-2 disabled:opacity-60"
              >
                {fetchingCertificates ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Search className="w-4 h-4" />
                )}
                <span>Lookup</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#EFE7D3] border-b border-[#C8A27B]">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-bold text-[#1A1A1A]">
                    Certificate ID
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-bold text-[#1A1A1A]">
                    Number
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-bold text-[#1A1A1A]">
                    Module
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-bold text-[#1A1A1A]">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-bold text-[#1A1A1A]">
                    Updated
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-bold text-[#1A1A1A]">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#C8A27B]/25">
                {certificates.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-10 text-center text-[#6B4423]"
                    >
                      No certificate records loaded.
                    </td>
                  </tr>
                ) : (
                  certificates.map((certificate, index) => {
                    const certificateId = getCertificateId(certificate);
                    return (
                      <tr key={`${certificateId || "row"}-${index}`}>
                        <td className="px-4 py-3 text-sm text-[#1A1A1A]">
                          {certificateId || "-"}
                        </td>
                        <td className="px-4 py-3 text-sm text-[#4A2F19]">
                          {getCertificateNumber(certificate)}
                        </td>
                        <td className="px-4 py-3 text-sm text-[#4A2F19]">
                          {getModuleName(certificate)}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <span className="px-2 py-1 rounded-md bg-[#EFE7D3] text-[#4A2F19] font-semibold">
                            {String(getStatus(certificate))}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-[#6B4423]">
                          {getIssuedDate(certificate)}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => handleViewDetails(certificate)}
                              disabled={loadingDetails}
                              className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-[#C8A27B] text-[#4A2F19] hover:bg-[#F8F4EE] flex items-center gap-1 disabled:opacity-60"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              View
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDownload(certificate)}
                              disabled={
                                !certificateId ||
                                downloadingId === certificateId
                              }
                              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#4A2F19] text-white hover:bg-[#6B4423] flex items-center gap-1 disabled:opacity-60"
                            >
                              {downloadingId === certificateId ? (
                                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <Download className="w-3.5 h-3.5" />
                              )}
                              Download
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
        </div>

        {selectedCertificate && (
          <div className="bg-white rounded-2xl shadow-coffee-md border border-[#C8A27B]/30 p-6">
            <h2 className="text-xl font-bold text-[#1A1A1A] mb-3">
              Certificate Details
            </h2>
            <pre className="bg-[#F8F4EE] border border-[#C8A27B]/30 rounded-xl p-4 overflow-auto text-sm text-[#4A2F19]">
              {JSON.stringify(selectedCertificate, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}

export default CertificateRecommendations;
