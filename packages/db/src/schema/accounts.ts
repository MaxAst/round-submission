import {
  decimal,
  pgTable,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { tenants } from "./tenants";

export const accounts = pgTable("accounts", {
  id: uuid("id").primaryKey().defaultRandom(),

  yapilyId: varchar("yapily_id"),
  currency: varchar("currency", { length: 3 }),
  balance: decimal("balance"),
  accountNames: varchar("account_names", { length: 256 }).array(),

  type: varchar("type", { length: 256 }),
  accountType: varchar("account_type", { length: 256 }),
  usageType: varchar("usage_type", { length: 256 }),

  iban: varchar("iban", { length: 256 }),
  sortCode: varchar("sort_code", { length: 256 }),
  accountNumber: varchar("account_number", { length: 256 }),

  tenantId: uuid("tenant_id").references(() => tenants.id),

  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at"),
});

export type Account = typeof accounts.$inferSelect; // return type when queried
