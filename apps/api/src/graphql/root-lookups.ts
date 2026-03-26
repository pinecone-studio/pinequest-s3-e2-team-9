import { first, invariant, type D1DatabaseLike } from "../lib/d1";
import { getClassSelectFields } from "./class-schema";
import type { ClassRow, Role, UserRow } from "./types";

export const findUser = async (
  db: D1DatabaseLike,
  id: string,
): Promise<UserRow> => {
  const user = await first<UserRow>(
    db,
    "SELECT id, full_name, email, role, created_at FROM users WHERE id = ?",
    [id],
  );
  invariant(user, `User ${id} not found`);
  return user;
};

export const findClass = async (
  db: D1DatabaseLike,
  id: string,
): Promise<ClassRow> => {
  const selectFields = await getClassSelectFields(db);
  const classroom = await first<ClassRow>(
    db,
    `SELECT ${selectFields} FROM classes WHERE id = ?`,
    [id],
  );
  invariant(classroom, `Class ${id} not found`);
  return classroom;
};

export const findActor = (db: D1DatabaseLike) =>
  first<UserRow>(
    db,
    `SELECT id, full_name, email, role, created_at
     FROM users
     ORDER BY CASE role WHEN 'TEACHER' THEN 0 WHEN 'ADMIN' THEN 1 ELSE 2 END, created_at ASC
     LIMIT 1`,
  );

export const requireActor = async (
  db: D1DatabaseLike,
  roles: Role[],
): Promise<UserRow> => {
  const actor = await first<UserRow>(
    db,
    `SELECT id, full_name, email, role, created_at
     FROM users
     WHERE role IN (${roles.map(() => "?").join(", ")})
     ORDER BY CASE role WHEN 'TEACHER' THEN 0 WHEN 'ADMIN' THEN 1 ELSE 2 END, created_at ASC
     LIMIT 1`,
    roles,
  );
  invariant(actor, `No ${roles.join("/")} user found. Seed the users table before running this mutation.`);
  return actor;
};
