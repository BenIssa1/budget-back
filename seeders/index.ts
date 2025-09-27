import { createAdminUser } from './admin.seeder';

async function runAllSeeders() {
  console.log('🚀 Démarrage des seeders...');
  
  try {
    await createAdminUser();
    console.log('✅ Tous les seeders ont été exécutés avec succès !');
  } catch (error) {
    console.error('❌ Erreur lors de l\'exécution des seeders:', error);
    process.exit(1);
  }
}

// Exécuter tous les seeders
runAllSeeders();
