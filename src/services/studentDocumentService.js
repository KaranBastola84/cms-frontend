import apiInstance from "../config/api";

const validateId = (id, label = "ID") => {
  const numericId = Number(id);
  if (!Number.isInteger(numericId) || numericId <= 0) {
    throw new Error(`Invalid ${label}`);
  }
  return numericId;
};

const throwApiError = (error, fallbackMessage) => {
  const message =
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.response?.data?.title ||
    error?.message ||
    fallbackMessage;
  throw new Error(message);
};

export const uploadStudentDocument = async ({
  studentId,
  file,
  documentType,
  description,
}) => {
  try {
    const resolvedStudentId = validateId(studentId, "student ID");

    if (!file) {
      throw new Error("Document file is required");
    }

    const formData = new FormData();
    formData.append("file", file);

    const response = await apiInstance.post(
      "/api/StudentDocument/upload",
      formData,
      {
        params: {
          studentId: resolvedStudentId,
          documentType: Number(documentType),
          description: description || "",
        },
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );

    return response.data.result || response.data;
  } catch (error) {
    console.error("Error uploading student document:", error);
    throwApiError(error, "Failed to upload document");
  }
};

export const uploadMultipleStudentDocuments = async ({
  studentId,
  files,
  documentType,
  description,
}) => {
  try {
    const resolvedStudentId = validateId(studentId, "student ID");
    if (!files || files.length === 0) {
      throw new Error("At least one document is required");
    }

    const formData = new FormData();
    files.forEach((file) => {
      formData.append("files", file);
    });

    const response = await apiInstance.post(
      "/api/StudentDocument/upload-multiple",
      formData,
      {
        params: {
          studentId: resolvedStudentId,
          documentType: Number(documentType),
          description: description || "",
        },
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );

    return response.data.result || response.data;
  } catch (error) {
    console.error("Error uploading student documents:", error);
    throwApiError(error, "Failed to upload documents");
  }
};

export const getStudentDocuments = async (studentId) => {
  try {
    const resolvedStudentId = validateId(studentId, "student ID");
    const response = await apiInstance.get(
      `/api/StudentDocument/student/${resolvedStudentId}`,
    );
    return response.data.result || [];
  } catch (error) {
    console.error("Error fetching student documents:", error);
    throwApiError(error, "Failed to fetch student documents");
  }
};

export const deleteStudentDocument = async (documentId) => {
  try {
    const resolvedDocumentId = validateId(documentId, "document ID");
    const response = await apiInstance.delete(
      `/api/StudentDocument/${resolvedDocumentId}`,
    );
    return response.data.result || response.data;
  } catch (error) {
    console.error("Error deleting document:", error);
    throwApiError(error, "Failed to delete document");
  }
};

export const getDocumentDownloadUrl = (documentId) => {
  const resolvedDocumentId = validateId(documentId, "document ID");
  const baseURL = apiInstance.defaults.baseURL || "";
  return `${baseURL}/api/StudentDocument/${resolvedDocumentId}/download`;
};

export default {
  uploadStudentDocument,
  uploadMultipleStudentDocuments,
  getStudentDocuments,
  deleteStudentDocument,
  getDocumentDownloadUrl,
};
