export const OVERVIEW_LIMIT_OPTIONS = [5, 10, 15, 20];
export const TIMELINE_LIMIT_OPTIONS = [10, 20, 50, 100];

export const formatDateTime = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString();
};

export const getReadableError = (error, fallbackMessage) => {
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return fallbackMessage;
};

export const isDisplayPrimitive = (value) => {
  return (
    !Array.isArray(value) &&
    (typeof value === "number" ||
      typeof value === "string" ||
      typeof value === "boolean")
  );
};
