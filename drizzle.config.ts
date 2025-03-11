import { defineConfig } from "drizzle-kit";
import { constants } from './src/configs/constants'

export default defineConfig({
  schema: "./src/models/**/*.ts",
  out: "./src/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: constants.db.databaseUrl
  },
  verbose: true,
  strict: true
});
