import { db, eq, schema } from "@round/db";
import { USER_ID } from ".";

type NewUser = typeof schema.users.$inferInsert;

export const insertUser = async (user: NewUser) => {
  return db.insert(schema.users).values(user).returning();
};

// TODO: logic where we fetch user based on decoded jwt token (or similar auth technique)
export const getLoggedInUser = () => {
  return getUserById(USER_ID);
};

export const getUserById = async (userId: string) => {
  const user = await db.query.users.findFirst({
    where: eq(schema.users.id, userId),
  });
  if (!user) throw new Error("User not found");
  return user;
};

export const saveYapilyConsentToken = (
  userId: string,
  consentToken: string
) => {
  return db
    .update(schema.users)
    .set({ yapilyConsentToken: consentToken })
    .where(eq(schema.users.id, userId));
};
