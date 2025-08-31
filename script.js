document.addEventListener('DOMContentLoaded', () => {
    
    // CONSTANTES E FUNÇÕES GERAIS
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

    // IDENTIFICADORES DE PÁGINA
    const pageRanking = document.getElementById('player-ranking');
    const pageHistory = document.getElementById('match-history');
    const pageAdmin = document.getElementById('add-player-form');

    // PÁGINA PRINCIPAL (INDEX.HTML)
    if (pageRanking && !pageAdmin) {
        const playerRankingBody = pageRanking.getElementsByTagName('tbody')[0];
        const renderRanking = () => {
            playerRankingBody.innerHTML = '';
            getPlayers().forEach(player => {
                const totalPoints = calculatePoints(player);
                const status = totalPoints >= QUALIFICATION_AVERAGE ? 'Qualificado' : 'Não Qualificado';
                const statusClass = totalPoints >= QUALIFICATION_AVERAGE ? 'status-qualified' : 'status-not-qualified';
                const row = playerRankingBody.insertRow();
                row.innerHTML = `<td>${player.name}</td><td>${totalPoints.toFixed(1)}</td><td class="${statusClass}">${status}</td>`;
            });
        };
        renderRanking();
    }

    // PÁGINA DE HISTÓRICO (JOGOS.HTML)
    if (pageHistory && !pageAdmin) {
        const renderMatchHistory = () => {
            pageHistory.innerHTML = '';
            const matches = getMatches();
            if (matches.length === 0) {
                pageHistory.innerHTML = '<p>Nenhum jogo foi registrado ainda. Vá para a página de Admin para adicionar.</p>';
                return;
            }
            matches.slice().reverse().forEach(match => { // .slice() para não alterar o array original
                let performancesHTML = match.stats
                    .filter(s => s.goals > 0 || s.assists > 0 || s.saves > 0 || s.dribbles > 0)
                    .map(stat => `<li>${stat.name} (G: ${stat.goals}, A: ${stat.assists}, S: ${stat.saves}, D: ${stat.dribbles})</li>`)
                    .join('');
                
                if (performancesHTML) {
                    performancesHTML = `<div class="player-performance"><ul>${performancesHTML}</ul></div>`;
                } else {
                    performancesHTML = `<div class="player-performance"><p>Nenhuma estatística de destaque registrada.</p></div>`;
                }
                pageHistory.innerHTML += `<div class="match-card"><h3>vs ${match.opponent}</h3><p>Resultado: ${match.result}</p>${performancesHTML}</div>`;
            });
        };
        renderMatchHistory();
    }

    // PÁGINA DE ADMIN (ADMIN.HTML)
    if (pageAdmin) {
        // Lógica das abas do Admin
        const tabButtons = document.querySelectorAll('.tab-button');
        const tabContents = document.querySelectorAll('.tab-content');
        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const targetTab = button.getAttribute('data-tab');
                tabButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                tabContents.forEach(content => content.id === `${targetTab}-content` ? content.classList.add('active') : content.classList.remove('active'));
            });
        });

        // Referências a elementos do Admin
        const playerForm = document.getElementById('add-player-form');
        const adminPlayerList = document.getElementById('admin-player-list').getElementsByTagName('tbody')[0];
        const matchForm = document.getElementById('add-match-form');
        const playerStatsForMatchDiv = document.getElementById('player-stats-for-match');
        const adminMatchList = document.getElementById('admin-match-list').getElementsByTagName('tbody')[0];

        // Funções de renderização do Admin
        const renderAdminPlayerList = () => { /* ... (código abaixo) ... */ };
        const populateMatchForm = () => { /* ... (código abaixo) ... */ };
        const renderAdminMatchList = () => { /* ... (código abaixo) ... */ };
        
        // ... (Implementação das funções e eventos do admin aqui)
        renderAdminPlayerList = () => {
            adminPlayerList.innerHTML = '';
            getPlayers().forEach((p, i) => {
                adminPlayerList.insertRow().innerHTML = `<td>${p.name}</td><td>${p.goals}</td><td>${p.assists}</td><td>${p.saves}</td><td>${p.dribbles}</td><td><button class="btn-remove" data-type="player" data-index="${i}">Remover</button></td>`;
            });
        };

        populateMatchForm = () => {
            playerStatsForMatchDiv.innerHTML = '';
            const players = getPlayers();
            if (players.length === 0) {
                playerStatsForMatchDiv.innerHTML = "<p>Adicione jogadores na aba 'Jogadores' primeiro.</p>";
                return;
            }
            players.forEach(p => {
                playerStatsForMatchDiv.innerHTML += `<div class="player-stat-input"><h4>${p.name}</h4><input type="hidden" class="player-name-hidden" value="${p.name}"><label>Gols:</label><input type="number" class="player-goals" value="0" min="0"><label>Assist.:</label><input type="number" class="player-assists" value="0" min="0"><label>Salvos:</label><input type="number" class="player-saves" value="0" min="0"><label>Dribles:</label><input type="number" class="player-dribbles" value="0" min="0"></div>`;
            });
        };

        renderAdminMatchList = () => {
            adminMatchList.innerHTML = '';
            getMatches().forEach((m, i) => {
                adminMatchList.insertRow().innerHTML = `<td>${m.opponent}</td><td>${m.result}</td><td><button class="btn-remove" data-type="match" data-index="${i}">Remover</button></td>`;
            });
        };

        // Event Listeners
        playerForm.addEventListener('submit', e => {
            e.preventDefault();
            const playerName = document.getElementById('player-name').value;
            let players = getPlayers();
            const existingPlayerIndex = players.findIndex(p => p.name.toLowerCase() === playerName.toLowerCase());
            const playerData = { name: playerName, goals: parseInt(document.getElementById('goals').value), assists: parseInt(document.getElementById('assists').value), saves: parseInt(document.getElementById('saves').value), dribbles: parseInt(document.getElementById('dribbles').value) };
            if (existingPlayerIndex > -1) players[existingPlayerIndex] = playerData;
            else players.push(playerData);
            savePlayers(players);
            renderAdminPlayerList();
            populateMatchForm();
            playerForm.reset();
        });

        matchForm.addEventListener('submit', e => {
            e.preventDefault();
            const playerStats = Array.from(playerStatsForMatchDiv.querySelectorAll('.player-stat-input')).map(div => ({ name: div.querySelector('.player-name-hidden').value, goals: parseInt(div.querySelector('.player-goals').value), assists: parseInt(div.querySelector('.player-assists').value), saves: parseInt(div.querySelector('.player-saves').value), dribbles: parseInt(div.querySelector('.player-dribbles').value) }));
            const newMatch = { opponent: document.getElementById('opponent-name').value, result: document.getElementById('match-result').value, stats: playerStats };
            let matches = getMatches();
            matches.push(newMatch);
            saveMatches(matches);
            renderAdminMatchList();
            matchForm.reset();
            populateMatchForm();
        });

        document.querySelector('.container').addEventListener('click', e => {
            if (e.target.classList.contains('btn-remove')) {
                const type = e.target.getAttribute('data-type');
                const index = parseInt(e.target.getAttribute('data-index'));
                if (type === 'player') {
                    let players = getPlayers();
                    players.splice(index, 1);
                    savePlayers(players);
                    renderAdminPlayerList();
                    populateMatchForm();
                } else if (type === 'match') {
                    let matches = getMatches();
                    matches.splice(index, 1);
                    saveMatches(matches);
                    renderAdminMatchList();
                }
            }
        });

        // Carga inicial do Admin
        renderAdminPlayerList();
        populateMatchForm();
        renderAdminMatchList();
    }
});
