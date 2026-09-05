import 'dotenv/config'
import { defineConfig } from 'drizzle-kit'

const databaseUrl = process.env['DATABASE_URL']

if (databaseUrl == null || databaseUrl.trim() === '') {
  throw new Error('DATABASE_URL is required for drizzle-kit')
}

export default defineConfig({
  out: './drizzle',
  schema: './src/server/schemas/index.ts',
  dialect: 'postgresql',
  dbCredentials: {
    url: databaseUrl
  }
})
