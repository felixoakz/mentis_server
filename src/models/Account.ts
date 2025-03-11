import { pgTable, uuid, varchar, timestamp, unique, bigint } from "drizzle-orm/pg-core";
import { UserTable } from "./User.js";

export const AccountTable = pgTable("account", {
  id: uuid("id").primaryKey().defaultRandom(),
  user_id: uuid("user_id").references(() => UserTable.id, { onDelete: "cascade" }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  balance: bigint("balance", {mode: "number"}).default(0),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updated_at: timestamp("updated_at").defaultNow().$onUpdateFn(() => new Date()),
  //ALTER ROLE postgres SET timezone TO 'UTC';
  //SELECT pg_reload_conf();
}, (table) => [
  unique().on(table.user_id, table.name) // Create a unique constraint combining user_id and name
]);

export type AccountInsertType = typeof AccountTable.$inferInsert;
export type AccountSelectType = typeof AccountTable.$inferSelect;
