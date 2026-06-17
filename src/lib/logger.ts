export const logger = {
  error: (message: string, error?: unknown) => {
    // In production, we would log to a service like Sentry or Datadog
    // But for now we just suppress the error stack trace to avoid exposing sensitive info
    // while still keeping a trace for debugging if needed in the server logs
    if (process.env.NODE_ENV === 'development') {
      console.error(message, error);
    } else {
      // In production, log a minimal, safe version of the error
      const safeErrorMsg = error instanceof Error ? error.message : String(error);
      console.error(`[ERROR] ${message}: ${safeErrorMsg}`);
    }
  },
  warn: (message: string, data?: unknown) => {
    if (process.env.NODE_ENV === 'development') {
      console.warn(message, data);
    } else {
      console.warn(`[WARN] ${message}`);
    }
  },
  info: (message: string, data?: unknown) => {
    if (process.env.NODE_ENV === 'development') {
      console.info(message, data);
    } else {
      console.info(`[INFO] ${message}`);
    }
  }
};
