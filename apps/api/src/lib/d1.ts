export type D1Result<T> = {
  results?: T[];
  success: boolean;
  meta: Record<string, unknown>;
};

type D1MetaKey =
  | "rows_read"
  | "rows_written"
  | "changes"
  | "changed_db"
  | "size_after";

export type D1PreparedStatementLike = {
  bind(...values: unknown[]): D1PreparedStatementLike;
  first<T = Record<string, unknown>>(): Promise<T | null>;
  all<T = Record<string, unknown>>(): Promise<D1Result<T>>;
  run(): Promise<D1Result<never>>;
};

export type D1DatabaseLike = {
  prepare(query: string): D1PreparedStatementLike;
  batch?<T = unknown>(
    statements: D1PreparedStatementLike[],
  ): Promise<Array<D1Result<T>>>;
};

export function invariant(
  condition: unknown,
  message: string,
): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

export const statement = (
  db: D1DatabaseLike,
  sql: string,
  params: unknown[] = [],
): D1PreparedStatementLike => {
  const prepared = db.prepare(sql);
  return params.length > 0 ? prepared.bind(...params) : prepared;
};

const D1_READ_WARN_THRESHOLD = 2_000;
const D1_WRITE_WARN_THRESHOLD = 500;
const D1_DURATION_WARN_THRESHOLD_MS = 200;
const D1_SQL_PREVIEW_MAX_LENGTH = 160;

const getNumericMeta = (
  meta: Record<string, unknown>,
  key: D1MetaKey,
): number | null => {
  const value = meta[key];
  return typeof value === "number" && Number.isFinite(value) ? value : null;
};

const compactSql = (sql: string) => sql.replace(/\s+/g, " ").trim();

const getSqlPreview = (sql: string) => {
  const compact = compactSql(sql);
  return compact.length > D1_SQL_PREVIEW_MAX_LENGTH
    ? `${compact.slice(0, D1_SQL_PREVIEW_MAX_LENGTH - 3)}...`
    : compact;
};

const logD1UsageIfExpensive = ({
  durationMs,
  kind,
  meta,
  paramsCount,
  sql,
}: {
  durationMs: number;
  kind: "all" | "first" | "run" | "batch";
  meta: Record<string, unknown>;
  paramsCount: number;
  sql: string;
}) => {
  const rowsRead = getNumericMeta(meta, "rows_read") ?? 0;
  const rowsWritten =
    getNumericMeta(meta, "rows_written") ??
    getNumericMeta(meta, "changes") ??
    getNumericMeta(meta, "changed_db") ??
    0;

  if (
    rowsRead < D1_READ_WARN_THRESHOLD &&
    rowsWritten < D1_WRITE_WARN_THRESHOLD &&
    durationMs < D1_DURATION_WARN_THRESHOLD_MS
  ) {
    return;
  }

  console.warn("D1 query usage warning", {
    durationMs,
    kind,
    paramsCount,
    rowsRead,
    rowsWritten,
    sizeAfter: getNumericMeta(meta, "size_after"),
    sql: getSqlPreview(sql),
  });
};

export const all = async <T>(
  db: D1DatabaseLike,
  sql: string,
  params: unknown[] = [],
): Promise<T[]> => {
  const startedAt = Date.now();
  const result = await statement(db, sql, params).all<T>();
  logD1UsageIfExpensive({
    durationMs: Date.now() - startedAt,
    kind: "all",
    meta: result.meta ?? {},
    paramsCount: params.length,
    sql,
  });
  return result.results ?? [];
};

export const first = async <T>(
  db: D1DatabaseLike,
  sql: string,
  params: unknown[] = [],
): Promise<T | null> => {
  const startedAt = Date.now();
  const result = await statement(db, sql, params).all<T>();
  logD1UsageIfExpensive({
    durationMs: Date.now() - startedAt,
    kind: "first",
    meta: result.meta ?? {},
    paramsCount: params.length,
    sql,
  });
  return result.results?.[0] ?? null;
};

export const run = async (
  db: D1DatabaseLike,
  sql: string,
  params: unknown[] = [],
): Promise<void> => {
  const startedAt = Date.now();
  const result = await statement(db, sql, params).run();
  logD1UsageIfExpensive({
    durationMs: Date.now() - startedAt,
    kind: "run",
    meta: result.meta ?? {},
    paramsCount: params.length,
    sql,
  });
};

export const runMany = async (
  db: D1DatabaseLike,
  statements: Array<{ sql: string; params?: unknown[] }>,
): Promise<void> => {
  if (statements.length === 0) {
    return;
  }

  if (db.batch) {
    const startedAt = Date.now();
    const results = await db.batch(
      statements.map(({ sql, params = [] }) => statement(db, sql, params)),
    );
    const durationMs = Date.now() - startedAt;
    for (const [index, result] of results.entries()) {
      logD1UsageIfExpensive({
        durationMs,
        kind: "batch",
        meta: result.meta ?? {},
        paramsCount: statements[index]?.params?.length ?? 0,
        sql: statements[index]?.sql ?? "unknown",
      });
    }
    return;
  }

  for (const { sql, params = [] } of statements) {
    await run(db, sql, params);
  }
};
