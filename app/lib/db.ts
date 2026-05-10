import { neon } from "@neondatabase/serverless";

// DATABASE_URL must be set in .env.local before running the dev server
const sql = neon(process.env.DATABASE_URL ?? "postgresql://placeholder/placeholder");

export default sql;
