import apiInstance from "../config/api";
import { extractApiErrorMessage } from "../utils/helpers";

export const DELIVERY_MODE = {
  DIGITAL: "Digital",
  OFFICE_PICKUP: "OfficePickup",
};

const DELIVERY_MODE_SET = new Set(Object.values(DELIVERY_MODE));

const parsePositiveInt = (value, label = "ID") => {
  const numericValue = Number(value);
  if (!Number.isInteger(numericValue) || numericValue <= 0) {
    throw new Error(`Invalid ${label}`);
  }
  return numericValue;
};

const parseRequiredString = (value, label, maxLength) => {
  const normalized = String(value || "").trim();
  if (!normalized) {
    throw new Error(`${label} is required`);
  }

  if (maxLength && normalized.length > maxLength) {
    throw new Error(`${label} cannot exceed ${maxLength} characters`);
  }

  return normalized;
};

const parseOptionalString = (value, label, maxLength) => {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }

  const normalized = String(value).trim();
  if (!normalized) return undefined;

  if (maxLength && normalized.length > maxLength) {
    throw new Error(`${label} cannot exceed ${maxLength} characters`);
  }

  return normalized;
};

const parseBoundedNumber = (value, label, min, max) => {
  const numericValue = Number(value);
  if (Number.isNaN(numericValue)) {
    throw new Error(`${label} must be a number`);
  }

  if (numericValue < min || numericValue > max) {
    throw new Error(`${label} must be between ${min} and ${max}`);
  }

  return numericValue;
};

const unwrapResult = (response) => response?.data?.result ?? response?.data;

