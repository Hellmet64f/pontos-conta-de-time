document.addEventListener('DOMContentLoaded', () => {
    
    // CONSTANTES
    const QUALIFICATION_AVERAGE = 4.5;
    const isAdminPage = document.getElementById('add-player-form');
    const isMainPage = document.querySelector('main .tab-navigation');

    // FUNÇÕES DE DADOS (JOGADORES)
    const getPlayers = () => JSON.parse(localStorage.getItem('tcsPlayers')) || [];
    const savePlayers = (players) => localStorage.setItem('tcsPlayers', JSON.stringify(players));

    // FUNÇÕES DE DADOS (JOGOS)
    const getMatches = () => JSON.parse(localStorage.getItem('tcsMatches')) || [];
    const saveMatches = (matches) => localStorage.setItem('tcsMatches', JSON.stringify(matches));

    // FUNÇÃO DE CÁLCULO DE PONTOS
    const calculatePoints = (player) => {
        let points = (player.goals * 3) + (player.saves * 2);
        points += Math.floor(player.assists / 7);
        points += Math.floor(player.dribbles / 5);
        return points;
    };

    // LÓGICA COMPARTILHADA DE ABAS (para ambas as páginas)
    if (isMainPage || isAdminPage) {
        const tabButtons = document.querySelectorAll('.tab-button');
        const tabContents = document.querySelectorAll('.tab-content');

        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const targetTab = button.getAttribute('data-tab');
                
                tabButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');

                tabContents.forEach(content => {
                    content.classList.remove('active');
                    if (content.id === `${targetTab}-content`) {
                        content.classList.add('active');
                    }
                });
            });
        });
    }

    // LÓGICA DA PÁGINA DE ADMIN
    if (isAdminPage) {
        const playerForm = document.getElementById('add-player-form');
        const adminPlayerList = document.getElementById('admin-player-list').getElementsByTagName('tbody')[0];
        const matchForm = document.getElementById('add-match-form');
        const playerStatsForMatchDiv = document.getElementById('player-stats-for-match');
        const adminMatchList = document.getElementById('admin-match-list').getElementsByTagName('tbody')[0];

        const renderAdminPlayerList = () => {
            adminPlayerList.innerHTML = '';
            getPlayers().forEach((player, index) => {
                const row = adminPlayerList.insertRow();
                row.innerHTML = `
                    <td>${player.name}</td>
                    <td>${player.goals}</td>
                    <td>${player.assists}</td>
                    <td>${player.saves}</td>
                    <td>${player.dribbles}</td>
                    <td><button class="btn-remove" data-type="player" data-index="${index}">Remover</button></td>
                `;
            });
        };
        
        const populateMatchForm = () => {
            playerStatsForMatchDiv.innerHTML = '';
            const players = getPlayers();
            if (players.length === 0) {
                 playerStatsForMatchDiv.innerHTML = "<p>Adicione jogadores na aba 'Jogadores' primeiro.</p>";
                 return;
            }
            players.forEach((player) => {
                playerStatsForMatchDiv.innerHTML += `
                    <div class="player-stat-input">
                        <h4>${player.name}</h4>
                        <input type="hidden" class="player-name-hidden" value="${player.name}">
                        <label>Gols:</label><input type="number" class="player-goals" value="0" min="0">
                        <label>Assist.:</label><input type="number" class="player-assists" value="0" min="0">
                        <label>Salvos:</label><input type="number" class="player-saves" value="0" min="0">
                        <label>Dribles:</label><input type="number" class="player-dribbles" value="0" min="0">
                    </div>`;
            });
        };

        const renderAdminMatchList = () => {
            adminMatchList.innerHTML = '';
            getMatches().forEach((match, index) => {
                const row = adminMatchList.insertRow();
                row.innerHTML = `
                    <td>${match.opponent}</td>
                    <td>${match.result}</td>
                    <td><button class="btn-remove" data-type="match" data-index="${index}">Remover</button></td>
                `;
            });
        };

        playerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const playerName = document.getElementById('player-name').value;
            const players = getPlayers();
            const existingPlayerIndex = players.findIndex(p => p.name.toLowerCase() === playerName.toLowerCase());
            
            const playerData = {
                name: playerName,
                goals: parseInt(document.getElementById('goals').value),
                assists: parseInt(document.getElementById('assists').value),
                saves: parseInt(document.getElementById('saves').value),
                dribbles: parseInt(document.getElementById('dribbles').value),
            };

            if (existingPlayerIndex > -1) {
                players[existingPlayerIndex] = playerData;
            } else {
                players.push(playerData);
            }
            
            savePlayers(players);
            renderAdminPlayerList();
            populateMatchForm();
            playerForm.reset();
        });
        
        matchForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const playerStatInputs = playerStatsForMatchDiv.querySelectorAll('.player-stat-input');
            const playerStats = [];
            
            playerStatInputs.forEach(inputDiv => {
                playerStats.push({
                    name: inputDiv.querySelector('.player-name-hidden').value,
                    goals: parseInt(inputDiv.querySelector('.player-goals').value),
                    assists: parseInt(inputDiv.querySelector('.player-assists').value),
                    saves: parseInt(inputDiv.querySelector('.player-saves').value),
                    dribbles: parseInt(inputDiv.querySelector('.player-dribbles').value),
                });
            });

            const newMatch = {
                opponent: document.getElementById('opponent-name').value,
                result: document.getElementById('match-result').value,
                stats: playerStats,
            };

            const matches = getMatches();
            matches.push(newMatch);
            saveMatches(matches);
            renderAdminMatchList();
            matchForm.reset();
            populateMatchForm();
        });

        document.querySelector('.container').addEventListener('click', (e) => {
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

        renderAdminPlayerList();
        populateMatchForm();
        renderAdminMatchList();
    }

    // LÓGICA DA PÁGINA PRINCIPAL
    if (isMainPage && !isAdminPage) { // Garante que só rode na página principal
        const playerRankingBody = document.getElementById('player-ranking').getElementsByTagName('tbody')[0];
        const matchHistoryDiv = document.getElementById('match-history');
        
        const renderRanking = () => {
            playerRankingBody.innerHTML = '';
            getPlayers().forEach(player => {
                const totalPoints = calculatePoints(player);
                const status = totalPoints >= QUALIFICATION_AVERAGE ? 'Qualificado' : 'Não Qualificado';
                const statusClass = totalPoints >= QUALIFICATION_AVERAGE ? 'status-qualified' : 'status-not-qualified';

                const row = playerRankingBody.insertRow();
                row.innerHTML = `
                    <td>${player.name}</td>
                    <td>${totalPoints.toFixed(1)}</td>
                    <td class="${statusClass}">${status}</td>
                `;
            });
        };

        const renderMatchHistory = () => {
            matchHistoryDiv.innerHTML = '';
            const matches = getMatches();
            if (matches.length === 0) {
                matchHistoryDiv.innerHTML = '<p>Nenhum jogo foi registrado ainda.</p>';
                return;
            }

            matches.reverse().forEach(match => {
                let performancesHTML = '';
                match.stats.filter(s => s.goals > 0 || s.assists > 0 || s.saves > 0 || s.dribbles > 0)
                    .forEach(stat => {
                        performancesHTML += `<li>${stat.name} (G: ${stat.goals}, A: ${stat.assists}, S: ${stat.saves}, D: ${stat.dribbles})</li>`;
                });

                if (performancesHTML) {
                    performancesHTML = `<div class="player-performance"><ul>${performancesHTML}</ul></div>`;
                } else {
                    performancesHTML = `<div class="player-performance"><p>Nenhuma estatística de destaque registrada.</p></div>`;
                }

                matchHistoryDiv.innerHTML += `
                    <div class="match-card">
                        <h3>vs ${match.opponent}</h3>
                        <p>Resultado: ${match.result}</p>
                        ${performancesHTML}
                    </div>
                `;
            });
        };
        
        renderRanking();
        renderMatchHistory();
    }
});
