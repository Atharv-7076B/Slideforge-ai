import { PrismaClient } from '../generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const connectionString = process.env.DATABASE_URL!

const adapter = new PrismaPg({
  connectionString,
})

declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined
}

export const prisma =
  globalThis.__prisma ??
  new PrismaClient({
    adapter,
  })

if (process.env.NODE_ENV !== 'production') {
  globalThis.__prisma = prisma
}
