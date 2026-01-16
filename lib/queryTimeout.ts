/**
 * Wraps a Prisma query with a timeout
 * @param queryPromise - The Prisma query promise
 * @param timeoutMs - Timeout in milliseconds (default: 30000 = 30 seconds)
 * @returns Promise that rejects if timeout is exceeded
 */
export async function withTimeout<T>(
  queryPromise: Promise<T>,
  timeoutMs: number = parseInt(
    process.env.DATABASE_QUERY_TIMEOUT || "30000",
    10
  )
): Promise<T> {
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => {
      reject(new Error(`Query timeout after ${timeoutMs}ms`));
    }, timeoutMs);
  });

  return Promise.race([queryPromise, timeoutPromise]);
}
