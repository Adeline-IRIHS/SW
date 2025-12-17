let currentPlan = {};
let guildPlayersList = [];
let currentBaseId = null;

// Chargement initial
async function loadState() {
    const res = await fetch('/api/state');
    const data = await res.json();
    currentPlan = data.plan;
    guildPlayersList = data.players;
    renderBasesMenu();
    if (currentBaseId) renderBaseDetails(currentBaseId);
}

// 1. Rendu du menu des 12 bases
function renderBasesMenu() {
    const container = document.getElementById('bases-container');
    container.innerHTML = '';
    for (let i = 1; i <= 12; i++) {
        const filledSlots = currentPlan[i].filter(s => s.player).length;
        const btn = document.createElement('div');
        btn.className = 'col-4'; // 3 par ligne
        btn.innerHTML = `
            <button class="btn btn-outline-primary base-btn ${currentBaseId == i ? 'active' : ''}" 
                    onclick="selectBase(${i})">
                Base ${i} <br> <small>${filledSlots}/5</small>
            </button>
        `;
        container.appendChild(btn);
    }
}

function selectBase(id) {
    currentBaseId = id;
    document.getElementById('welcome-view').style.display = 'none';
    document.getElementById('base-view').style.display = 'block';
    document.getElementById('base-title').innerText = `Base ${id}`;
    renderBasesMenu(); // Pour mettre à jour l'état actif
    renderBaseDetails(id);
}

// 2. Rendu des 5 slots d'une base
function renderBaseDetails(baseId) {
    const container = document.getElementById('slots-container');
    container.innerHTML = '';
    const slots = currentPlan[baseId];

    slots.forEach((slot, index) => {
        const div = document.createElement('div');
        div.className = 'slot-card';
        
        // Mode affichage ou édition ? Simple mode édition tout le temps pour ce MVP
        let playerSelect = `<select class="form-select mb-2" onchange="updateSlotPlayer(${baseId}, ${index}, this.value)">
            <option value="">-- Choisir un joueur --</option>
            ${guildPlayersList.map(p => `<option value="${p}" ${slot.player === p ? 'selected' : ''}>${p}</option>`).join('')}
        </select>`;

        // Sélection des monstres (3 selects simples pour commencer)
        let monstersHtml = '';
        if (slot.player) {
            monstersHtml = `<div class="d-flex gap-2">
                ${[0, 1, 2].map(mIdx => {
                    return `<input type="text" class="form-control monster-input" 
                            placeholder="ID Monstre (ex: 101)" 
                            value="${slot.monsters[mIdx] || ''}"
                            onchange="updateSlotMonster(${baseId}, ${index}, ${mIdx}, this.value)">`;
                }).join('')}
            </div>
            <div class="mt-2 text-muted small">
                ${slot.monsters.map(id => id ? getMonsterName(id) : '-').join(' | ')}
            </div>`;
        }

        // Vérification des conflits
        let conflictHtml = '';
        if (slot.player && slot.monsters.length > 0) {
            const conflicts = checkConflicts(slot.player, slot.monsters, baseId, index);
            if (conflicts.length > 0) {
                div.className += ' conflict';
                conflictHtml = `<div class="conflict-msg">⚠️ Conflit: ${conflicts.join(', ')}</div>`;
            }
        }

        div.innerHTML = `
            <h5>Emplacement ${index + 1}</h5>
            ${playerSelect}
            ${monstersHtml}
            ${conflictHtml}
        `;
        container.appendChild(div);
    });
}

// 3. Gestion des mises à jour
async function updateSlotPlayer(baseId, slotIndex, player) {
    // Récupérer les données actuelles du slot pour ne pas écraser les monstres si on change juste de joueur (optionnel)
    // Pour l'instant, reset monstres si changement de joueur
    await sendUpdate(baseId, slotIndex, player, []); 
}

async function updateSlotMonster(baseId, slotIndex, monsterIdx, value) {
    const slot = currentPlan[baseId][slotIndex];
    const newMonsters = [...slot.monsters];
    newMonsters[monsterIdx] = value ? parseInt(value) : null;
    await sendUpdate(baseId, slotIndex, slot.player, newMonsters);
}

async function sendUpdate(baseId, slotIndex, player, monsters) {
    await fetch('/api/update-defense', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ baseId, slotIndex, player, monsters })
    });
    loadState(); // Recharger pour voir les conflits globaux
}

// 4. Détection des conflits (Unicité globale)
function checkConflicts(player, monsters, currentBaseId, currentSlotIndex) {
    let conflicts = [];
    monsters.forEach(mId => {
        if (!mId) return;
        
        // Parcourir tout le plan
        for (const [bId, slots] of Object.entries(currentPlan)) {
            slots.forEach((s, sIdx) => {
                // On ignore le slot actuel qu'on est en train d'éditer
                if (bId == currentBaseId && sIdx == currentSlotIndex) return;

                // Si c'est le même monstre utilisé n'importe où ailleurs (peu importe le joueur ? Non, "Un monstre ne peut être utilisé qu'une seule fois")
                // -> Dans SW, c'est une fois par joueur. Donc on vérifie si CE joueur utilise ce monstre ailleurs.
                if (s.player === player && s.monsters.includes(mId)) {
                    conflicts.push(`${getMonsterName(mId)} déjà utilisé en Base ${bId} (Slot ${sIdx + 1})`);
                }
            });
        }
    });
    return conflicts;
}

// 5. Import JSON
async function importJson() {
    const pseudo = document.getElementById('import-pseudo').value;
    const fileInput = document.getElementById('import-file');
    
    if (!pseudo || !fileInput.files[0]) {
        alert("Pseudo et fichier requis");
        return;
    }

    const file = fileInput.files[0];
    const reader = new FileReader();
    
    reader.onload = async (e) => {
        try {
            const json = JSON.parse(e.target.result);
            // On suppose que le JSON est au format SW Exporter, unit_list est souvent la clé
            const monsterList = json.unit_list || json; 

            await fetch('/api/import', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ playerName: pseudo, monsterList })
            });
            alert("Import réussi !");
            loadState();
        } catch (err) {
            console.error(err);
            alert("Erreur lors de la lecture du JSON");
        }
    };
    reader.readAsText(file);
}

// Démarrage
loadState();