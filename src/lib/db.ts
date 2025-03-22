import { PrismaClient, Prisma } from '.prisma/client'

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
//
// Learn more: 
// https://pris.ly/d/help/next-js-best-practices

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Add logging for better debugging
const prismaClientOptions: Prisma.PrismaClientOptions = {
  log: process.env.NODE_ENV === 'development' 
    ? ['query', 'error', 'warn'] as Prisma.LogLevel[]
    : ['error'] as Prisma.LogLevel[],
}

// Initialize Prisma with error handling
let prismaClient: PrismaClient
try {
  prismaClient = globalForPrisma.prisma ?? new PrismaClient(prismaClientOptions)
  console.log('Prisma client initialized successfully')
} catch (error) {
  console.error('Failed to initialize Prisma client:', error)
  // Create a basic client as fallback
  prismaClient = new PrismaClient()
}

export const prisma = prismaClient

// Keep the singleton pattern in development
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

// Test database connection
prisma.$connect()
  .then(() => console.log('Database connection established successfully'))
  .catch(error => console.error('Failed to connect to database:', error))

export default prisma 