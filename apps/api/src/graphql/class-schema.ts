import { all, run, type D1DatabaseLike } from "../lib/d1";

type TableInfoRow = {
  name: string;
};

type CreateClassRowInput = {
  id: string;
  name: string;
  description: string | null;
  teacherId: string;
  createdAt: string;
  subject: string;
  grade: number;
};

const classMetadataColumnsCache = new WeakMap<D1DatabaseLike, Promise<boolean>>();

const buildClassSelectFields = (tableAlias = ""): string =>
  `${tableAlias}id, ${tableAlias}name, ${tableAlias}description, ${tableAlias}subject, ${tableAlias}grade, ${tableAlias}teacher_id, ${tableAlias}created_at`;

const buildLegacyClassSelectFields = (tableAlias = ""): string =>
  `${tableAlias}id, ${tableAlias}name, ${tableAlias}description, 'Ерөнхий' AS subject, 0 AS grade, ${tableAlias}teacher_id, ${tableAlias}created_at`;

export const hasClassMetadataColumns = (db: D1DatabaseLike): Promise<boolean> => {
  const cached = classMetadataColumnsCache.get(db);
  if (cached) {
    return cached;
  }

  const pending = (async () => {
    const columns = await all<TableInfoRow>(db, "PRAGMA table_info(classes)");
    const names = new Set(columns.map((column) => column.name));
    return names.has("subject") && names.has("grade");
  })();

  classMetadataColumnsCache.set(db, pending);
  return pending;
};

export const getClassSelectFields = async (
  db: D1DatabaseLike,
  tableAlias = "",
): Promise<string> =>
  (await hasClassMetadataColumns(db))
    ? buildClassSelectFields(tableAlias)
    : buildLegacyClassSelectFields(tableAlias);

export const insertClassRow = async (
  db: D1DatabaseLike,
  input: CreateClassRowInput,
): Promise<void> => {
  if (await hasClassMetadataColumns(db)) {
    await run(
      db,
      `INSERT INTO classes (id, name, description, subject, grade, teacher_id, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        input.id,
        input.name,
        input.description,
        input.subject,
        input.grade,
        input.teacherId,
        input.createdAt,
      ],
    );
    return;
  }

  await run(
    db,
    `INSERT INTO classes (id, name, description, teacher_id, created_at)
     VALUES (?, ?, ?, ?, ?)`,
    [input.id, input.name, input.description, input.teacherId, input.createdAt],
  );
};
