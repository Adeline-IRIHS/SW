const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const PORT = 3000;

app.use(express.static('.'));
app.use(bodyParser.json({ limit: '50mb' }));

// --- DONNÉES EN MÉMOIRE ---
// Stockage des joueurs : { "Pseudo": [ { unit_master_id: 123, ... }, ... ] }
let guildPlayers = {};

// Stockage des joueurs invités (guests)
let guestPlayers = new Set(); 

// Stockage du plan de siège
// Structure : 12 bases, chacune a 5 slots.
// slot = { player: "Pseudo", monsters: [id1, id2, id3] }
let siegePlan = {};

// Initialisation des 12 bases vides
for (let i = 1; i <= 12; i++) {
    siegePlan[i] = Array(5).fill(null).map(() => ({ player: null, monsters: [] }));
}

// --- API ---

// 1. Récupérer l'état actuel (Plan + Liste des joueurs dispos)
app.get('/api/state', (req, res) => {
    // Combiner les joueurs normaux et les guests
    const allPlayers = Object.keys(guildPlayers);
    
    // Ajouter les guests avec un marqueur
    const playersWithGuests = [
        ...allPlayers.map(p => ({ name: p, isGuest: false })),
        ...Array.from(guestPlayers).map(p => ({ name: p, isGuest: true }))
    ];
    
    res.json({
        plan: siegePlan,
        players: playersWithGuests,
        guests: Array.from(guestPlayers)
    });
});

// 2. Importer un JSON de joueur
app.post('/api/import', (req, res) => {
    const { playerName, monsterList } = req.body;
    
    // On ne garde que les champs utiles
    const cleanList = monsterList.map(m => ({
        unit_master_id: m.unit_master_id,
        // Ajoutez ici d'autres stats si besoin (hp, atk, spd...)
    }));

    guildPlayers[playerName] = cleanList;
    console.log(`[IMPORT] Joueur ${playerName} importé (${cleanList.length} monstres).`);
    res.json({ success: true, message: "Import réussi" });
});

// 3. Mettre à jour une défense
app.post('/api/update-defense', (req, res) => {
    const { baseId, slotIndex, player, monsters } = req.body; // monsters = [id1, id2, id3]
    
    if (!siegePlan[baseId]) return res.status(400).json({ error: "Base invalide" });

    // Mise à jour du plan
    siegePlan[baseId][slotIndex] = { player, monsters };
    
    console.log(`[UPDATE] Base ${baseId} Slot ${slotIndex+1} mis à jour.`);
    res.json({ success: true, plan: siegePlan });
});

// 4. Recherche de monstres d'un joueur (pour le frontend)
app.get('/api/player-monsters/:playerName', (req, res) => {
    const { playerName } = req.params;
    
    // Si c'est un guest, retourner un marqueur spécial
    if (guestPlayers.has(playerName)) {
        res.json({ isGuest: true, monsters: [] });
        return;
    }
    
    const monsters = guildPlayers[playerName] || [];
    res.json(monsters);
});

// 5. Ajouter un guest
app.post('/api/add-guest', (req, res) => {
    const { guestName } = req.body;
    
    if (!guestName || guestName.trim() === '') {
        return res.status(400).json({ error: "Le nom du guest ne peut pas être vide" });
    }
    
    // Vérifier si le guest existe déjà
    if (guestPlayers.has(guestName)) {
        return res.status(400).json({ error: "Ce guest existe déjà" });
    }
    
    // Vérifier si un joueur normal existe avec ce nom
    if (guildPlayers[guestName]) {
        return res.status(400).json({ error: "Un joueur avec ce nom existe déjà" });
    }
    
    guestPlayers.add(guestName);
    console.log(`[ADD GUEST] Guest ${guestName} ajouté.`);
    
    res.json({ 
        success: true, 
        message: "Guest ajouté avec succès",
        guests: Array.from(guestPlayers)
    });
});

// 6. Supprimer un guest
app.delete('/api/remove-guest/:guestName', (req, res) => {
    const { guestName } = req.params;
    
    if (!guestPlayers.has(guestName)) {
        return res.status(404).json({ error: "Guest non trouvé" });
    }
    
    // Nettoyer les assignations de ce guest dans le plan de siège
    for (const [baseId, slots] of Object.entries(siegePlan)) {
        slots.forEach((slot, index) => {
            if (slot.player === guestName) {
                siegePlan[baseId][index] = { player: null, monsters: [] };
            }
        });
    }
    
    guestPlayers.delete(guestName);
    console.log(`[REMOVE GUEST] Guest ${guestName} supprimé.`);
    
    res.json({ 
        success: true, 
        message: "Guest supprimé avec succès",
        guests: Array.from(guestPlayers)
    });
});

app.listen(PORT, () => {
    console.log(`Serveur lancé sur http://localhost:${PORT}`);
});
