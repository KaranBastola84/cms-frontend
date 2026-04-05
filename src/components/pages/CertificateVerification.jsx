import React, { useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import {
  AlertTriangle,
  BadgeCheck,
  QrCode,
  RefreshCw,
  Search,
  ShieldX,
} from "lucide-react";
import { verifyCertificate } from "../../services/certificateService";

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

const resolveVerificationState = (result) => {
  if (!result) {
    return {
      kind: "idle",
      label: "Awaiting verification",
      className: "bg-slate-100 text-slate-700",
      Icon: AlertTriangle,
    };
  }

  const explicitValid = result?.isValid ?? result?.valid ?? result?.verified;
  if (typeof explicitValid === "boolean") {
    return explicitValid
      ? {
          kind: "valid",
          label: "Certificate verified",
          className: "bg-emerald-100 text-emerald-800",
          Icon: BadgeCheck,
        }
      : {
          kind: "invalid",
          label: "Certificate invalid",
          className: "bg-red-100 text-red-800",
          Icon: ShieldX,
        };
  }

  const statusText = String(
    result?.status || result?.certificateStatus || result?.state || "",
  ).toLowerCase();

  if (statusText.includes("revoke") || statusText.includes("invalid")) {
    return {
      kind: "invalid",
      label: "Certificate invalid",
      className: "bg-red-100 text-red-800",
      Icon: ShieldX,
    };
  }

  if (statusText.includes("issue") || statusText.includes("valid")) {
    return {
      kind: "valid",
      label: "Certificate verified",
      className: "bg-emerald-100 text-emerald-800",
      Icon: BadgeCheck,
    };
  }

  return {
    kind: "unknown",
    label: "Verification completed",
    className: "bg-amber-100 text-amber-800",
    Icon: AlertTriangle,
  };
};

function CertificateVerification() {
  const { certificateNumber: certificateNumberFromPath } = useParams();
  const [searchParams] = useSearchParams();

  const [certificateNumber, setCertificateNumber] = useState("");
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const verificationState = useMemo(
    () => resolveVerificationState(result),
    [result],
  );

  const runVerification = async (numberValue, tokenValue = "") => {
    const normalizedNumber = String(numberValue || "").trim();
    if (!normalizedNumber) {
      toast.error("Certificate number is required");
      return;
    }

    setLoading(true);
    try {
      const response = await verifyCertificate(normalizedNumber, tokenValue);
      setResult(response || null);
      toast.success("Verification completed");
    } catch (error) {
      setResult(null);
      toast.error(error.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fromPath = String(certificateNumberFromPath || "").trim();
    const fromQuery = String(
      searchParams.get("certificateNumber") || searchParams.get("number") || "",
    ).trim();
    const resolvedNumber = fromPath || fromQuery;

    const resolvedToken = String(searchParams.get("token") || "").trim();

    if (resolvedNumber) {
      setCertificateNumber(resolvedNumber);
      setToken(resolvedToken);
      runVerification(resolvedNumber, resolvedToken);
    }
  }, [certificateNumberFromPath, searchParams]);

  return (
    <div className="min-h-screen bg-[#F8F4EE] p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center space-y-3">
          <div className="inline-flex w-14 h-14 rounded-2xl bg-[#EFE7D3] text-[#4A2F19] items-center justify-center">
            <QrCode className="w-7 h-7" />
          </div>
          <h1 className="text-3xl font-bold text-[#1A1A1A]">
            Certificate Verification
          </h1>
          <p className="text-[#6B4423]">
            Validate certificate authenticity using certificate number and an
            optional security token.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-coffee-md border border-[#C8A27B]/30 p-6">
          <form
            onSubmit={(event) => {
              event.preventDefault();
              runVerification(certificateNumber, token);
            }}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            <div>
              <label className="block text-sm font-semibold text-[#4A2F19] mb-2">
                Certificate Number
              </label>
              <input
                type="text"
                value={certificateNumber}
                onChange={(event) => setCertificateNumber(event.target.value)}
                className="w-full px-4 py-2 rounded-lg border-2 border-[#C8A27B]/40 bg-[#F8F4EE] focus:outline-none focus:border-[#4A2F19]"
                placeholder="Example: CERT-2026-000123"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#4A2F19] mb-2">
                Verification Token (optional)
              </label>
              <input
                type="text"
                value={token}
                onChange={(event) => setToken(event.target.value)}
                className="w-full px-4 py-2 rounded-lg border-2 border-[#C8A27B]/40 bg-[#F8F4EE] focus:outline-none focus:border-[#4A2F19]"
                placeholder="Optional token or QR value"
              />
            </div>

            <div className="md:col-span-2 flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="coffee-gradient text-white px-5 py-2.5 rounded-xl font-semibold hover:opacity-90 transition-all duration-200 shadow-coffee-md flex items-center gap-2 disabled:opacity-60"
              >
                {loading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Search className="w-4 h-4" />
                )}
                <span>{loading ? "Verifying..." : "Verify Certificate"}</span>
              </button>
            </div>
          </form>
        </div>

        <div className="bg-white rounded-2xl shadow-coffee-md border border-[#C8A27B]/30 p-6 space-y-4">
          <div
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg font-semibold ${verificationState.className}`}
          >
            <verificationState.Icon className="w-4 h-4" />
            {verificationState.label}
          </div>

          {!result ? (
            <p className="text-[#6B4423]">
              Enter a certificate number and run verification.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="rounded-xl bg-[#F8F4EE] border border-[#C8A27B]/30 p-4">
                <p className="m-0 text-[#6B4423]">Certificate Number</p>
                <p className="m-0 mt-1 font-semibold text-[#1A1A1A]">
                  {pickDisplay(result, ["certificateNumber", "number", "code"])}
                </p>
              </div>

              <div className="rounded-xl bg-[#F8F4EE] border border-[#C8A27B]/30 p-4">
                <p className="m-0 text-[#6B4423]">Status</p>
                <p className="m-0 mt-1 font-semibold text-[#1A1A1A]">
                  {pickDisplay(result, [
                    "status",
                    "certificateStatus",
                    "state",
                  ])}
                </p>
              </div>

              <div className="rounded-xl bg-[#F8F4EE] border border-[#C8A27B]/30 p-4">
                <p className="m-0 text-[#6B4423]">Student</p>
                <p className="m-0 mt-1 font-semibold text-[#1A1A1A]">
                  {pickDisplay(result, ["studentName", "fullName", "student"])}
                </p>
              </div>

              <div className="rounded-xl bg-[#F8F4EE] border border-[#C8A27B]/30 p-4">
                <p className="m-0 text-[#6B4423]">Module</p>
                <p className="m-0 mt-1 font-semibold text-[#1A1A1A]">
                  {pickDisplay(result, [
                    "moduleName",
                    "module",
                    "courseName",
                    "title",
                  ])}
                </p>
              </div>

              <div className="rounded-xl bg-[#F8F4EE] border border-[#C8A27B]/30 p-4 md:col-span-2">
                <p className="m-0 text-[#6B4423]">Issued / Updated</p>
                <p className="m-0 mt-1 font-semibold text-[#1A1A1A]">
                  {formatDate(
                    result?.issuedAt || result?.issueDate || result?.updatedAt,
                  )}
                </p>
              </div>

              <details className="md:col-span-2">
                <summary className="cursor-pointer text-[#4A2F19] font-semibold">
                  View Raw Verification Payload
                </summary>
                <pre className="mt-2 bg-[#F8F4EE] border border-[#C8A27B]/30 rounded-xl p-3 overflow-auto text-xs text-[#4A2F19]">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </details>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CertificateVerification;
