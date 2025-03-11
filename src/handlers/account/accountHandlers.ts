import { FastifyReply, FastifyRequest } from "fastify";
import { db } from "../../configs/database.js";
import { and, eq } from "drizzle-orm";

import { AccountSelectType, AccountTable } from "../../models/Account.js";
import { UserFromCookie } from "../../utils/types.js";
import { BadRequestError, handleError, NotFoundError, ValidationError } from "../../utils/errorHandler.js";


export async function createAccount(request: FastifyRequest, reply: FastifyReply) {
  try {
    const { name, balance } = request.body as Pick<AccountSelectType, "name" | "balance">
    const user = request.user as UserFromCookie

    if (!name || name.trim() === '') throw ValidationError("Account name is required")

    const existingAccount = await db
      .select()
      .from(AccountTable)
      .where(
        and(
          eq(AccountTable.user_id, user.id),
          eq(AccountTable.name, name)
        )
      );

    if (existingAccount.length > 0) throw BadRequestError("Account name already exists")

    const [newAccount] = await db
      .insert(AccountTable)
      .values({ user_id: user.id, name, balance: balance ?? 0 })
      .returning()

    return reply.status(201).send({ newAccount });

  } catch (error) {
    handleError(error, reply);
  }
}

export async function listAccounts(request: FastifyRequest, reply: FastifyReply) {
  try {
    const user = request.user as UserFromCookie;

    const accounts = await db
      .select()
      .from(AccountTable)
      .where(eq(AccountTable.user_id, user.id));

    return reply.status(200).send({ accounts });

  } catch (error) {
    handleError(error, reply);
  }
}

export async function updateAccount(request: FastifyRequest, reply: FastifyReply) {
  try {
    const { name } = request.body as Pick<AccountSelectType, "name">
    const { id } = request.params as Pick<AccountSelectType, "id">;

    if (!name || name.trim() === "") throw ValidationError("Account name is required");

    const [existingAccount] = await db
      .select()
      .from(AccountTable)
      .where(eq(AccountTable.id, id));

    if (!existingAccount) throw NotFoundError("Account not found");

    const [updatedAccount] = await db
      .update(AccountTable)
      .set({ name })
      .where(eq(AccountTable.id, id))
      .returning();

    return reply.status(200).send({ updatedAccount });

  } catch (error) {
    handleError(error, reply);
  }
}

export async function deleteAccount(request: FastifyRequest, reply: FastifyReply) {
  try {
    const { id } = request.params as Pick<AccountSelectType, "id">;

    const [existingAccount] = await db
      .select()
      .from(AccountTable)
      .where(eq(AccountTable.id, id));

    if (!existingAccount) throw NotFoundError("Account not found");

    await db
      .delete(AccountTable)
      .where(eq(AccountTable.id, id));

    return reply.status(200).send({ message: "Account deleted successfully" });

  } catch (error) {
    handleError(error, reply);
  }
}
