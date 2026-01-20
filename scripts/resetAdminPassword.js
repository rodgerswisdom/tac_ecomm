import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  const newPassword = 'Admin123!' // Choose your password
  const hash = await bcrypt.hash(newPassword, 12)

  const updated = await prisma.user.updateMany({
    where: { email: 'admin@tacaccessories.com', role: 'ADMIN' },
    data: { passwordHash: hash }
  })

  console.log('Admin password updated successfully:', updated)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
