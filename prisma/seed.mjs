/**
 * WebTuly seed — creates a demo admin account and a few demo messages.
 *
 * Run:            npm run seed   (or: node prisma/seed.mjs)
 * Against Neon:   DATABASE_URL="postgresql://…neon…" npm run seed
 *
 * Demo admin → email: admin@webtuly.com   password: Admin@12345
 * (Change the password after first login, or create your own admin via /admin/setup.)
 */
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

function resolveDatabaseUrl() {
  const raw = process.env.DATABASE_URL?.trim()
  if (raw && !raw.startsWith('file:')) return raw
  return 'postgresql://postgres@127.0.0.1:5432/postgres?schema=public&connection_limit=1'
}

const db = new PrismaClient({ datasourceUrl: resolveDatabaseUrl() })

async function main() {
  const email = 'admin@webtuly.com'
  const existing = await db.user.findUnique({ where: { email } })
  if (existing) {
    console.log(`Admin ${email} already exists — skipping.`)
  } else {
    const passwordHash = await bcrypt.hash('Admin@12345', 10)
    await db.user.create({
      data: { name: 'WebTuly Admin', email, passwordHash, role: 'ADMIN' },
    })
    console.log(`✅ Admin created → ${email} / Admin@12345`)
  }

  const msgCount = await db.message.count()
  if (msgCount === 0) {
    await db.message.createMany({
      data: [
        {
          name: 'রাকিব হাসান',
          email: 'rakib@example.com',
          subject: 'ই-কমার্স ওয়েবসাইট দরকার',
          body: 'আসসালামু আলাইকুম! আমার একটা পোশাকের অনলাইন স্টোর দরকার। বাজেট ও ডিটেইলস নিয়ে কথা বলতে চাই।',
          ip: '127.0.0.1',
        },
        {
          name: 'Sarah Miller',
          email: 'sarah@example.com',
          subject: 'Landing page redesign',
          body: 'Hi! I have a Figma design for a SaaS landing page that needs to be converted to a fast, responsive site. Are you available this month?',
          ip: '127.0.0.1',
        },
        {
          name: 'তানভীর আহমেদ',
          email: 'tanvir@example.com',
          subject: 'ওয়েবসাইট স্পিড অপটিমাইজেশন',
          body: 'আমার কোম্পানির ওয়েবসাইট খুব স্লো। পেজ স্পিড অপটিমাইজ করতে হবে। খরচ কত হতে পারে?',
          ip: '127.0.0.1',
          isRead: true,
        },
      ],
    })
    console.log('✅ 3 demo messages created.')
  } else {
    console.log(`Messages table already has ${msgCount} rows — skipping.`)
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => db.$disconnect())
