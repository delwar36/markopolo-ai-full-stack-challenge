import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Create a sample user
  const user = await prisma.user.upsert({
    where: { email: 'demo@markopolo.com' },
    update: {},
    create: {
      email: 'demo@markopolo.com',
      name: 'Demo User',
    },
  })

  console.log('✅ Created user:', user.email)

  // Create sample campaigns
  const campaign1 = await prisma.campaign.create({
    data: {
      title: 'Summer Sale Campaign',
      description: 'Promote summer products with special discounts',
      channel: 'email',
      dataSource: 'customer_database',
      userId: user.id,
      status: 'draft',
    },
  })

  const campaign2 = await prisma.campaign.create({
    data: {
      title: 'Product Launch Announcement',
      description: 'Announce new product line to existing customers',
      channel: 'social_media',
      dataSource: 'social_profiles',
      userId: user.id,
      status: 'active',
    },
  })

  console.log('✅ Created campaigns:', campaign1.title, campaign2.title)

  // Create sample messages
  const messages = [
    {
      content: 'I want to create a marketing campaign for our summer sale',
      role: 'user',
      userId: user.id,
      campaignId: campaign1.id,
    },
    {
      content: 'I can help you create a compelling summer sale campaign. Let me gather some information about your target audience and products.',
      role: 'assistant',
      userId: user.id,
      campaignId: campaign1.id,
    },
    {
      content: 'Our target audience is millennials aged 25-35 who are interested in sustainable fashion',
      role: 'user',
      userId: user.id,
      campaignId: campaign1.id,
    },
    {
      content: 'Perfect! For millennials interested in sustainable fashion, I recommend focusing on eco-friendly messaging and highlighting the environmental benefits of your products.',
      role: 'assistant',
      userId: user.id,
      campaignId: campaign1.id,
    },
  ]

  for (const messageData of messages) {
    await prisma.message.create({
      data: messageData,
    })
  }

  console.log('✅ Created', messages.length, 'sample messages')

  console.log('🎉 Database seeding completed!')
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
