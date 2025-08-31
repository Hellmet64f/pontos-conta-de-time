document.addEventListener('DOMContentLoaded', () => {

    const STORAGE_KEYS = { roster: 'tcs_roster_v3', stats: 'tcs_stats_v3' };
    const QUALIFICATION_AVERAGE = 6.0;

    // === 1. FUNÇÕES DE DADOS E CÁLCULO (LÓGICA ATUALIZADA) ===
    const getRoster = () => JSON.parse(localStorage.getItem(STORAGE_KEYS.roster)) || [];
    const saveRoster = (roster) => localStorage.setItem(STORAGE_KEYS.roster, JSON.stringify(roster));
    const getStats = () => JSON.parse(localStorage.getItem(STORAGE_KEYS.stats)) || {};
    const saveStats = (stats) => localStorage.setItem(STORAGE_KEYS.stats, JSON.stringify(stats));

    const calculatePoints = (playerId, stats) => {
        const playerStats = stats[playerId] || { goals: 0, assists: 0, saves: 0, dribbles: 0 };
        // --- LÓGICA DE PONTOS ATUALIZADA ---
        const goalPoints = (playerStats.goals || 0) * 0.3;
        const assistPoints = (playerStats.assists || 0) * 0.2;
        const savePoints = (playerStats.saves || 0) * 0.8;
        const dribblePoints = (playerStats.dribbles || 0) * 1.0;
        return goalPoints + assistPoints + savePoints + dribblePoints;
    };

    // === 2. FUNÇÕES DE RENDERIZAÇÃO (ATUALIZAR TELA) ===
    const renderAll = () => {
        renderLeaderboard();
        renderAdminRoster();
        renderStatEntryForm();
    };

    const renderLeaderboard = () => {
        const leaderboardList = document.getElementById('leaderboard-list');
        // (código sem alterações...)
        const roster = getRoster(); const stats = getStats(); leaderboardList.innerHTML = '';
        if (roster.length === 0) { leaderboardList.innerHTML = '<p style="text-align: center; padding: 2rem;">Nenhum jogador no elenco. Adicione no painel Admin.</p>'; return; }
        const rankedPlayers = roster.map(player => ({ ...player, points: calculatePoints(player.id, stats) })).sort((a, b) => b.points - a.points);
        rankedPlayers.forEach((player, index) => {
            const isRank1 = index === 0; const item = document.createElement('div'); item.className = `leaderboard-item ${isRank1 ? 'rank-1' : ''}`;
            item.dataset.playerId = player.id; item.innerHTML = `<div class="pos">${isRank1 ? '👑' : `${index + 1}º`}</div><div class="player-name">${player.name}</div><div class="player-points">${player.points.toFixed(1)} pts</div>`;
            leaderboardList.appendChild(item);
        });
    };

    const renderAdminRoster = () => {
        const rosterList = document.getElementById('admin-roster-list');
        // (código com novo botão de reset)
        const roster = getRoster(); rosterList.innerHTML = '';
        roster.forEach((player) => {
            const row = document.createElement('tr'); row.innerHTML = `
                <td><span class="player-name">${player.name}</span></td>
                <td class="admin-roster-actions">
                    <button class="btn admin-roster-item btn-warning" data-id="${player.id}" title="Resetar Stats">Resetar Stats</button>
                    <button class="btn admin-roster-item" data-id="${player.id}" title="Editar Nome">Editar</button>
                    <button class="btn admin-roster-item btn-danger" data-id="${player.id}" title="Excluir Jogador">Excluir</button>
                </td>
            `;
            rosterList.appendChild(row);
        });
    };

    const renderStatEntryForm = () => {
        const statEntryList = document.getElementById('stat-entry-list');
        // (código sem alterações...)
        const roster = getRoster(); statEntryList.innerHTML = '';
        roster.forEach(player => {
            const item = document.createElement('div'); item.className = 'stat-entry-item'; item.dataset.playerId = player.id;
            item.innerHTML = `<span class="player-name">${player.name}</span><div class="stat-input-group"><label>G</label><button class="btn add-stat">+</button><input type="number" class="stat-value" min="0" value="0"></div><div class="stat-input-group"><label>A</label><button class="btn add-stat">+</button><input type="number" class="stat-value" min="0" value="0"></div><div class="stat-input-group"><label>S</label><button class="btn add-stat">+</button><input type="number" class="stat-value" min="0" value="0"></div><div class="stat-input-group"><label>D</label><button class="btn add-stat">+</button><input type="number" class="stat-value" min="0" value="0"></div>`;
            statEntryList.appendChild(item);
        });
    };

    const openPlayerModal = (playerId) => {
        const roster = getRoster(); const stats = getStats(); const player = roster.find(p => p.id === playerId); if (!player) return;
        const playerStats = stats[playerId] || { goals: 0, assists: 0, saves: 0, dribbles: 0 };
        const points = calculatePoints(playerId, stats);
        const modalContent = document.getElementById('modal-content'); const statsArray = [playerStats.goals, playerStats.assists, playerStats.saves, playerStats.dribbles];
        const maxStat = Math.max(...statsArray, 1);
        modalContent.innerHTML = `
            <div class="modal-header"><h3>${player.name}</h3><p>${points.toFixed(1)} Pontos</p></div>
            <div class="stat-graph">
                <div class="bar-container"><div class="stat-bar" style="height:${(playerStats.goals/maxStat)*100}%; background-color:#f43f5e;" title="${playerStats.goals} Gols">${playerStats.goals}</div><div class="bar-label">Gols</div></div>
                <div class="bar-container"><div class="stat-bar" style="height:${(playerStats.assists/maxStat)*100}%; background-color:#3b82f6;" title="${playerStats.assists} Assist.">${playerStats.assists}</div><div class="bar-label">Assist.</div></div>
                <div class="bar-container"><div class="stat-bar" style="height:${(playerStats.saves/maxStat)*100}%; background-color:#10b981;" title="${playerStats.saves} Salvos">${playerStats.saves}</div><div class="bar-label">Salvos</div></div>
                <div class="bar-container"><div class="stat-bar" style="height:${(playerStats.dribbles/maxStat)*100}%; background-color:#f59e0b;" title="${playerStats.dribbles} Dribles">${playerStats.dribbles}</div><div class="bar-label">Dribles</div></div>
            </div>`;
        document.getElementById('player-modal').classList.add('visible');
    };

    // === 3. MANIPULADORES DE EVENTOS ===
    document.getElementById('admin-toggle-button').addEventListener('click', () => { document.getElementById('admin-panel').classList.toggle('visible'); });
    
    document.querySelector('.admin-tabs').addEventListener('click', e => {
        if (e.target.matches('.tab-button')) {
            document.querySelectorAll('.tab-button').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            e.target.classList.add('active'); document.getElementById(e.target.dataset.tab).classList.add('active');
        }
    });

    document.getElementById('add-player-form').addEventListener('submit', e => {
        e.preventDefault(); const input = document.getElementById('new-player-name'); const newName = input.value.trim();
        if (newName) { const roster = getRoster(); roster.push({ id: Date.now().toString(), name: newName }); saveRoster(roster); renderAll(); input.value = ''; }
    });
    
    // --- LÓGICA DE AÇÕES NO ELENCO (ATUALIZADA) ---
    document.getElementById('admin-roster-list').addEventListener('click', e => {
        const roster = getRoster(); const stats = getStats(); const id = e.target.dataset.id;
        
        // Excluir Jogador
        if (e.target.matches('.btn-danger')) {
            if (confirm('Tem certeza? Isso removerá o jogador e todas as suas estatísticas permanentemente.')) {
                saveRoster(roster.filter(p => p.id !== id));
                delete stats[id]; saveStats(stats); renderAll();
            }
        }
        // Editar Nome
        if (e.target.matches('.btn:not(.btn-danger):not(.btn-warning)')) { // Editar
            const player = roster.find(p => p.id === id);
            const newName = prompt('Digite o novo nome para:', player.name);
            if (newName && newName.trim()) { player.name = newName.trim(); saveRoster(roster); renderAll(); }
        }
        // --- NOVA LÓGICA PARA RESETAR STATS ---
        if (e.target.matches('.btn-warning')) {
            if (confirm('Tem certeza que deseja resetar as estatísticas deste jogador? (Gols, assistências, etc. voltarão para 0).')) {
                if(stats[id]) { // Se o jogador tiver stats, reseta eles
                    stats[id] = { goals: 0, assists: 0, saves: 0, dribbles: 0 };
                    saveStats(stats);
                }
                renderAll(); // Atualiza a tela
                alert('Estatísticas do jogador resetadas com sucesso!');
            }
        }
    });

    document.getElementById('stat-entry-list').addEventListener('click', e => { if (e.target.matches('.add-stat')) { const input = e.target.nextElementSibling; input.value = parseInt(input.value) + 1; }});

    document.getElementById('save-stats-button').addEventListener('click', () => {
        const currentStats = getStats();
        document.querySelectorAll('.stat-entry-item').forEach(item => {
            const playerId = item.dataset.playerId;
            const inputs = item.querySelectorAll('.stat-value');
            if (!currentStats[playerId]) currentStats[playerId] = { goals: 0, assists: 0, saves: 0, dribbles: 0 };
            currentStats[playerId].goals += parseInt(inputs[0].value) || 0;
            currentStats[playerId].assists += parseInt(inputs[1].value) || 0;
            currentStats[playerId].saves += parseInt(inputs[2].value) || 0;
            currentStats[playerId].dribbles += parseInt(inputs[3].value) || 0;
        });
        saveStats(currentStats); renderAll();
        alert('Estatísticas da sessão salvas com sucesso!');
    });
    
    document.getElementById('leaderboard-list').addEventListener('click', e => { const playerItem = e.target.closest('.leaderboard-item'); if (playerItem) openPlayerModal(playerItem.dataset.playerId); });
    document.getElementById('player-modal').addEventListener('click', e => { if (e.target === e.currentTarget || e.target.matches('#modal-close-button')) e.currentTarget.classList.remove('visible'); });

    document.getElementById('reset-all-data').addEventListener('click', () => {
        if (confirm('PERIGO! ISSO APAGARÁ TODO O ELENCO E TODAS AS ESTATÍSTICAS PARA SEMPRE. TEM CERTEZA?')) {
            localStorage.removeItem(STORAGE_KEYS.roster);
            localStorage.removeItem(STORAGE_KEYS.stats);
            renderAll();
        }
    });
    
    // === 4. CARGA INICIAL ===
    renderAll();
});
