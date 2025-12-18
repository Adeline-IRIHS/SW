# Checklist de déploiement - SW Siege Planner

## ✅ Code et Configuration

- [x] MongoDB + Mongoose installés et configurés
- [x] Modèles de données créés (Player, SiegePlan)
- [x] Migration de toutes les routes API vers MongoDB
- [x] Configuration Vercel (vercel.json)
- [x] Variables d'environnement (.env.example)
- [x] Gestion des erreurs et async/await
- [x] Rate limiting configuré (100 req/15min)
- [x] Connexion MongoDB optimisée pour serverless

## ✅ Sécurité

- [x] Aucune vulnérabilité connue dans les dépendances
- [x] body-parser mis à jour (v1.20.3 - correction DoS)
- [x] Rate limiting sur toutes les routes API
- [x] Variables d'environnement pour secrets
- [x] .env ajouté au .gitignore
- [x] Validation des entrées utilisateur
- [x] Scan de sécurité CodeQL: 0 alertes

## ✅ Documentation

- [x] README.md (root) - Vue d'ensemble et quick start
- [x] DEPLOYMENT.md - Guide de déploiement complet
- [x] SUMMARY.md - Résumé des modifications
- [x] ARCHITECTURE.md - Architecture technique
- [x] Siege/README.md - Documentation API
- [x] .env.example - Template de configuration
- [x] CHECKLIST.md - Ce fichier

## ✅ Tests et Validation

- [x] Syntaxe JavaScript validée (tous les fichiers)
- [x] Dépendances installées correctement
- [x] Structure de fichiers organisée
- [x] Git history propre

## 📋 Actions avant déploiement

### 1. MongoDB Atlas
- [ ] Créer un compte MongoDB Atlas
- [ ] Créer un cluster M0 (gratuit)
- [ ] Créer un utilisateur de base de données
- [ ] Configurer l'accès réseau (0.0.0.0/0 pour Vercel)
- [ ] Récupérer la chaîne de connexion
- [ ] Remplacer `<password>` et `<dbname>` dans la chaîne

### 2. Vercel
- [ ] Créer un compte Vercel
- [ ] Connecter le repository GitHub
- [ ] Configurer la variable d'environnement:
  - Name: `MONGODB_URI`
  - Value: Chaîne de connexion MongoDB complète
- [ ] Lancer le déploiement

### 3. Post-déploiement
- [ ] Vérifier que l'application est accessible
- [ ] Tester l'import d'un joueur
- [ ] Tester l'ajout d'un guest
- [ ] Tester la création d'une défense
- [ ] Vérifier la persistance des données (rafraîchir la page)
- [ ] Vérifier les logs Vercel (pas d'erreurs)

## 🔍 Points de vérification

### Connexion MongoDB
```javascript
// Doit afficher dans les logs Vercel:
"MongoDB connecté avec succès"
```

### Variables d'environnement
```javascript
// Dans Vercel Dashboard → Settings → Environment Variables
MONGODB_URI = mongodb+srv://user:pass@cluster.mongodb.net/sw-siege-planner
```

### Routes API
Toutes ces routes doivent fonctionner:
- `GET /api/state` → Retourne plan + joueurs
- `POST /api/import` → Importe un joueur
- `POST /api/update-defense` → Met à jour une défense
- `GET /api/player-monsters/:name` → Retourne les monstres
- `POST /api/add-guest` → Ajoute un guest
- `DELETE /api/remove-guest/:name` → Supprime un guest

## 🚨 Dépannage

### Erreur "Cannot connect to MongoDB"
1. Vérifier que `MONGODB_URI` est bien configurée dans Vercel
2. Vérifier que l'accès réseau est configuré (0.0.0.0/0)
3. Vérifier que le mot de passe ne contient pas de caractères spéciaux non encodés

### Erreur "Rate limit exceeded"
- Normal si plus de 100 requêtes en 15 minutes
- Attendre 15 minutes ou ajuster la limite dans server.js

### Données ne persistent pas
1. Vérifier les logs Vercel pour erreurs MongoDB
2. Vérifier que `MONGODB_URI` pointe vers le bon cluster
3. Vérifier que l'utilisateur a les permissions read/write

### Application ne démarre pas
1. Vérifier les logs de déploiement Vercel
2. Vérifier que toutes les dépendances sont dans package.json
3. Vérifier la version Node.js (doit être >=18)

## 📊 Métriques à surveiller

### Performance
- Temps de réponse API < 500ms
- Temps de connexion MongoDB < 100ms
- Taille des réponses JSON < 1MB

### Base de données
- Nombre de documents players < 1000
- Taille du document siegeplan < 50KB
- Nombre de connexions actives < 10

### Utilisation
- Requêtes API par jour
- Nombre de joueurs importés
- Nombre de défenses créées

## ✨ Fonctionnalités implémentées

1. **Gestion des joueurs**
   - Import depuis JSON (SW Exporter)
   - Stockage des monstres
   - Liste des joueurs disponibles

2. **Gestion des guests**
   - Ajout de joueurs invités
   - Accès à tous les monstres
   - Suppression avec nettoyage

3. **Plan de siège**
   - 12 bases × 5 défenses
   - Assignation joueur + 3 monstres
   - Détection des conflits
   - Persistance automatique

4. **Interface utilisateur**
   - Deux modes de workflow
   - Détection de conflits en temps réel
   - Suggestions de joueurs
   - Import/Export de données

## 🎯 Prochaines étapes (optionnelles)

- [ ] Ajouter authentification utilisateur
- [ ] Implémenter multi-guildes
- [ ] Ajouter historique des plans
- [ ] Créer système d'export PDF/Image
- [ ] Ajouter statistiques d'utilisation
- [ ] Implémenter notifications
- [ ] Ajouter mode collaboratif temps réel

## 📞 Support

Pour toute question:
1. Consulter DEPLOYMENT.md
2. Vérifier les logs Vercel
3. Vérifier les logs MongoDB Atlas
4. Ouvrir une issue GitHub

---

**Status**: ✅ Prêt pour le déploiement en production

**Version**: 1.0.0 avec MongoDB

**Dernière mise à jour**: 2025-12-18
