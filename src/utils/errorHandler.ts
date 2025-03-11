import { FastifyReply } from "fastify";

type AppError = {
  name: string;
  message: string;
  statusCode: number;
};

const createError = (name: string, statusCode: number) => (message: string): AppError => ({
  name,
  message,
  statusCode,
});

export const BadRequestError = createError("BadRequestError", 400);
export const ValidationError = createError("ValidationError", 422);
export const NotFoundError = createError("NotFoundError", 404);
export const UnauthorizedError = createError("UnauthorizedError", 401);


export const handleError = (error: unknown, reply: FastifyReply): void => {
  // Custom AppError handling
  if (typeof error === "object" && error !== null && "statusCode" in error && "message" in error) {
    const err = error as AppError;
    console.error(`${err.name}: ${err.message}`);
    reply.status(err.statusCode).send({ error: err.message });
    return;
  }

  // Handling generic errors such as cannot destructure property errors
  if (error instanceof Error) {
    console.error("Unexpected Error:", error.message);
    reply.status(400).send({ error: error.message });
    return;
  }

  // Fallback for unknown errors
  console.error("Unknown Error:", error);
  reply.status(500).send({ error: "Internal Server Error" });
};

