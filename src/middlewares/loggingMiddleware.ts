import { FastifyRequest } from "fastify";

export async function loggingMiddleware(request: FastifyRequest) {
  const method = request.method;
  const url = request.url;
  const timestamp = new Date().toISOString();

  console.log(
    `=> ${method} > ${url} | ${timestamp} |`
  );
}
