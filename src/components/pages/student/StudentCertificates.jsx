import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { Download, RefreshCw, SearchCheck, ShieldCheck } from "lucide-react";
import {
  downloadCertificate,
  getMyCertificates,
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

const getCertificateNumber = (certificate) => {
  return (
    certificate?.certificateNumber ||
    certificate?.number ||
    certificate?.code ||
    "-"
  );
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

function StudentCertificates() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [certificates, setCertificates] = useState([]);
  const [downloadingId, setDownloadingId] = useState(null);

  const fetchCertificates = async ({ silent = false } = {}) => {
    if (silent) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const response = await getMyCertificates();
      const list = toArray(response);
      setCertificates(list);
      if (silent) {
        toast.success("Certificates refreshed");
      }
    } catch (error) {
      setCertificates([]);
      toast.error(error.message || "Failed to load certificates");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCertificates();
  }, []);

  const handleDownload = async (certificate) => {
    const certificateId = getCertificateId(certificate);
    if (!certificateId) {
      toast.error("Certificate is not downloadable yet");
      return;
    }

    setDownloadingId(certificateId);
    try {
      const file = await downloadCertificate(certificateId);
      saveBlob(file.blob, file.filename);
      toast.success("Certificate download started");
    } catch (error) {
      toast.error(error.message || "Failed to download certificate");
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F4EE] p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl font-bold text-[#1A1A1A] mb-2">
              My Certificates
            </h1>
            <p className="text-[#6B4423]">
              View all issued certificates, download digital copies, and verify
              authenticity.
            </p>
          </div>

          <button
            type="button"
            onClick={() => fetchCertificates({ silent: true })}
            disabled={refreshing}
            className="coffee-gradient text-white px-4 py-2.5 rounded-xl font-semibold hover:opacity-90 transition-all duration-200 shadow-coffee-md flex items-center gap-2 disabled:opacity-60"
          >
            {refreshing ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
            <span>Refresh</span>
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-coffee-md border border-[#C8A27B]/30 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#EFE7D3] border-b border-[#C8A27B]">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-bold text-[#1A1A1A]">
                    Certificate #
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-bold text-[#1A1A1A]">
                    Module
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-bold text-[#1A1A1A]">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-bold text-[#1A1A1A]">
                    Issued Date
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-bold text-[#1A1A1A]">
                    Delivery
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-bold text-[#1A1A1A]">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#C8A27B]/25">
                {loading ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-10 text-center text-[#6B4423]"
                    >
                      <span className="inline-flex items-center gap-2">
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Loading certificates...
                      </span>
                    </td>
                  </tr>
                ) : certificates.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center">
                      <div className="flex flex-col items-center gap-3 text-[#6B4423]">
                        <ShieldCheck className="w-10 h-10 opacity-60" />
                        <p>No certificates available yet.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  certificates.map((certificate, index) => {
                    const certificateId = getCertificateId(certificate);
                    const certificateNumber = getCertificateNumber(certificate);
                    return (
                      <tr
                        key={`${certificateId || "certificate"}-${index}`}
                        className="hover:bg-[#F8F4EE]/60"
                      >
                        <td className="px-4 py-3 text-sm text-[#4A2F19] font-semibold">
                          {certificateNumber}
                        </td>
                        <td className="px-4 py-3 text-sm text-[#4A2F19]">
                          {getDisplay(certificate, [
                            "moduleName",
                            "module",
                            "courseName",
                            "title",
                          ])}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <span className="px-2 py-1 rounded-md bg-[#EFE7D3] text-[#4A2F19] font-semibold">
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
                        <td className="px-4 py-3 text-sm text-[#6B4423]">
                          {getDisplay(certificate, ["deliveryMode"], "-")}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
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

                            {certificateNumber !== "-" && (
                              <Link
                                to={`/certificate/verify/${encodeURIComponent(
                                  certificateNumber,
                                )}`}
                                className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-[#C8A27B] text-[#4A2F19] hover:bg-[#F8F4EE] flex items-center gap-1 no-underline"
                              >
                                <SearchCheck className="w-3.5 h-3.5" />
                                Verify
                              </Link>
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
      </div>
    </div>
  );
}

export default StudentCertificates;
