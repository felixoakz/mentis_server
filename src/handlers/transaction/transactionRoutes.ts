import { FastifyInstance } from "fastify";

import { authMiddleware } from "../../middlewares/authMiddleware.js";
import { createTransaction, deleteTransaction, listTransactions, updateTransaction } from "./transactionHandlers.js";


export default async function transactionRoute(fastify: FastifyInstance) {
	fastify.addHook("onRequest", authMiddleware)

	fastify.post("/transactions", createTransaction)
	fastify.get("/transactions/:accountId", listTransactions)
	fastify.put("/transactions/:id", updateTransaction)
	fastify.delete("/transactions/:id", deleteTransaction)
}
