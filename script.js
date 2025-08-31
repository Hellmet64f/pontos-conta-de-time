document.addEventListener('DOMContentLoaded', () => {
    
    // ===================================================================
    // 1. CONFIGURAÇÕES GLOBAIS E FUNÇÕES DE DADOS
    // ===================================================================
    const QUALIFICATION_AVERAGE = 4.5;
    const getPlayers = () => JSON.parse(localStorage.getItem('tcsPlayers')) || [];
    const savePlayers = (players) => localStorage.setItem('tcsPlayers', JSON.stringify(players));
    const getMatches = () => JSON.parse(localStorage.getItem('tcsMatches')) || [];
    const saveMatches = (matches) => localStorage.setItem('tcsMatches', JSON.stringify(matches));
    
    const calculatePoints = (player) => {
        let points = (player.goals * 3) + (player.saves * 2);
        points += Math.floor(player.assists / 7);
        points += Math.floor(player.dribbles / 5);
        return points;
    };

    const toast = document.getElementById('toast-notification');
    const showToast = (message) => {
        toast.textContent = message;
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 3000);
    };

    // ===================================================================
    // 2. IDENTIFICAÇÃO E LÓGICA DA PÁGINA ATUAL
    // ===================================================================
    const pageRankingBody = document.getElementById('player-ranking-body');
    const pageHistoryContainer = document.getElementById('match-history-container');
    const pageAdminForm = document.getElementById('add-player-form');

    // LÓGICA: PÁGINA DE CLASSIFICAÇÃO
    if (pageRankingBody) {
        const players = getPlayers();
        if (players.length === 0) {
            pageRankingBody.innerHTML = `<tr><td colspan="3" class="empty-message">Nenhum jogador cadastrado. Adicione na página de Admin.</td></tr>`;
        } else {
            players.sort((a, b) => calculatePoints(b) - calculatePoints(a)); // Ordena por pontos
            players.forEach(player => {
                const totalPoints = calculatePoints(player);
                const status = totalPoints >= QUALIFICATION_AVERAGE ? 'Qualificado' : 'Não Qualificado';
                const statusClass = totalPoints >= QUALIFICATION_AVERAGE ? 'status-qualified' : 'status-not-qualified';
                pageRankingBody.insertRow().innerHTML = `<td>${player.name}</td><td>${totalPoints.toFixed(1)}</td><td class="${statusClass}">${status}</td>`;
            });
        }
    }

    // LÓGICA: PÁGINA DE HISTÓRICO
    if (pageHistoryContainer) {
        const matches = getMatches();
        const historyContent = pageHistoryContainer.querySelector('h2'); // Preserva o título
        pageHistoryContainer.innerHTML = '';
        pageHistoryContainer.appendChild(historyContent);

        if (matches.length === 0) {
            pageHistoryContainer.innerHTML += `<p class="empty-message">Nenhum jogo registrado. Adicione na página de Admin.</p>`;
        } else {
            matches.slice().reverse().forEach(match => {
                const performancesHTML = match.stats
                    .filter(s => s.goals > 0 || s.assists > 0 || s.saves > 0 || s.dribbles > 0)
                    .map(stat => `<li><strong>${stat.name}</strong> (G: ${stat.goals}, A: ${stat.assists}, S: ${stat.saves}, D: ${stat.dribbles})</li>`).join('');
                
                pageHistoryContainer.innerHTML += `
                    <div class="match-card">
                        <h3>vs ${match.opponent}</h3><p>Resultado: ${match.result}</p>
                        ${performancesHTML ? `<div class="player-performance"><ul>${performancesHTML}</ul></div>` : ''}
                    </div>`;
            });
        }
    }

    // LÓGICA: PÁGINA DE ADMIN
    if (pageAdminForm) {
        const tabButtons = document.querySelectorAll('.tab-button');
        const tabContents = document.querySelectorAll('.tab-content');
        tabButtons.forEach(button => button.addEventListener('click', () => {
            tabButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            tabContents.forEach(content => content.classList.toggle('active', content.id === `${button.dataset.tab}-content`));
        }));

        const adminPlayerListBody = document.getElementById('admin-player-list-body');
        const playerStatsForMatchDiv = document.getElementById('player-stats-for-match');
        const adminMatchListBody = document.getElementById('admin-match-list-body');

        const renderAdminPlayers = () => { /* ... */ };
        const renderAdminMatches = () => { /* ... */ };
        const populateMatchForm = () => { /* ... */ };

        renderAdminPlayers = () => {
            const players = getPlayers();
            adminPlayerListBody.innerHTML = '';
            if (players.length === 0) {
                adminPlayerListBody.innerHTML = `<tr><td colspan="6" class="empty-message">Nenhum jogador.</td></tr>`;
            } else {
                players.forEach((p, i) => adminPlayerListBody.insertRow().innerHTML = `<td>${p.name}</td><td>${p.goals}</td><td>${p.assists}</td><td>${p.saves}</td><td>${p.dribbles}</td><td><button class="btn-remove" data-type="player" data-index="${i}">X</button></td>`);
            }
        };

        renderAdminMatches = () => {
            const matches = getMatches();
            adminMatchListBody.innerHTML = '';
            if (matches.length === 0) {
                adminMatchListBody.innerHTML = `<tr><td colspan="3" class="empty-message">Nenhum jogo.</td></tr>`;
            } else {
                matches.forEach((m, i) => adminMatchListBody.insertRow().innerHTML = `<td>${m.opponent}</td><td>${m.result}</td><td><button class="btn-remove" data-type="match" data-index="${i}">X</button></td>`);
            }
        };
        
        populateMatchForm = () => {
            const players = getPlayers();
            playerStatsForMatchDiv.innerHTML = '';
            if (players.length === 0) {
                playerStatsForMatchDiv.innerHTML = `<p class="empty-message">Adicione jogadores na aba "Jogadores" primeiro.</p>`;
            } else {
                players.forEach(p => playerStatsForMatchDiv.innerHTML += `<div class="player-stat-input"><h4>${p.name}</h4><input type="hidden" value="${p.name}"><label>Gols:</label><input type="number" class="match-goals" value="0" min="0"><label>Assist.:</label><input type="number" class="match-assists" value="0" min="0"><label>Salvos:</label><input type="number" class="match-saves" value="0" min="0"><label>Dribles:</label><input type="number" class="match-dribbles" value="0" min="0"></div>`);
            }
        };

        pageAdminForm.addEventListener('submit', e => {
            e.preventDefault();
            const playerName = document.getElementById('player-name').value.trim();
            const players = getPlayers();
            const existingPlayerIndex = players.findIndex(p => p.name.toLowerCase() === playerName.toLowerCase());
            const playerData = { name: playerName, goals: parseInt(document.getElementById('goals').value) || 0, assists: parseInt(document.getElementById('assists').value) || 0, saves: parseInt(document.getElementById('saves').value) || 0, dribbles: parseInt(document.getElementById('dribbles').value) || 0 };
            
            if (existingPlayerIndex > -1) players[existingPlayerIndex] = playerData;
            else players.push(playerData);

            savePlayers(players);
            renderAdminPlayers();
            populateMatchForm();
            pageAdminForm.reset();
            showToast('Jogador salvo com sucesso!');
        });

        document.getElementById('add-match-form').addEventListener('submit', e => {
            e.preventDefault();
            const playerStats = Array.from(playerStatsForMatchDiv.querySelectorAll('.player-stat-input')).map(div => ({ name: div.querySelector('input[type="hidden"]').value, goals: parseInt(div.querySelector('.match-goals').value) || 0, assists: parseInt(div.querySelector('.match-assists').value) || 0, saves: parseInt(div.querySelector('.match-saves').value) || 0, dribbles: parseInt(div.querySelector('.match-dribbles').value) || 0 }));
            const newMatch = { opponent: document.getElementById('opponent-name').value, result: document.getElementById('match-result').value, stats: playerStats };
            saveMatches([...getMatches(), newMatch]);
            renderAdminMatches();
            e.target.reset();
            populateMatchForm();
            showToast('Jogo salvo com sucesso!');
        });

        document.querySelector('.container').addEventListener('click', e => {
            if (e.target.matches('.btn-remove')) {
                const type = e.target.dataset.type;
                const index = parseInt(e.target.dataset.index);
                if (type === 'player') {
                    const players = getPlayers(); players.splice(index, 1); savePlayers(players);
                    renderAdminPlayers(); populateMatchForm();
                } else if (type === 'match') {
                    const matches = getMatches(); matches.splice(index, 1); saveMatches(matches);
                    renderAdminMatches();
                }
            }
        });

        renderAdminPlayers();
        renderAdminMatches();
        populateMatchForm();
    }
});
