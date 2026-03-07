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
    feesPaid: studentData.feesPaid === undefined ? 0 : Number(studentData.feesPaid),
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

export const getStudentDetails = async (id) => {
  try {
    const studentId = validateStudentId(id);

    try {
      const response = await apiInstance.get(`/api/Student/${studentId}/details`);
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

export const recordCashPayment = async (id, amount) => {
  try {
    const studentId = validateStudentId(id);
    const paidAmount = Number(amount);
    if (Number.isNaN(paidAmount) || paidAmount <= 0) {
      throw new Error("Cash amount must be greater than 0");
    }

    const response = await apiInstance.post(
      `/api/Student/${studentId}/cash-payment`,
      {
        amount: paidAmount,
      },
    );

    return response.data.result || response.data;
  } catch (error) {
    console.error("Error recording cash payment:", error);
    throwApiError(error, "Failed to record cash payment");
  }
};

export default {
  createStudent,
  getAllStudents,
  getStudentsByStatus,
  getStudentById,
  getStudentDetails,
  getRegistrationSummary,
  recordCashPayment,
  getEntityId,
};
