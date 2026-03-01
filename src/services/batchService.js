import apiInstance from "../config/api";

const validateId = (id, label = "ID") => {
  const numericId = Number(id);
  if (!Number.isInteger(numericId) || numericId <= 0) {
    throw new Error(`Invalid ${label}`);
  }
  return numericId;
};

const normalizeBatchPayload = (batchData) => {
  const payload = { ...batchData };

  if (payload.name !== undefined) {
    payload.name = String(payload.name).trim();
  }

  if (payload.courseId !== undefined && payload.courseId !== null && payload.courseId !== "") {
    payload.courseId = Number(payload.courseId);
  }

  if (payload.trainerId !== undefined) {
    payload.trainerId =
      payload.trainerId === null || payload.trainerId === ""
        ? null
        : Number(payload.trainerId);
  }

  if (payload.startDate !== undefined && payload.startDate) {
    payload.startDate = String(payload.startDate);
  }

  if (payload.endDate !== undefined && payload.endDate) {
    payload.endDate = String(payload.endDate);
  }

  if (payload.timeSlot !== undefined) {
    payload.timeSlot = payload.timeSlot ? String(payload.timeSlot).trim() : "";
  }

  if (payload.maxStudents !== undefined) {
    payload.maxStudents = Number(payload.maxStudents);
  }

  if (payload.currentStudents !== undefined) {
    payload.currentStudents = Number(payload.currentStudents);
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
    const response = await apiInstance.get(`/api/Batch/course/${validCourseId}`);
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
