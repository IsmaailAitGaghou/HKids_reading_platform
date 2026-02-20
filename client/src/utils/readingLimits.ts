interface ErrorLike {
  error?: string;
  message?: string;
  statusCode?: number;
}

const extractMessage = (value: ErrorLike) => {
  const raw = value.error || value.message || "";
  return raw.toLowerCase();
};

export const isDailyReadingLimitReachedError = (value: unknown): boolean => {
  if (!value || typeof value !== "object") return false;

  const candidate = value as ErrorLike;
  if (candidate.statusCode !== 403) return false;

  return extractMessage(candidate).includes("daily reading limit reached");
};
