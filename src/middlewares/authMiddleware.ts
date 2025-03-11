import { FastifyReply, FastifyRequest } from "fastify";

export async function authMiddleware(request: FastifyRequest, reply: FastifyReply) {
  try {
    await request.jwtVerify();

  } catch (err) {
    console.log('authMiddleware Error:\n', err);
    reply.status(401).send({ error: "Unauthorized" });

  }
}
