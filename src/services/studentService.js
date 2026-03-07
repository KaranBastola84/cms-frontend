import apiInstance from "../config/api";

const parseNumber = (value, fieldName) => {
  const numeric = Number(value);
  if (Number.isNaN(numeric)) {
    throw new Error(`${fieldName} must be a number`);
  }
  return numeric;
};

const validateStudentId = (id) => {
  const studentId = Number(id);
  if (!Number.isInteger(studentId) || studentId <= 0) {
    throw new Error("Invalid student ID");
  }
  return studentId;
};

const getEntityId = (entity) => {
  if (!entity || typeof entity !== "object") return null;
  return entity.studentId || entity.id || entity.userId || null;
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

const normalizeStudentPayload = (studentData = {}) => {
  const payload = {
    name: String(studentData.name || "").trim(),
    email: String(studentData.email || "").trim(),
    phone: String(studentData.phone || "").trim(),
    courseId: parseNumber(studentData.courseId, "Course"),
    batchId: parseNumber(studentData.batchId, "Batch"),
    feesTotal: parseNumber(studentData.feesTotal, "Fees total"),
    feesPaid:
      studentData.feesPaid === undefined ? 0 : Number(studentData.feesPaid),
  };

  if (!payload.name) throw new Error("Student name is required");
  if (!payload.email) throw new Error("Student email is required");
  if (!payload.phone) throw new Error("Student phone is required");

  if (payload.feesTotal <= 0) {
    throw new Error("Fees total must be greater than 0");
  }

  if (Number.isNaN(payload.feesPaid) || payload.feesPaid < 0) {
    throw new Error("Fees paid must be a non-negative number");
  }

  const optionalFields = ["address", "emergencyContact", "notes"];
  optionalFields.forEach((field) => {
    if (studentData[field] !== undefined) {
      const value = studentData[field];
      payload[field] = value === null ? null : String(value).trim();
    }
  });

  return payload;
};

export const createStudent = async (studentData) => {
  try {
    const payload = normalizeStudentPayload(studentData);
    const response = await apiInstance.post("/api/Student", payload);
    return response.data.result || response.data;
  } catch (error) {
    console.error("Error creating student:", error);
    throwApiError(error, "Failed to create student");
  }
};

export const getAllStudents = async () => {
  try {
    const response = await apiInstance.get("/api/Student");
    return response.data.result || [];
  } catch (error) {
    console.error("Error fetching students:", error);
    throwApiError(error, "Failed to fetch students");
  }
};

export const getStudentsByStatus = async (status) => {
  try {
    if (!status || typeof status !== "string") {
      throw new Error("Status is required");
    }

    const response = await apiInstance.get(`/api/Student/status/${status}`);
    return response.data.result || [];
  } catch (error) {
    console.error("Error fetching students by status:", error);
    throwApiError(error, "Failed to fetch students by status");
  }
};

export const getStudentById = async (id) => {
  try {
    const studentId = validateStudentId(id);
    const response = await apiInstance.get(`/api/Student/${studentId}`);
    return response.data.result;
  } catch (error) {
    console.error("Error fetching student:", error);
    throwApiError(error, "Failed to fetch student details");
  }
};

export const updateStudent = async (id, studentData) => {
  try {
    const studentId = validateStudentId(id);
    const payload = normalizeStudentPayload(studentData);
    const response = await apiInstance.put(
      `/api/Student/${studentId}`,
      payload,
    );
    return response.data.result || response.data;
  } catch (error) {
    console.error("Error updating student:", error);
    throwApiError(error, "Failed to update student");
  }
};

export const deleteStudent = async (id) => {
  try {
    const studentId = validateStudentId(id);
    const response = await apiInstance.delete(`/api/Student/${studentId}`);
    return response.data.result || response.data || { success: true };
  } catch (error) {
    console.error("Error deleting student:", error);
    throwApiError(error, "Failed to delete student");
  }
};

export const getStudentDetails = async (id) => {
  try {
    const studentId = validateStudentId(id);

    try {
      const response = await apiInstance.get(
        `/api/Student/${studentId}/details`,
      );
      return response.data.result || response.data;
    } catch {
      return await getStudentById(studentId);
    }
  } catch (error) {
    console.error("Error fetching detailed student profile:", error);
    throwApiError(error, "Failed to fetch student profile");
  }
};

export const getRegistrationSummary = async (id) => {
  try {
    const studentId = validateStudentId(id);
    const response = await apiInstance.get(
      `/api/Student/${studentId}/registration-summary`,
    );
    return response.data.result || response.data;
  } catch (error) {
    console.error("Error fetching registration summary:", error);
    throwApiError(error, "Failed to fetch registration summary");
  }
};

export const getStudentByEmail = async (email) => {
  try {
    const normalizedEmail = String(email || "").trim();
    if (!normalizedEmail) {
      throw new Error("Email is required");
    }

    const response = await apiInstance.get(
      `/api/Student/email/${encodeURIComponent(normalizedEmail)}`,
    );
    return response.data.result || response.data;
  } catch (error) {
    console.error("Error fetching student by email:", error);
    throwApiError(error, "Failed to fetch student by email");
  }
};

export const updateStudentStatus = async (id, status) => {
  try {
    const studentId = validateStudentId(id);
    const normalizedStatus = String(status || "").trim();
    if (!normalizedStatus) {
      throw new Error("Status is required");
    }

    const response = await apiInstance.patch(
      `/api/Student/${studentId}/status`,
      {
        status: normalizedStatus,
      },
    );
    return response.data.result || response.data;
  } catch (error) {
    console.error("Error updating student status:", error);
    throwApiError(error, "Failed to update student status");
  }
};

export const recordCashPayment = async (id, amount, remarks = "") => {
  try {
    const studentId = validateStudentId(id);
    const paidAmount = Number(amount);
    if (Number.isNaN(paidAmount) || paidAmount <= 0) {
      throw new Error("Cash amount must be greater than 0");
    }

    const normalizedRemarks =
      remarks === undefined || remarks === null ? "" : String(remarks).trim();

    const response = await apiInstance.post(
      `/api/Student/${studentId}/cash-payment`,
      {
        amount: paidAmount,
        ...(normalizedRemarks ? { remarks: normalizedRemarks } : {}),
      },
    );

    return response.data.result || response.data;
  } catch (error) {
    console.error("Error recording cash payment:", error);
    throwApiError(error, "Failed to record cash payment");
  }
};

export const getStudentCashPayments = async (id) => {
  try {
    const studentId = validateStudentId(id);
    const response = await apiInstance.get(
      `/api/Student/${studentId}/cash-payments`,
    );
    return response.data.result || response.data || [];
  } catch (error) {
    console.error("Error fetching student cash payments:", error);
    throwApiError(error, "Failed to fetch student cash payments");
  }
};

export const getStudentPayments = async (id) => {
  try {
    const studentId = validateStudentId(id);
    const response = await apiInstance.get(
      `/api/Student/${studentId}/payments`,
    );
    return response.data.result || response.data || [];
  } catch (error) {
    console.error("Error fetching student payments:", error);
    throwApiError(error, "Failed to fetch student payments");
  }
};

export const getStudentDocumentsList = async (id) => {
  try {
    const studentId = validateStudentId(id);
    const response = await apiInstance.get(
      `/api/Student/${studentId}/documents`,
    );
    return response.data.result || response.data || [];
  } catch (error) {
    console.error("Error fetching student documents:", error);
    throwApiError(error, "Failed to fetch student documents");
  }
};

export default {
  createStudent,
  getAllStudents,
  getStudentsByStatus,
  getStudentById,
  updateStudent,
  deleteStudent,
  getStudentDetails,
  getRegistrationSummary,
  getStudentByEmail,
  updateStudentStatus,
  recordCashPayment,
  getStudentPayments,
  getStudentCashPayments,
  getStudentDocumentsList,
  getEntityId,
};
