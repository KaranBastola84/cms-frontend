import apiInstance from "../config/api";

const validateId = (id, label = "ID") => {
  const numericId = Number(id);
  if (!Number.isInteger(numericId) || numericId <= 0) {
    throw new Error(`Invalid ${label}`);
  }
  return numericId;
};

const normalizeDateTime = (value) => {
  if (!value) return value;

  const stringValue = String(value).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(stringValue)) {
    return `${stringValue}T00:00:00.000Z`;
  }

  const parsedDate = new Date(stringValue);
  if (Number.isNaN(parsedDate.getTime())) {
    return stringValue;
  }

  return parsedDate.toISOString();
};

const toParams = (filters = {}) => {
  const params = {};

  if (filters.date) {
    params.date = normalizeDateTime(filters.date);
  }

  if (filters.startDate) {
    params.startDate = normalizeDateTime(filters.startDate);
  }

  if (filters.endDate) {
    params.endDate = normalizeDateTime(filters.endDate);
  }

  return params;
};

const normalizeAttendancePayload = (data = {}) => {
  const payload = {};

  if (data.studentId !== undefined) {
    payload.studentId = Number(data.studentId);
  }

  if (data.batchId !== undefined) {
    payload.batchId = Number(data.batchId);
  }

  if (data.attendanceDate !== undefined) {
    payload.attendanceDate = normalizeDateTime(data.attendanceDate);
  }

  if (data.status !== undefined) {
    payload.status = data.status ? String(data.status).trim() : "";
  }

  if (data.checkInTime !== undefined) {
    payload.checkInTime = data.checkInTime
      ? String(data.checkInTime).trim()
      : null;
  }

  if (data.checkOutTime !== undefined) {
    payload.checkOutTime = data.checkOutTime
      ? String(data.checkOutTime).trim()
      : null;
  }

  if (data.remarks !== undefined) {
    payload.remarks = data.remarks ? String(data.remarks).trim() : "";
  }

  if (data.markedBy !== undefined) {
    payload.markedBy = data.markedBy ? String(data.markedBy).trim() : null;
  }

  return payload;
};

const throwApiError = (error, fallbackMessage) => {
  const message =
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.response?.data?.title ||
    error?.response?.data?.errorMessage?.join(", ") ||
    error?.message ||
    fallbackMessage;
  throw new Error(message);
};

export const markAttendance = async (attendanceData) => {
  try {
    const payload = normalizeAttendancePayload(attendanceData);
    const response = await apiInstance.post("/api/Attendance", payload);
    return response.data.result;
  } catch (error) {
    console.error("Error marking attendance:", error);
    throwApiError(error, "Failed to mark attendance");
  }
};

export const markAttendanceBulk = async (bulkData) => {
  try {
    const payload = {
      batchId: Number(bulkData.batchId),
      attendanceDate: normalizeDateTime(bulkData.attendanceDate),
      markedBy: bulkData.markedBy ? String(bulkData.markedBy).trim() : null,
      attendances: Array.isArray(bulkData.attendances)
        ? bulkData.attendances.map((item) => normalizeAttendancePayload(item))
        : [],
    };

    const response = await apiInstance.post("/api/Attendance/bulk", payload);
    return response.data.result;
  } catch (error) {
    console.error("Error marking bulk attendance:", error);
    throwApiError(error, "Failed to mark bulk attendance");
  }
};

export const getAttendanceById = async (id) => {
  try {
    const attendanceId = validateId(id, "attendance ID");
    const response = await apiInstance.get(`/api/Attendance/${attendanceId}`);
    return response.data.result;
  } catch (error) {
    console.error("Error fetching attendance:", error);
    throwApiError(error, "Failed to fetch attendance details");
  }
};

export const getAttendanceByStudentId = async (studentId, filters = {}) => {
  try {
    const validStudentId = validateId(studentId, "student ID");
    const response = await apiInstance.get(
      `/api/Attendance/student/${validStudentId}`,
      {
        params: toParams(filters),
      },
    );
    return response.data.result || [];
  } catch (error) {
    console.error("Error fetching student attendance:", error);
    throwApiError(error, "Failed to fetch student attendance");
  }
};

export const getAttendanceByBatch = async (batchId, date) => {
  try {
    const validBatchId = validateId(batchId, "batch ID");
    const response = await apiInstance.get(
      `/api/Attendance/batch/${validBatchId}`,
      {
        params: toParams({ date }),
      },
    );
    return response.data.result || [];
  } catch (error) {
    console.error("Error fetching batch attendance:", error);
    throwApiError(error, "Failed to fetch batch attendance");
  }
};

export const getAttendanceByBatchRange = async (batchId, filters = {}) => {
  try {
    const validBatchId = validateId(batchId, "batch ID");
    const response = await apiInstance.get(
      `/api/Attendance/batch/${validBatchId}/range`,
      {
        params: toParams(filters),
      },
    );
    return response.data.result || [];
  } catch (error) {
    console.error("Error fetching batch attendance range:", error);
    throwApiError(error, "Failed to fetch batch attendance range");
  }
};

export const updateAttendance = async (id, attendanceData) => {
  try {
    const attendanceId = validateId(id, "attendance ID");
    const payload = normalizeAttendancePayload(attendanceData);
    const response = await apiInstance.put(
      `/api/Attendance/${attendanceId}`,
      payload,
    );
    return response.data.result;
  } catch (error) {
    console.error("Error updating attendance:", error);
    throwApiError(error, "Failed to update attendance");
  }
};

export const deleteAttendance = async (id) => {
  try {
    const attendanceId = validateId(id, "attendance ID");
    const response = await apiInstance.delete(
      `/api/Attendance/${attendanceId}`,
    );
    return response.data.result || response.data;
  } catch (error) {
    console.error("Error deleting attendance:", error);
    throwApiError(error, "Failed to delete attendance");
  }
};

export const getStudentAttendanceReport = async (studentId, filters = {}) => {
  try {
    const validStudentId = validateId(studentId, "student ID");
    const response = await apiInstance.get(
      `/api/Attendance/report/student/${validStudentId}`,
      {
        params: toParams(filters),
      },
    );
    return response.data.result;
  } catch (error) {
    console.error("Error fetching student attendance report:", error);
    throwApiError(error, "Failed to fetch student attendance report");
  }
};

export const getBatchAttendanceReport = async (batchId, filters = {}) => {
  try {
    const validBatchId = validateId(batchId, "batch ID");
    const response = await apiInstance.get(
      `/api/Attendance/report/batch/${validBatchId}`,
      {
        params: toParams(filters),
      },
    );
    return response.data.result;
  } catch (error) {
    console.error("Error fetching batch attendance report:", error);
    throwApiError(error, "Failed to fetch batch attendance report");
  }
};

export default {
  markAttendance,
  markAttendanceBulk,
  getAttendanceById,
  getAttendanceByStudentId,
  getAttendanceByBatch,
  getAttendanceByBatchRange,
  updateAttendance,
  deleteAttendance,
  getStudentAttendanceReport,
  getBatchAttendanceReport,
};
