import { FastifyInstance } from "fastify";

import { authMiddleware } from "../../middlewares/authMiddleware.js";
import { createAccount, listAccounts, updateAccount, deleteAccount } from "../../handlers/account/accountHandlers.js";

export default async function accountRoute(fastify: FastifyInstance) {
  fastify.addHook("onRequest", authMiddleware);

  fastify.post("/accounts", createAccount);
  fastify.get("/accounts", listAccounts);
  fastify.put("/accounts/:id", updateAccount);
  fastify.delete("/accounts/:id", deleteAccount);
}
