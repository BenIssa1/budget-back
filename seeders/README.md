# Seeders

Ce dossier contient les scripts de seeders pour peupler la base de données avec des données initiales.

## Seeders disponibles

### Admin Seeder
Crée un compte administrateur par défaut avec les informations suivantes :
- **Email** : admin@budget.com
- **Mot de passe** : Admin123!
- **Rôle** : Admin

## Utilisation

### Exécuter tous les seeders
```bash
npm run seed
```

### Exécuter uniquement le seeder admin
```bash
npm run seed:admin
```

## Prérequis

1. Assurez-vous que votre base de données est configurée et accessible
2. Vérifiez que la variable d'environnement `DATABASE_URL` est correctement définie
3. Exécutez les migrations Prisma si nécessaire :
   ```bash
   npx prisma migrate dev
   ```

## Sécurité

⚠️ **Important** : Le mot de passe par défaut est `Admin123!`. Changez-le immédiatement après la première connexion pour des raisons de sécurité.

## Ajout de nouveaux seeders

Pour ajouter un nouveau seeder :

1. Créez un nouveau fichier `[nom].seeder.ts` dans ce dossier
2. Suivez le même pattern que `admin.seeder.ts`
3. Ajoutez l'import et l'appel dans `index.ts`
4. Ajoutez un script dans `package.json` si nécessaire

Exemple de structure :
```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createExampleData() {
  // Votre logique de seeder ici
}

export { createExampleData };
```
