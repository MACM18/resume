/**
 * Migration script to move existing domains from Profile.domain to the new Domain table.
 * Run this BEFORE running `npx prisma db push`.
 */
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🚀 Starting domain migration...')
  
  try {
    // We use raw SQL to fetch from the old column because it might have been removed from schema.prisma
    const oldProfiles = await prisma.$queryRawUnsafe<any[]>(
      'SELECT id, domain FROM profiles WHERE domain IS NOT NULL'
    )
    
    console.log(`Found ${oldProfiles.length} profiles to migrate.`)
    
    for (const profile of oldProfiles) {
      const domainId = `cldomain_${profile.id.split('_').pop()}` // Simple ID generation
      
      await prisma.domain.upsert({
        where: { domain: profile.domain },
        update: {},
        create: {
          domain: profile.domain,
          profileId: profile.id,
          isPrimary: true
        }
      })
      console.log(`✅ Migrated domain "${profile.domain}" for profile ${profile.id}`)
    }
    
    console.log('\n✨ Migration complete! You can now safely run `npx prisma db push`.')
  } catch (error) {
    console.error('❌ Migration failed:', error)
    console.log('\nTIP: If it says the "domain" column does not exist, you might have already run db push and lost the data.')
  }
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
