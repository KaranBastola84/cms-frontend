import React, { useState } from "react";
import toast from "react-hot-toast";
import { Download, Eye, RefreshCw, Search, ShieldCheck } from "lucide-react";
import {
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
  return Number(certificate?.certificateId || certificate?.id || 0);
};

const getDisplay = (certificate, keys, fallback = "-") => {
  for (const key of keys) {
    const value = certificate?.[key];
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

function CertificateRecords() {
  const [studentId, setStudentId] = useState("");
  const [loading, setLoading] = useState(false);
  const [records, setRecords] = useState([]);
  const [selectedCertificate, setSelectedCertificate] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [downloadingId, setDownloadingId] = useState(null);

  const loadRecords = async () => {
    setLoading(true);
    setSelectedCertificate(null);

    try {
      const response = await getCertificatesByStudentId(studentId);
      const list = toArray(response);
      setRecords(list);
      toast.success(
        list.length > 0
          ? `Loaded ${list.length} certificate(s)`
          : "No certificates found",
      );
    } catch (error) {
      setRecords([]);
      toast.error(error.message || "Failed to load certificates");
    } finally {
      setLoading(false);
    }
  };

  const viewDetails = async (certificate) => {
    const certificateId = getCertificateId(certificate);
    if (!certificateId) {
      toast.error("Certificate ID is missing for this record");
      return;
    }

    setLoadingDetails(true);
    try {
      const details = await getCertificateById(certificateId);
      setSelectedCertificate(details || null);
    } catch (error) {
      toast.error(error.message || "Failed to fetch certificate details");
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleDownload = async (certificate) => {
    const certificateId = getCertificateId(certificate);
    if (!certificateId) {
      toast.error("Certificate ID is missing for this record");
      return;
    }

    setDownloadingId(certificateId);
    try {
      const result = await downloadCertificate(certificateId);
      saveBlob(result.blob, result.filename);
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
              Certificate Records
            </h1>
            <p className="text-[#6B4423]">
              Lookup student certificates, open details, and download available
              files.
            </p>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-[#EFE7D3] text-[#4A2F19] flex items-center justify-center">
            <ShieldCheck className="w-7 h-7" />
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-coffee-md border border-[#C8A27B]/30 p-6">
          <div className="flex flex-wrap items-end gap-3">
            <div>
              <label className="block text-sm font-semibold text-[#4A2F19] mb-2">
                Student ID
              </label>
              <input
                type="number"
                min="1"
                value={studentId}
                onChange={(event) => setStudentId(event.target.value)}
                className="px-4 py-2 rounded-lg border-2 border-[#C8A27B]/40 bg-[#F8F4EE] focus:outline-none focus:border-[#4A2F19]"
                placeholder="Enter student ID"
              />
            </div>

            <button
              type="button"
              onClick={loadRecords}
              disabled={loading}
              className="px-4 py-2 rounded-lg bg-[#4A2F19] text-white font-semibold hover:bg-[#6B4423] transition-colors flex items-center gap-2 disabled:opacity-60"
            >
              {loading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Search className="w-4 h-4" />
              )}
              <span>Search</span>
            </button>
          </div>

          <div className="overflow-x-auto mt-6">
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
                    Issued
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-bold text-[#1A1A1A]">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#C8A27B]/25">
                {records.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-10 text-center text-[#6B4423]"
                    >
                      Search by student ID to see certificate records.
                    </td>
                  </tr>
                ) : (
                  records.map((certificate, index) => {
                    const certificateId = getCertificateId(certificate);
                    return (
                      <tr
                        key={`${certificateId || "record"}-${index}`}
                        className="hover:bg-[#F8F4EE]/60"
                      >
                        <td className="px-4 py-3 text-sm text-[#1A1A1A]">
                          {certificateId || "-"}
                        </td>
                        <td className="px-4 py-3 text-sm text-[#4A2F19]">
                          {getDisplay(certificate, [
                            "certificateNumber",
                            "number",
                            "code",
                          ])}
                        </td>
                        <td className="px-4 py-3 text-sm text-[#4A2F19]">
                          {getDisplay(certificate, [
                            "moduleName",
                            "module",
                            "courseName",
                            "title",
                          ])}
                        </td>
                        <td className="px-4 py-3 text-sm text-[#4A2F19]">
                          <span className="px-2 py-1 rounded-md bg-[#EFE7D3] font-semibold">
                            {getDisplay(certificate, [
                              "status",
                              "certificateStatus",
                              "state",
                            ])}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-[#6B4423]">
                          {formatDate(
                            certificate?.issuedAt ||
                              certificate?.issueDate ||
                              certificate?.createdAt,
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => viewDetails(certificate)}
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

export default CertificateRecords;
