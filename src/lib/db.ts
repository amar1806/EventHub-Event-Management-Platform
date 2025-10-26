import { PrismaClient } from '@prisma/client'

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
//
// Learn more: 
// https://pris.ly/d/help/next-js-best-practices

// To prevent multiple instances in development
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Add logging for better debugging
// Avoid referencing Prisma types directly here to prevent compatibility
// issues with different @prisma/client generated typings. Use a loose
// options shape and cast where needed when constructing the client.
const prismaClientOptions = {
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
}

// Initialize Prisma with error handling
let prismaClient: PrismaClient
try {
  prismaClient = globalForPrisma.prisma ?? new PrismaClient(prismaClientOptions as any)
  console.log('Prisma client initialized successfully')
} catch (error: any) {
  console.error('Failed to initialize Prisma client:', error)
  // Create a basic client as fallback
  prismaClient = new PrismaClient()
}

export const prisma = prismaClient

// Keep the singleton pattern in development
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

// Test database connection - BUT ONLY ON SERVER SIDE
if (typeof window === 'undefined') {
  prisma.$connect()
    .then(() => console.log('Database connection established successfully'))
    .catch((error: any) => console.error('Failed to connect to database:', error))
}

// NOTE: For the password reset functionality to work properly, the User model
// in Prisma schema needs to have the following fields:
//   resetToken      String?
//   resetTokenExpiry DateTime?
// 
// If these fields are missing, add them to the schema.prisma file and run
// npx prisma generate
// npx prisma db push

export default prisma 