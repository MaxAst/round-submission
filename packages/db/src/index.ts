import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { schema } from "./schema";

export const pg = postgres({});

export const db = drizzle(pg, { schema });
export * from "./schema";
export * from "drizzle-orm";
