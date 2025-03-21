import { FastifyRequest, FastifyReply, FastifyInstance } from "fastify";
import { eq } from "drizzle-orm";
import bcrypt from 'bcrypt';

import { UserSelectType, UserTable } from "../../models/User.js";
import { db } from "../../configs/database.js";
import { handleError, NotFoundError, ValidationError } from "../../utils/errorHandler.js";


export async function authRegister(request: FastifyRequest, reply: FastifyReply): Promise<void> {

  try {
    const { username, email, password } = request.body as Pick<UserSelectType, "username" | "email" | "password">

    if (!username || !email || !password)
      throw ValidationError('Username, email, and password are required');

    const hashedPassword = await bcrypt.hash(password, 10);

    const [userModel] = await db
      .insert(UserTable)
      .values({ username, email, password: hashedPassword })
      .returning();

    const user = { id: userModel.id, username: userModel.username };

    reply.send({
      message: "User registered",
      user
    });

  } catch (error) {
    handleError(error, reply);
  }
}


export async function authLogin(request: FastifyRequest, reply: FastifyReply) {

  const fastify = request.server as FastifyInstance;
  const { email, password } = request.body as Pick<UserSelectType, "email" | "password">

  try {
    const [existingUser] = await db.select()
      .from(UserTable)
      .where(eq(UserTable.email, email));

    if (!existingUser) throw NotFoundError("User not found");

    const isValid = await bcrypt.compare(password, existingUser.password);

    if (!isValid) throw ValidationError("Invalid password");

    const { id, username } = existingUser;

    const user: Pick<UserSelectType, "id" | "username"> = { id, username };

    const token = fastify.jwt.sign({ id: existingUser.id });


    reply.setCookie("token", token, {
      httpOnly: true,
      signed: true,
      path: "/",
      secure: true,
      sameSite: "none"
    });

    reply.send({ message: "Logged in", user });

  } catch (error) {
    handleError(error, reply);
  }
}
