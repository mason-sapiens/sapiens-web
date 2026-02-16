import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function resetUsers() {
  try {
    console.log('🗑️  Deleting all user data...')

    // Delete all users (cascades to related data)
    const deletedUsers = await prisma.user.deleteMany({})
    console.log(`✅ Deleted ${deletedUsers.count} users`)

    // Delete verification tokens
    const deletedTokens = await prisma.verificationToken.deleteMany({})
    console.log(`✅ Deleted ${deletedTokens.count} verification tokens`)

    console.log('✨ Database reset complete!')
  } catch (error) {
    console.error('❌ Error resetting database:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

resetUsers()