const extractFileNameFromDisposition = (dispositionHeader, fallbackName) => {
  const disposition = dispositionHeader || "";
  const fileNameMatch = disposition.match(
    /filename\*?=(?:UTF-8''|"?)([^";]+)/i,
  );

  if (!fileNameMatch) {
    return fallbackName;
  }

  try {
    return decodeURIComponent(fileNameMatch[1].replace(/"/g, ""));
  } catch {
    return fileNameMatch[1].replace(/"/g, "") || fallbackName;
  }
};

const throwApiError = (error, fallbackMessage) => {
  const message = extractApiErrorMessage(error, fallbackMessage);
  throw new Error(message);
};

export const createCertificateRecommendation = async ({
  studentId,
  moduleName,
  progressPercent,
  recommendationNotes,
}) => {
  try {
    const payload = {
      studentId: parsePositiveInt(studentId, "student ID"),
      moduleName: parseRequiredString(moduleName, "Module name", 150),
      progressPercent: parseBoundedNumber(
        progressPercent,
        "Progress percent",
        0,
        100,
      ),
      recommendationNotes: parseOptionalString(
        recommendationNotes,
        "Recommendation notes",
        1000,
      ),
    };

    if (!payload.recommendationNotes) {
      delete payload.recommendationNotes;
    }

    const response = await apiInstance.post(
      "/api/Certificate/recommendations",
      payload,
    );

    return unwrapResult(response);
  } catch (error) {
    console.error("Error creating certificate recommendation:", error);
    throwApiError(error, "Failed to submit certificate recommendation");
  }
};

export const getCertificateRecommendations = async () => {
  try {
    const response = await apiInstance.get("/api/Certificate/recommendations");
    return unwrapResult(response);
  } catch (error) {
    console.error("Error fetching certificate recommendations:", error);
    throwApiError(error, "Failed to fetch certificate recommendations");
  }
};

export const getCertificateById = async (certificateId) => {
  try {
    const resolvedCertificateId = parsePositiveInt(
      certificateId,
      "certificate ID",
    );
    const response = await apiInstance.get(
      `/api/Certificate/${resolvedCertificateId}`,
    );
    return unwrapResult(response);
  } catch (error) {
    console.error("Error fetching certificate:", error);
    throwApiError(error, "Failed to fetch certificate details");
  }
};

export const checkCertificateEligibility = async (certificateId) => {
  try {
    const resolvedCertificateId = parsePositiveInt(
      certificateId,
      "certificate ID",
    );
    const response = await apiInstance.get(
      `/api/Certificate/${resolvedCertificateId}/eligibility`,
    );
    return unwrapResult(response);
  } catch (error) {
    console.error("Error checking certificate eligibility:", error);
    throwApiError(error, "Failed to check certificate eligibility");
  }
};

export const issueCertificate = async (
  certificateId,
  { deliveryMode = DELIVERY_MODE.DIGITAL, adminNotes } = {},
) => {
  try {
    const resolvedCertificateId = parsePositiveInt(
      certificateId,
      "certificate ID",
    );

    if (!DELIVERY_MODE_SET.has(deliveryMode)) {
      throw new Error("Delivery mode must be Digital or OfficePickup");
    }

    const payload = {
      deliveryMode,
      adminNotes: parseOptionalString(adminNotes, "Admin notes", 1000),
    };

    if (!payload.adminNotes) {
      delete payload.adminNotes;
    }

    const response = await apiInstance.post(
      `/api/Certificate/${resolvedCertificateId}/issue`,
      payload,
    );

    return unwrapResult(response);
  } catch (error) {
    console.error("Error issuing certificate:", error);
    throwApiError(error, "Failed to issue certificate");
  }
};

export const revokeCertificate = async (certificateId, { reason }) => {
  try {
    const resolvedCertificateId = parsePositiveInt(
      certificateId,
      "certificate ID",
    );

    const payload = {
      reason: parseRequiredString(reason, "Reason", 500),
    };

    const response = await apiInstance.post(
      `/api/Certificate/${resolvedCertificateId}/revoke`,
      payload,
    );

    return unwrapResult(response);
  } catch (error) {
    console.error("Error revoking certificate:", error);
    throwApiError(error, "Failed to revoke certificate");
  }
};

export const getCertificatesByStudentId = async (studentId) => {
  try {
    const resolvedStudentId = parsePositiveInt(studentId, "student ID");
    const response = await apiInstance.get(
      `/api/Certificate/student/${resolvedStudentId}`,
    );
    return unwrapResult(response);
  } catch (error) {
    console.error("Error fetching student certificates:", error);
    throwApiError(error, "Failed to fetch student certificates");
  }
};

export const getMyCertificates = async () => {
  try {
    const response = await apiInstance.get("/api/Certificate/student/me");
    return unwrapResult(response);
  } catch (error) {
    console.error("Error fetching my certificates:", error);
    throwApiError(error, "Failed to fetch your certificates");
  }
};

export const downloadCertificate = async (certificateId) => {
  try {
    const resolvedCertificateId = parsePositiveInt(
      certificateId,
      "certificate ID",
    );

    const response = await apiInstance.get(
      `/api/Certificate/${resolvedCertificateId}/download`,
      {
        responseType: "blob",
      },
    );

    return {
      blob: response.data,
      filename: extractFileNameFromDisposition(
        response.headers?.["content-disposition"],
        `certificate-${resolvedCertificateId}.pdf`,
      ),
    };
  } catch (error) {
    console.error("Error downloading certificate:", error);
    throwApiError(error, "Failed to download certificate");
  }
};

export const getCertificateDownloadUrl = (certificateId) => {
  const resolvedCertificateId = parsePositiveInt(
    certificateId,
    "certificate ID",
  );
  const baseURL = apiInstance.defaults.baseURL || "";
  return `${baseURL}/api/Certificate/${resolvedCertificateId}/download`;
};

export const verifyCertificate = async (certificateNumber, token) => {
  try {
    const normalizedNumber = parseRequiredString(
      certificateNumber,
      "Certificate number",
      200,
    );

    const params = {};
    const normalizedToken = parseOptionalString(token, "Token", 500);
    if (normalizedToken) {
      params.token = normalizedToken;
    }

    const response = await apiInstance.get(
      `/api/Certificate/verify/${encodeURIComponent(normalizedNumber)}`,
      {
        params,
      },
    );

    return unwrapResult(response);
  } catch (error) {
    console.error("Error verifying certificate:", error);
    throwApiError(error, "Failed to verify certificate");
  }
};

export default {
  DELIVERY_MODE,
  createCertificateRecommendation,
  getCertificateRecommendations,
  getCertificateById,
  checkCertificateEligibility,
  issueCertificate,
  revokeCertificate,
  getCertificatesByStudentId,
  getMyCertificates,
  downloadCertificate,
  getCertificateDownloadUrl,
  verifyCertificate,
};
