import Fastify, { FastifyInstance, FastifyReply } from "fastify";
import fastifyCookie from "@fastify/cookie";
import fastifyJwt from "@fastify/jwt";
import fastifyRateLimit from "@fastify/rate-limit";
import cors from "@fastify/cors";

import { loggingMiddleware } from "./middlewares/loggingMiddleware.js";
import { constants } from "./configs/constants.js";
import accountRoute from "./handlers/account/accountRoutes.js";
import authRoute from "./handlers/auth/authRoutes.js";
import transactionRoute from "./handlers/transaction/transactionRoutes.js";

const { cookieSecret, jwtSecret, rateLimit, port } = constants;

const fastify: FastifyInstance = Fastify();

// Register plugins
fastify.register(fastifyCookie, { secret: cookieSecret });

fastify.register(fastifyJwt, { secret: jwtSecret, cookie: { cookieName: "token", signed: true } });

fastify.register(fastifyRateLimit, { max: rateLimit.max, timeWindow: rateLimit.timeWindow });

await fastify.register(cors, {
  origin: [
    "http://localhost:4173",
    "http://localhost:5173",
    "https://appmentis.ddns.net"
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "Set-Cookie"],
  credentials: true,
  preflightContinue: true
})

// Middleware
fastify.addHook("onRequest", loggingMiddleware);

// Routes
const routes = [
  { route: authRoute, prefix: "/api/auth" },

  { route: accountRoute, prefix: "/api" },
  { route: transactionRoute, prefix: "/api" },
];

fastify.get('/api/ping', (_, reply: FastifyReply) => {
  return reply.send('pong')
})

routes.forEach(({ route, prefix }) => fastify.register(route, { prefix }));

// Start server
const start = async (): Promise<void> => {
  try {
    await fastify.listen({ port });
    console.log(`===> Server is running on http://localhost:${port}`);

  } catch (err) {
    console.error(err);
    fastify.log.error(err);
    process.exit(1);

  }
};

start();
