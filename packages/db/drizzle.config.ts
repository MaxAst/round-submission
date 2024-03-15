import type { Config } from "drizzle-kit";

export default {
  schema: "./src/schema",
  out: "./drizzle",
  driver: "pg",
  dbCredentials: {
    host: process.env.PGHOST ?? "localhost",
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    database: process.env.PGDATABASE ?? "postgres",
  },
} satisfies Config;
