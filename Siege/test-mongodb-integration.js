/**
 * Test script to verify MongoDB integration code structure
 * This doesn't require a running MongoDB instance
 */

const fs = require('fs');
const path = require('path');

console.log("🔍 Vérification de l'intégration MongoDB...\n");

// Read server.js
const serverPath = path.join(__dirname, 'server.js');
const serverCode = fs.readFileSync(serverPath, 'utf8');

// Tests de vérification
const tests = [
    {
        name: 'Import MongoDB',
        check: () => serverCode.includes("require('mongodb')"),
        description: 'Vérifie que le module MongoDB est importé'
    },
    {
        name: 'Configuration MongoDB',
        check: () => serverCode.includes('MONGODB_URI') && serverCode.includes('process.env.MONGODB_URI'),
        description: 'Vérifie la présence de la configuration MongoDB avec variable d\'environnement'
    },
    {
        name: 'Fonction de connexion',
        check: () => serverCode.includes('connectToMongoDB') && serverCode.includes('client.connect()'),
        description: 'Vérifie la fonction de connexion à MongoDB'
    },
    {
        name: 'Collections MongoDB',
        check: () => {
            return serverCode.includes('guildPlayersCollection') &&
                   serverCode.includes('guestPlayersCollection') &&
                   serverCode.includes('siegePlanCollection');
        },
        description: 'Vérifie la déclaration des collections MongoDB'
    },
    {
        name: 'Initialisation du plan de siège',
        check: () => serverCode.includes('initializeSiegePlan'),
        description: 'Vérifie la fonction d\'initialisation du plan'
    },
    {
        name: 'API GET /api/state avec async',
        check: () => {
            const match = serverCode.match(/app\.get\s*\(\s*['"`]\/api\/state['"`]\s*,\s*async/);
            return match !== null;
        },
        description: 'Vérifie que l\'endpoint GET /api/state utilise async/await'
    },
    {
        name: 'API POST /api/import avec MongoDB',
        check: () => {
            return serverCode.includes('app.post') &&
                   serverCode.includes('/api/import') &&
                   serverCode.includes('guildPlayersCollection.updateOne');
        },
        description: 'Vérifie que l\'endpoint POST /api/import utilise MongoDB'
    },
    {
        name: 'API POST /api/update-defense avec MongoDB',
        check: () => {
            return serverCode.includes('/api/update-defense') &&
                   serverCode.includes('siegePlanCollection.updateOne');
        },
        description: 'Vérifie que l\'endpoint POST /api/update-defense utilise MongoDB'
    },
    {
        name: 'API GET /api/player-monsters avec MongoDB',
        check: () => {
            return serverCode.includes('/api/player-monsters') &&
                   serverCode.includes('guestPlayersCollection.findOne');
        },
        description: 'Vérifie que l\'endpoint GET /api/player-monsters utilise MongoDB'
    },
    {
        name: 'API POST /api/add-guest avec MongoDB',
        check: () => {
            return serverCode.includes('/api/add-guest') &&
                   serverCode.includes('guestPlayersCollection.insertOne');
        },
        description: 'Vérifie que l\'endpoint POST /api/add-guest utilise MongoDB'
    },
    {
        name: 'API DELETE /api/remove-guest avec MongoDB',
        check: () => {
            return serverCode.includes('/api/remove-guest') &&
                   serverCode.includes('guestPlayersCollection.deleteOne');
        },
        description: 'Vérifie que l\'endpoint DELETE /api/remove-guest utilise MongoDB'
    },
    {
        name: 'Gestion des erreurs',
        check: () => {
            const tryCount = (serverCode.match(/try\s*{/g) || []).length;
            const catchCount = (serverCode.match(/catch\s*\(/g) || []).length;
            return tryCount >= 6 && catchCount >= 6;
        },
        description: 'Vérifie la présence de gestion d\'erreurs (try/catch)'
    },
    {
        name: 'Démarrage avec connexion MongoDB',
        check: () => serverCode.includes('connectToMongoDB().then'),
        description: 'Vérifie que le serveur démarre après connexion à MongoDB'
    }
];

// Exécuter les tests
let passed = 0;
let failed = 0;

tests.forEach((test, index) => {
    const result = test.check();
    const status = result ? '✅' : '❌';
    
    console.log(`${status} Test ${index + 1}/${tests.length}: ${test.name}`);
    console.log(`   ${test.description}`);
    
    if (result) {
        passed++;
    } else {
        failed++;
        console.log(`   ⚠️  Ce test a échoué`);
    }
    console.log();
});

// Résumé
console.log('━'.repeat(60));
console.log(`Résumé: ${passed}/${tests.length} tests réussis`);

if (failed === 0) {
    console.log('✅ Tous les tests sont passés! L\'intégration MongoDB est correcte.');
    process.exit(0);
} else {
    console.log(`❌ ${failed} test(s) ont échoué.`);
    process.exit(1);
}
