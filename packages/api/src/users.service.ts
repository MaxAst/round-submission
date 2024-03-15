import { db, eq, schema } from "@round/db";
import { getAnyTenant, insertTenant } from "./tenants.service";

type NewUser = typeof schema.users.$inferInsert;

export const insertUser = async (user: NewUser) => {
  return db.insert(schema.users).values(user).returning();
};

// TODO: logic where we fetch user based on decoded jwt token (or similar auth technique)
export const getLoggedInUser = async () => {
  let user = await getAnyUser();
  if (!user) {
    let tenant = await getAnyTenant();
    if (!tenant) {
      [tenant] = await insertTenant({ name: "ACME Inc." });
    }
    if (!tenant) {
      throw new Error("Couldn't find or create tenant");
    }
    [user] = await insertUser({
      name: "John Doe",
      email: "john@round.com",
      tenantId: tenant.id,
    });
    if (!user) {
      throw new Error("Couldn't find or create user");
    }
  }
  return user;
};

export const getUserById = async (userId: string) => {
  return db.query.users.findFirst({
    where: eq(schema.users.id, userId),
  });
};

export const getAnyUser = async () => {
  return db.query.users.findFirst();
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
