import {
  decimal,
  pgTable,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { accounts } from "./accounts";
import { relations } from "drizzle-orm";

// could store a lot more, but for sake of time just storing what seems necessary
export const transactions = pgTable("transactions", {
  id: uuid("id").primaryKey().defaultRandom(),

  amount: decimal("amount", { precision: 19, scale: 4 }),
  currency: varchar("currency", { length: 3 }),
  status: varchar("status", { length: 256 }),
  reference: varchar("reference", { length: 256 }),
  description: varchar("description", { length: 256 }),
  // TODO: would be cleaner to create separate table for these and do this via relations
  payee: varchar("payee", { length: 255 }),
  payer: varchar("payer", { length: 255 }),
  date: timestamp("date"),

  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at"),

  accountId: uuid("account_id").references(() => accounts.id),
});

export type Transaction = typeof transactions.$inferSelect; // return type when queried

export const transactionsRelations = relations(transactions, ({ one }) => ({
  author: one(accounts, {
    fields: [transactions.accountId],
    references: [accounts.id],
  }),
}));
