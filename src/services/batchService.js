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

const normalizeBatchPayload = (batchData) => {
  const payload = {};

  if (batchData.name !== undefined) {
    payload.name = String(batchData.name).trim();
  }

  if (
    batchData.courseId !== undefined &&
    batchData.courseId !== null &&
    batchData.courseId !== ""
  ) {
    payload.courseId = Number(batchData.courseId);
  }

  if (batchData.startDate !== undefined && batchData.startDate) {
    payload.startDate = normalizeDateTime(batchData.startDate);
  }

  if (batchData.endDate !== undefined && batchData.endDate) {
    payload.endDate = normalizeDateTime(batchData.endDate);
  }

  if (batchData.timeSlot !== undefined) {
    payload.timeSlot = batchData.timeSlot
      ? String(batchData.timeSlot).trim()
      : "";
  }

  if (batchData.trainerId !== undefined) {
    payload.trainerId =
      batchData.trainerId === null || batchData.trainerId === ""
        ? null
        : Number(batchData.trainerId);
  }

  if (batchData.maxStudents !== undefined) {
    payload.maxStudents = Number(batchData.maxStudents);
  }

  if (batchData.isActive !== undefined) {
    payload.isActive = !!batchData.isActive;
  }

  return payload;
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

export const getAllBatches = async () => {
  try {
    const response = await apiInstance.get("/api/Batch");
    return response.data.result || [];
  } catch (error) {
    console.error("Error fetching batches:", error);
    throwApiError(error, "Failed to fetch batches");
  }
};

export const getActiveBatches = async () => {
  try {
    const response = await apiInstance.get("/api/Batch/active");
    return response.data.result || [];
  } catch (error) {
    console.error("Error fetching active batches:", error);
    throwApiError(error, "Failed to fetch active batches");
  }
};

export const getBatchesByCourseId = async (courseId) => {
  try {
    const validCourseId = validateId(courseId, "course ID");
    const response = await apiInstance.get(
      `/api/Batch/course/${validCourseId}`,
    );
    return response.data.result || [];
  } catch (error) {
    console.error("Error fetching batches by course:", error);
    throwApiError(error, "Failed to fetch batches for selected course");
  }
};

export const getBatchById = async (id) => {
  try {
    const batchId = validateId(id, "batch ID");
    const response = await apiInstance.get(`/api/Batch/${batchId}`);
    return response.data.result;
  } catch (error) {
    console.error("Error fetching batch:", error);
    throwApiError(error, "Failed to fetch batch details");
  }
};

export const createBatch = async (batchData) => {
  try {
    const payload = normalizeBatchPayload(batchData);
    const response = await apiInstance.post("/api/Batch", payload);
    return response.data.result;
  } catch (error) {
    console.error("Error creating batch:", error);
    throwApiError(error, "Failed to create batch");
  }
};

export const updateBatch = async (id, batchData) => {
  try {
    const batchId = validateId(id, "batch ID");
    const payload = normalizeBatchPayload(batchData);
    const response = await apiInstance.put(`/api/Batch/${batchId}`, payload);
    return response.data.result;
  } catch (error) {
    console.error("Error updating batch:", error);
    throwApiError(error, "Failed to update batch");
  }
};

export const deleteBatch = async (id) => {
  try {
    const batchId = validateId(id, "batch ID");
    const response = await apiInstance.delete(`/api/Batch/${batchId}`);
    return response.data.result || response.data;
  } catch (error) {
    console.error("Error deleting batch:", error);
    throwApiError(error, "Failed to delete batch");
  }
};

export default {
  getAllBatches,
  getActiveBatches,
  getBatchesByCourseId,
  getBatchById,
  createBatch,
  updateBatch,
  deleteBatch,
};
