import { and, eq, sql } from "drizzle-orm";
import { FastifyReply, FastifyRequest } from "fastify";

import { TransactionSelectType, TransactionTable } from "../../models/Transaction.js";
import { AccountTable } from "../../models/Account.js";
import { db } from "../../configs/database.js";
import { UserFromCookie } from "../../utils/types.js";
import { handleError, NotFoundError, ValidationError } from "../../utils/errorHandler.js";


export async function createTransaction(request: FastifyRequest, reply: FastifyReply): Promise<void> {
	try {
		const user = request.user as UserFromCookie
		const { account_id, amount, description } = request.body as
			Pick<TransactionSelectType, "account_id" | "amount" | "description">


		if (!account_id || !amount)
			throw ValidationError("Missing required fields account id and/or amount")

		if (isNaN(amount)) throw ValidationError("Invalid amount");

		const [currentBalance] = await db
			.select({ balance: AccountTable.balance })
			.from(AccountTable)
			.where(eq(AccountTable.id, account_id))
			.limit(1)

		const balanceAfter = (currentBalance?.balance ?? 0) + amount

		const [newTransaction] = await db
			.insert(TransactionTable)
			.values({
				account_id: account_id,
				user_id: user.id,
				amount: amount,
				description: description
			})
			.returning({
				id: TransactionTable.id,
				description: TransactionTable.description,
				account_id: TransactionTable.account_id,
				amount: TransactionTable.amount,
				created_at: TransactionTable.created_at
			})

		const [newBalance] = await db
			.update(AccountTable)
			.set({ balance: balanceAfter })
			.where(eq(AccountTable.id, account_id))
			.returning({ balance: AccountTable.balance })

		return reply.status(201).send({ newTransaction, newBalance })

	} catch (error) {
		handleError(error, reply);
	}
}

export async function listTransactions(request: FastifyRequest, reply: FastifyReply): Promise<void> {
	try {
		const user = request.user as UserFromCookie
		const { accountId } = request.params as { accountId: string }

		if (!accountId) throw ValidationError("Account Id is required");

		const transactions = await db
			.select({
				id: TransactionTable.id,
				description: TransactionTable.description,
				account_id: TransactionTable.account_id,
				amount: TransactionTable.amount
			})
			.from(TransactionTable)
			.where(
				and(
					eq(TransactionTable.user_id, user.id),
					eq(TransactionTable.account_id, accountId)
				))
			.orderBy(TransactionTable.created_at)

		return reply.send({ transactions })

	} catch (error) {
		handleError(error, reply);
	}
}

export async function updateTransaction(request: FastifyRequest, reply: FastifyReply): Promise<void> {
	try {
		const { id } = request.params as Pick<TransactionSelectType, "id">
		const { amount, description } = request.body as Partial<Pick<TransactionSelectType, "amount" | "description">> || {};

		if (amount === undefined && description === undefined) {
			throw ValidationError("At least one field (amount or description) must be provided");
		}

		const [existingTransaction] = await db
			.select()
			.from(TransactionTable)
			.where(eq(TransactionTable.id, id));

		if (!existingTransaction) throw NotFoundError("Transaction not found");

		const updateData: Partial<TransactionSelectType> = {};
		if (amount !== undefined) updateData.amount = amount;
		if (description !== undefined) updateData.description = description;

		const [updatedTransaction] = await db
			.update(TransactionTable)
			.set(updateData)
			.where(eq(TransactionTable.id, id))
			.returning({
				id: TransactionTable.id,
				description: TransactionTable.description,
				account_id: TransactionTable.account_id,
				amount: TransactionTable.amount,
				created_at: TransactionTable.created_at
			})

		let newBalance = null
		if (amount !== undefined) {
			const amountDifference = amount - existingTransaction.amount;

			[newBalance] = await db
				.update(AccountTable)
				.set({ balance: sql`${AccountTable.balance} + ${amountDifference}` })
				.where(eq(AccountTable.id, existingTransaction.account_id))
				.returning({ balance: AccountTable.balance });
		}

		return reply.status(200).send({ updatedTransaction, newBalance });

	} catch (error) {
		handleError(error, reply);
	}
}

export async function deleteTransaction(request: FastifyRequest, reply: FastifyReply): Promise<void> {
	try {
		const { id } = request.params as Pick<TransactionSelectType, "id">;

		const [transaction] = await db
			.select({ amount: TransactionTable.amount, account_id: TransactionTable.account_id })
			.from(TransactionTable)
			.where(eq(TransactionTable.id, id));

		if (!transaction) throw NotFoundError("Transaction not found");

		await db.delete(TransactionTable).where(eq(TransactionTable.id, id));

		const [newBalance] = await db
			.update(AccountTable)
			.set({ balance: sql`${AccountTable.balance} - ${transaction.amount}` })
			.where(eq(AccountTable.id, transaction.account_id))
			.returning({ balance: AccountTable.balance })

		return reply.status(200).send({ message: "Transaction deleted successfully", newBalance });

	} catch (error) {
		handleError(error, reply);
	}
}
