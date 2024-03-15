import {
  decimal,
  pgTable,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { accounts } from "./accounts";

// could store a lot more, but for sake of time just storing what's on the UI
export const transactions = pgTable("transactions", {
  id: uuid("id").primaryKey().defaultRandom(),

  amount: decimal("amount"),
  currency: varchar("currency", { length: 3 }),
  status: varchar("status", { length: 256 }),

  payee: varchar("payee", { length: 255 }),
  date: timestamp("date"),

  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at"),

  accountId: uuid("account_id").references(() => accounts.id),
});

export type Transaction = typeof transactions.$inferSelect; // return type when queried
