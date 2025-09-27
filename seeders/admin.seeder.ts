import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function createAdminUser() {
  try {
    console.log('🌱 Début de la création du compte admin...');

    // Vérifier si un admin existe déjà
    const existingAdmin = await prisma.user.findFirst({
      where: { role: 'Admin' }
    });

    if (existingAdmin) {
      console.log('⚠️  Un compte admin existe déjà avec l\'email:', existingAdmin.email);
      return;
    }

    // Données du compte admin
    const adminData = {
      firstName: 'Admin',
      lastName: 'System',
      email: 'admin@budget.com',
      password: await bcrypt.hash('Admin123!', 10),
      role: 'Admin'
    };

    // Créer le compte admin
    const admin = await prisma.user.create({
      data: adminData
    });

    console.log('✅ Compte admin créé avec succès !');
    console.log('📧 Email:', admin.email);
    console.log('🔑 Mot de passe: Admin123!');
    console.log('👤 Rôle:', admin.role);
    console.log('🆔 ID:', admin.id);

  } catch (error) {
    console.error('❌ Erreur lors de la création du compte admin:', error);
    throw error;
  }
}

async function main() {
  try {
    await createAdminUser();
  } catch (error) {
    console.error('❌ Erreur dans le seeder:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Exécuter le seeder si ce fichier est appelé directement
if (require.main === module) {
  main();
}

export { createAdminUser };
