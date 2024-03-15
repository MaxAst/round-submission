import { pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { tenants } from "./tenants";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 256 }),
  email: varchar("email", { length: 256 }).notNull().unique(),

  yapilyConsentToken: varchar("yapily_consent_token"),
  yapilyUuid: uuid("yapily_uuid"),

  tenantId: uuid("tenant_id").references(() => tenants.id),

  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at"),
});

export type User = typeof users.$inferSelect; // return type when queried
