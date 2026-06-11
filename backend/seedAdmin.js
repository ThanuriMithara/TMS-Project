import { prisma } from './src/config/prisma.js';
import bcrypt from 'bcrypt';

async function main() {
  const adminEmail = 'admin@tms.com';
  
  // Check if admin exists
  let adminUser = await prisma.user.findUnique({
    where: { email: adminEmail }
  });

  const hashedPassword = await bcrypt.hash('Admin@123', 10);
  
  if (!adminUser) {
    adminUser = await prisma.user.create({
      data: {
        name: 'System Admin',
        email: adminEmail,
        password_hash: hashedPassword,
        role: 'admin',
        is_active: true,
        must_reset_password: false
      }
    });
    console.log('Created default admin user:');
  } else {
    adminUser = await prisma.user.update({
      where: { email: adminEmail },
      data: { password_hash: hashedPassword, must_reset_password: false }
    });
    console.log('Updated existing admin user password.');
  }
  console.log(`Email: ${adminEmail}`);
  console.log(`Password: Admin@123`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
