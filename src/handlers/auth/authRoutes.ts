import { authLogin, authRegister } from "./authHandlers.js";
import { FastifyInstance } from "fastify";

export default async function authRoute(fastify: FastifyInstance) {

  fastify.post("/register", authRegister);
  fastify.post("/login", authLogin);

}
