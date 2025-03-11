import { pgTable, uuid, varchar, timestamp, bigint } from "drizzle-orm/pg-core";
import { AccountTable } from "./Account.js";
import { UserTable } from "./User.js";

export const TransactionTable = pgTable("transaction", {
  id: uuid("id").primaryKey().defaultRandom(),
  account_id: uuid("account_id").references(() => AccountTable.id, { onDelete: "cascade" }).notNull(),
  user_id: uuid("user_id").references(() => UserTable.id, { onDelete: "cascade" }).notNull(),
  amount: bigint("amount", { mode: "number"}).notNull(),
  description: varchar("description", { length: 255 }),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow().$onUpdateFn(() => new Date()),
});

export type TransactionInsertType = typeof TransactionTable.$inferInsert
export type TransactionSelectType = typeof TransactionTable.$inferSelect
