import { PrismaClient } from '@prisma/client'
import { readFileSync } from 'fs'
import { resolve } from 'path'

// Load .env.local
const envPath = resolve(process.cwd(), '.env.local')
const envFile = readFileSync(envPath, 'utf-8')
envFile.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/)
  if (match) {
    const key = match[1].trim()
    let value = match[2].trim()
    // Remove quotes if present
    if (value.startsWith('"') && value.endsWith('"')) {
      value = value.slice(1, -1)
    }
    process.env[key] = value
  }
})

const prisma = new PrismaClient()

async function resetDatabase() {
  try {
    console.log('🗑️  Deleting all data from database...')

    // Delete in order to respect foreign key constraints
    console.log('  → Deleting messages...')
    const deletedMessages = await prisma.message.deleteMany({})
    console.log(`     ✅ Deleted ${deletedMessages.count} messages`)

    console.log('  → Deleting milestones...')
    const deletedMilestones = await prisma.milestone.deleteMany({})
    console.log(`     ✅ Deleted ${deletedMilestones.count} milestones`)

    console.log('  → Deleting artifacts...')
    const deletedArtifacts = await prisma.artifact.deleteMany({})
    console.log(`     ✅ Deleted ${deletedArtifacts.count} artifacts`)

    console.log('  → Deleting project rooms...')
    const deletedRooms = await prisma.projectRoom.deleteMany({})
    console.log(`     ✅ Deleted ${deletedRooms.count} project rooms`)

    console.log('  → Deleting sessions...')
    const deletedSessions = await prisma.session.deleteMany({})
    console.log(`     ✅ Deleted ${deletedSessions.count} sessions`)

    console.log('  → Deleting accounts...')
    const deletedAccounts = await prisma.account.deleteMany({})
    console.log(`     ✅ Deleted ${deletedAccounts.count} accounts`)

    console.log('  → Deleting verification tokens...')
    const deletedTokens = await prisma.verificationToken.deleteMany({})
    console.log(`     ✅ Deleted ${deletedTokens.count} verification tokens`)

    console.log('  → Deleting users...')
    const deletedUsers = await prisma.user.deleteMany({})
    console.log(`     ✅ Deleted ${deletedUsers.count} users`)

    console.log('\n✨ Database completely cleared!')
    console.log('All users, rooms, messages, and related data have been deleted.')
  } catch (error) {
    console.error('❌ Error resetting database:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

resetDatabase()
