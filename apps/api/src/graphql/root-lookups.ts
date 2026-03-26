import { first, invariant, type D1DatabaseLike } from "../lib/d1";
import { getClassSelectFields } from "./class-schema";
import type { ClassRow, UserRow } from "./types";

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

export const findUserByEmail = async (
  db: D1DatabaseLike,
  email: string,
): Promise<UserRow | null> =>
  first<UserRow>(
    db,
    "SELECT id, full_name, email, role, created_at FROM users WHERE lower(email) = lower(?)",
    [email],
  );

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
