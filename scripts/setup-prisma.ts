import { PrismaClient } from "@prisma/client"

async function main() {
  const prisma = new PrismaClient()

  try {
    // Test the connection
    await prisma.$connect()
    console.log("Successfully connected to the database")

    // Check if tables exist
    const users = await prisma.user.findMany({ take: 1 })
    console.log(`Found ${users.length} users`)

    console.log("Prisma setup complete!")
  } catch (error) {
    console.error("Error setting up Prisma:", error)
  } finally {
    await prisma.$disconnect()
  }
}

main()
