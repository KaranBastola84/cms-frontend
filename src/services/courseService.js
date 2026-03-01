import apiInstance from "../config/api";

const validateId = (id) => {
  const numericId = Number(id);
  if (!Number.isInteger(numericId) || numericId <= 0) {
    throw new Error("Invalid course ID");
  }
  return numericId;
};

const normalizeCoursePayload = (courseData) => {
  const payload = { ...courseData };

  if (payload.name !== undefined) {
    payload.name = String(payload.name).trim();
  }

  if (payload.code !== undefined) {
    payload.code = payload.code ? String(payload.code).trim() : null;
  }

  if (payload.description !== undefined) {
    payload.description = payload.description
      ? String(payload.description).trim()
      : "";
  }

  if (payload.durationMonths !== undefined) {
    payload.durationMonths = Number(payload.durationMonths);
  }

  if (payload.fees !== undefined) {
    payload.fees = Number(payload.fees);
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

export const getAllCourses = async () => {
  try {
    const response = await apiInstance.get("/api/Course");
    return response.data.result || [];
  } catch (error) {
    console.error("Error fetching courses:", error);
    throwApiError(error, "Failed to fetch courses");
  }
};

export const getActiveCourses = async () => {
  try {
    const response = await apiInstance.get("/api/Course/active");
    return response.data.result || [];
  } catch (error) {
    console.error("Error fetching active courses:", error);
    throwApiError(error, "Failed to fetch active courses");
  }
};

export const getCourseById = async (id) => {
  try {
    const courseId = validateId(id);
    const response = await apiInstance.get(`/api/Course/${courseId}`);
    return response.data.result;
  } catch (error) {
    console.error("Error fetching course:", error);
    throwApiError(error, "Failed to fetch course details");
  }
};

export const createCourse = async (courseData) => {
  try {
    const payload = normalizeCoursePayload(courseData);
    const response = await apiInstance.post("/api/Course", payload);
    return response.data.result;
  } catch (error) {
    console.error("Error creating course:", error);
    throwApiError(error, "Failed to create course");
  }
};

export const updateCourse = async (id, courseData) => {
  try {
    const courseId = validateId(id);
    const payload = normalizeCoursePayload(courseData);
    const response = await apiInstance.put(`/api/Course/${courseId}`, payload);
    return response.data.result;
  } catch (error) {
    console.error("Error updating course:", error);
    throwApiError(error, "Failed to update course");
  }
};

export const deleteCourse = async (id) => {
  try {
    const courseId = validateId(id);
    const response = await apiInstance.delete(`/api/Course/${courseId}`);
    return response.data.result || response.data;
  } catch (error) {
    console.error("Error deleting course:", error);
    throwApiError(error, "Failed to delete course");
  }
};

export default {
  getAllCourses,
  getActiveCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
};
