# Guide de Migration vers MongoDB

Ce document explique la migration de l'application SW Siege Planner du stockage en mémoire vers MongoDB.

## Résumé des Changements

### Avant (Stockage en mémoire)
- Les données étaient stockées dans des variables JavaScript :
  - `guildPlayers` : objet JavaScript
  - `guestPlayers` : Set JavaScript
  - `siegePlan` : objet JavaScript
- Toutes les données étaient perdues au redémarrage du serveur

### Après (MongoDB)
- Les données sont persistées dans MongoDB :
  - Collection `guildPlayers`
  - Collection `guestPlayers`
  - Collection `siegePlan`
- Les données survivent aux redémarrages du serveur

## Modifications Techniques

### 1. Dépendances Ajoutées

```json
{
  "mongodb": "^6.3.0",
  "dotenv": "^16.3.1",
  "body-parser": "^1.20.3" (mise à jour de sécurité)
}
```

### 2. Nouveaux Fichiers

- `Siege/README.md` - Documentation complète
- `Siege/.env.example` - Template de configuration
- `Siege/test-mongodb-integration.js` - Tests d'intégration
- `MIGRATION_GUIDE.md` - Ce fichier

### 3. Endpoints API Modifiés

Tous les endpoints utilisent maintenant des opérations MongoDB asynchrones :

| Endpoint | Méthode | Opération MongoDB |
|----------|---------|-------------------|
| `/api/state` | GET | `find()` sur toutes les collections |
| `/api/import` | POST | `updateOne()` avec upsert |
| `/api/update-defense` | POST | `updateOne()` avec path dynamique |
| `/api/player-monsters/:playerName` | GET | `findOne()` |
| `/api/add-guest` | POST | `insertOne()` |
| `/api/remove-guest/:guestName` | DELETE | `deleteOne()` + mise à jour du plan |

## Installation pour les Utilisateurs

### Option 1 : MongoDB Local

1. **Installer MongoDB :**
   ```bash
   # Ubuntu/Debian
   sudo apt-get install mongodb
   
   # macOS
   brew install mongodb-community
   
   # Windows
   # Télécharger depuis https://www.mongodb.com/try/download/community
   ```

2. **Démarrer MongoDB :**
   ```bash
   # Linux
   sudo systemctl start mongodb
   
   # macOS
   brew services start mongodb-community
   ```

3. **Configurer l'application :**
   ```bash
   cd Siege
   cp .env.example .env
   # Éditer .env si nécessaire (par défaut : mongodb://localhost:27017)
   ```

4. **Lancer l'application :**
   ```bash
   npm install
   npm start
   ```

### Option 2 : MongoDB avec Docker

1. **Démarrer MongoDB dans Docker :**
   ```bash
   docker run -d -p 27017:27017 --name mongodb mongo:latest
   ```

2. **Configurer et lancer l'application :**
   ```bash
   cd Siege
   npm install
   npm start
   ```

### Option 3 : MongoDB Atlas (Cloud)

1. **Créer un compte gratuit sur [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)**

2. **Créer un cluster et obtenir l'URI de connexion**

3. **Configurer l'application :**
   ```bash
   cd Siege
   cp .env.example .env
   # Éditer .env et définir :
   # MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net
   ```

4. **Lancer l'application :**
   ```bash
   npm install
   npm start
   ```

## Migration des Données

⚠️ **Important** : Les données de l'ancienne version en mémoire ne sont PAS automatiquement migrées.

### Pour conserver vos données :

1. **Avant la migration :** Si possible, exportez vos données manuellement
2. **Après la migration :** Ré-importez vos joueurs via l'interface web :
   - Utilisez l'onglet "Import JSON"
   - Importez les fichiers JSON de chaque joueur
   - Reconstituez votre plan de siège

## Vérification de l'Installation

Après le démarrage, vous devriez voir :

```
✓ Connecté à MongoDB
✓ Plan de siège initialisé
Serveur lancé sur http://localhost:3000
```

## Résolution des Problèmes

### MongoDB ne démarre pas
- Vérifier que MongoDB est installé : `mongod --version`
- Vérifier les logs : `sudo journalctl -u mongodb`
- Vérifier le port 27017 : `sudo lsof -i :27017`

### Erreur de connexion
- Vérifier l'URI dans `.env`
- Vérifier que MongoDB est accessible
- Tester la connexion : `mongo mongodb://localhost:27017`

### L'application ne démarre pas
- Vérifier les dépendances : `npm install`
- Vérifier les logs d'erreur dans la console
- Vérifier le fichier `.env`

## Rollback (Retour en Arrière)

Si vous souhaitez revenir à la version en mémoire :

```bash
git checkout main
cd Siege
npm install
npm start
```

Note : Vous perdrez les données stockées dans MongoDB.

## Support

Pour toute question ou problème :
1. Consultez le [README.md](Siege/README.md)
2. Vérifiez les issues GitHub
3. Contactez le mainteneur du projet

## Sécurité en Production

Si vous déployez en production, consultez la section "Sécurité" du README.md pour :
- Rate limiting
- Authentification
- HTTPS
- Sécurisation de MongoDB
