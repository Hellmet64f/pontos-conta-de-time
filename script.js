document.addEventListener('DOMContentLoaded', () => {
    
    // ===================================================================
    // 1. FUNÇÕES GLOBAIS E DE DADOS
    // ===================================================================
    const QUALIFICATION_AVERAGE = 4.5;
    const getPlayers = () => JSON.parse(localStorage.getItem('tcsPlayersV2')) || [];
    const savePlayers = (players) => localStorage.setItem('tcsPlayersV2', JSON.stringify(players));
    const getMatches = () => JSON.parse(localStorage.getItem('tcsMatchesV2')) || [];
    const saveMatches = (matches) => localStorage.setItem('tcsMatchesV2', JSON.stringify(matches));
    
    const calculatePoints = (player) => (player.goals*3)+(player.saves*2)+Math.floor(player.assists/7)+Math.floor(player.dribbles/5);

    const toast = document.getElementById('toast-notification');
    const showToast = (message, type = 'success') => {
        if (!toast) return;
        toast.textContent = message;
        toast.className = `toast ${type} show`;
        setTimeout(() => toast.classList.remove('show'), 3000);
    };

    // ===================================================================
    // 2. LÓGICA DAS PÁGINAS PÚBLICAS
    // ===================================================================
    const pageRankingBody = document.getElementById('player-ranking-body');
    const pageHistoryContent = document.getElementById('match-list-content');
    
    if (pageRankingBody) {
        const players = getPlayers();
        if (players.length === 0) {
            pageRankingBody.innerHTML = `<tr><td colspan="4" class="empty-message">Nenhum jogador cadastrado.</td></tr>`;
        } else {
            players.sort((a, b) => calculatePoints(b) - calculatePoints(a));
            players.forEach((player, index) => {
                const totalPoints = calculatePoints(player);
                const status = totalPoints >= QUALIFICATION_AVERAGE ? 'Qualificado' : 'Não Qualificado';
                const statusClass = status === 'Qualificado' ? 'status-qualified' : 'status-not-qualified';
                pageRankingBody.insertRow().innerHTML = `<td>${index + 1}º</td><td>${player.name}</td><td>${totalPoints.toFixed(1)}</td><td class="${statusClass}">${status}</td>`;
            });
        }
    }

    if (pageHistoryContent) {
        const matches = getMatches();
        pageHistoryContent.innerHTML = ''; // Limpeza primeiro
        if (matches.length === 0) {
            pageHistoryContent.innerHTML = `<p class="empty-message">Nenhum jogo registrado.</p>`;
        } else {
            matches.slice().reverse().forEach(match => {
                const performancesHTML = match.stats
                    .filter(s => s.goals > 0 || s.assists > 0 || s.saves > 0 || s.dribbles > 0)
                    .map(stat => `<li><strong>${stat.name}</strong> (G:${stat.goals}, A:${stat.assists}, S:${stat.saves}, D:${stat.dribbles})</li>`).join('');
                pageHistoryContent.innerHTML += `<div class="match-card"><h3>vs ${match.opponent}</h3><p>Resultado: ${match.result}</p>${performancesHTML ? `<div class="player-performance"><ul>${performancesHTML}</ul></div>` : ''}</div>`;
            });
        }
    }

    // ===================================================================
    // 3. LÓGICA DA PÁGINA DE ADMIN
    // ===================================================================
    const pageAdminContainer = document.getElementById('add-player-form');
    if (pageAdminContainer) {
        const adminPlayerListBody = document.getElementById('admin-player-list-body');
        const adminMatchListBody = document.getElementById('admin-match-list-body');
        const playerStatsForMatchDiv = document.getElementById('player-stats-for-match');

        const renderAdminUI = () => {
            // Renderiza ambas as listas do admin
            const players = getPlayers();
            adminPlayerListBody.innerHTML = '';
            if (players.length === 0) adminPlayerListBody.innerHTML = `<tr><td colspan="6" class="empty-message">Nenhum jogador.</td></tr>`;
            else players.forEach((p, i) => adminPlayerListBody.insertRow().innerHTML = `<td>${p.name}</td><td>${p.goals}</td><td>${p.assists}</td><td>${p.saves}</td><td>${p.dribbles}</td><td><button class="btn-remove" data-type="player" data-index="${i}">X</button></td>`);
            
            const matches = getMatches();
            adminMatchListBody.innerHTML = '';
            if (matches.length === 0) adminMatchListBody.innerHTML = `<tr><td colspan="3" class="empty-message">Nenhum jogo.</td></tr>`;
            else matches.forEach((m, i) => adminMatchListBody.insertRow().innerHTML = `<td>${m.opponent}</td><td>${m.result}</td><td><button class="btn-remove" data-type="match" data-index="${i}">X</button></td>`);
            
            // Preenche o formulário de jogos
            playerStatsForMatchDiv.innerHTML = '';
            if (players.length === 0) playerStatsForMatchDiv.innerHTML = `<p class="empty-message">Adicione jogadores primeiro.</p>`;
            else players.forEach(p => playerStatsForMatchDiv.innerHTML += `<div><h4>${p.name}</h4><input type="hidden" value="${p.name}"><label>G:</label><input type="number" class="match-stat" value="0" min="0"><label>A:</label><input type="number" class="match-stat" value="0" min="0"><label>S:</label><input type="number" class="match-stat" value="0" min="0"><label>D:</label><input type="number" class="match-stat" value="0" min="0"></div>`);
        };

        // EVENTOS
        document.querySelector('.tab-navigation').addEventListener('click', e => {
            if (e.target.matches('.tab-button')) {
                document.querySelectorAll('.tab-button').forEach(b => b.classList.remove('active'));
                document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
                e.target.classList.add('active');
                document.getElementById(`${e.target.dataset.tab}-content`).classList.add('active');
            }
        });

        document.getElementById('add-player-form').addEventListener('submit', e => {
            e.preventDefault();
            const form = e.target;
            const playerName = form.querySelector('#player-name').value.trim();
            const players = getPlayers();
            const existingIdx = players.findIndex(p => p.name.toLowerCase() === playerName.toLowerCase());
            const playerData = { name: playerName, goals: parseInt(form.querySelector('#goals').value) || 0, assists: parseInt(form.querySelector('#assists').value) || 0, saves: parseInt(form.querySelector('#saves').value) || 0, dribbles: parseInt(form.querySelector('#dribbles').value) || 0 };
            
            if (existingIdx > -1) players[existingIdx] = playerData; else players.push(playerData);
            savePlayers(players);
            renderAdminUI();
            form.reset();
            showToast('Jogador salvo com sucesso!', 'success');
        });
        
        document.getElementById('add-match-form').addEventListener('submit', e => {
            e.preventDefault();
            const form = e.target;
            const statsDivs = form.querySelectorAll('#player-stats-for-match > div');
            const playerStats = Array.from(statsDivs).map(div => {
                const inputs = div.querySelectorAll('.match-stat');
                return { name: div.querySelector('input[type=hidden]').value, goals: parseInt(inputs[0].value) || 0, assists: parseInt(inputs[1].value) || 0, saves: parseInt(inputs[2].value) || 0, dribbles: parseInt(inputs[3].value) || 0 };
            });
            const newMatch = { opponent: form.querySelector('#opponent-name').value, result: form.querySelector('#match-result').value, stats: playerStats };
            saveMatches([...getMatches(), newMatch]);
            renderAdminUI();
            form.reset();
            showToast('Jogo salvo com sucesso!', 'success');
        });
        
        document.getElementById('admin-player-list-body').addEventListener('click', handleRemove);
        document.getElementById('admin-match-list-body').addEventListener('click', handleRemove);
        
        function handleRemove(e) {
            if (e.target.matches('.btn-remove')) {
                const { type, index } = e.target.dataset;
                if (confirm(`Tem certeza que deseja remover?`)) {
                    if (type === 'player') { let data = getPlayers(); data.splice(index, 1); savePlayers(data); } 
                    else { let data = getMatches(); data.splice(index, 1); saveMatches(data); }
                    renderAdminUI();
                    showToast('Item removido.', 'danger');
                }
            }
        }
        
        document.getElementById('reset-data-button').addEventListener('click', () => {
            if(confirm("ATENÇÃO! ISSO APAGARÁ TODOS OS JOGADORES E JOGOS. Deseja continuar?")) {
                localStorage.removeItem('tcsPlayersV2');
                localStorage.removeItem('tcsMatchesV2');
                renderAdminUI();
                showToast('Todos os dados foram resetados.', 'danger');
            }
        });
        
        // Carga inicial da UI do Admin
        renderAdminUI();
    }
});
