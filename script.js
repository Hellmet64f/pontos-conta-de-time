// Aguarda o DOM estar completamente carregado antes de executar o script
document.addEventListener('DOMContentLoaded', () => {
    
    // Identifica qual página está ativa (admin.html ou index.html)
    const isAdminPage = document.getElementById('add-player-form');
    const isMainPage = document.getElementById('player-ranking');

    // Função para buscar jogadores do localStorage
    const getPlayers = () => {
        const players = localStorage.getItem('tcsPlayers');
        return players ? JSON.parse(players) : [];
    };

    // Função para salvar jogadores no localStorage
    const savePlayers = (players) => {
        localStorage.setItem('tcsPlayers', JSON.stringify(players));
    };

    // Função para calcular os pontos de um jogador
    const calculatePoints = (player) => {
        // Pontuação: 1 gol = 3 pontos, 1 salvo = 2 pontos
        let points = (player.goals * 3) + (player.saves * 2);
        
        // A cada 7 assistências = 1 ponto
        points += Math.floor(player.assists / 7);

        // A cada 5 dribles = 1 ponto
        points += Math.floor(player.dribbles / 5);

        return points;
    };

    // LÓGICA DA PÁGINA DE ADMIN
    if (isAdminPage) {
        const form = document.getElementById('add-player-form');
        const adminPlayerList = document.getElementById('admin-player-list').getElementsByTagName('tbody')[0];

        // Função para renderizar a lista de jogadores na página de admin
        const renderAdminList = () => {
            adminPlayerList.innerHTML = '';
            const players = getPlayers();
            players.forEach((player, index) => {
                const row = adminPlayerList.insertRow();
                row.innerHTML = `
                    <td>${player.name}</td>
                    <td>${player.goals}</td>
                    <td>${player.assists}</td>
                    <td>${player.saves}</td>
                    <td>${player.dribbles}</td>
                    <td><button class="btn-remove" data-index="${index}">Remover</button></td>
                `;
            });
        };

        // Evento para adicionar um novo jogador
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const newPlayer = {
                name: document.getElementById('player-name').value,
                goals: parseInt(document.getElementById('goals').value),
                assists: parseInt(document.getElementById('assists').value),
                saves: parseInt(document.getElementById('saves').value),
                dribbles: parseInt(document.getElementById('dribbles').value),
            };
            
            const players = getPlayers();
            players.push(newPlayer);
            savePlayers(players);
            renderAdminList();
            form.reset();
        });

        // Evento para remover um jogador
        adminPlayerList.addEventListener('click', (e) => {
            if (e.target.classList.contains('btn-remove')) {
                const index = e.target.getAttribute('data-index');
                let players = getPlayers();
                players.splice(index, 1);
                savePlayers(players);
                renderAdminList();
            }
        });

        // Renderiza a lista inicial ao carregar a página
        renderAdminList();
    }

    // LÓGICA DA PÁGINA PRINCIPAL (INDEX.HTML)
    if (isMainPage) {
        const playerRankingBody = document.getElementById('player-ranking').getElementsByTagName('tbody')[0];
        
        const renderRanking = () => {
            playerRankingBody.innerHTML = '';
            const players = getPlayers();
            
            players.forEach(player => {
                const totalPoints = calculatePoints(player);
                const status = totalPoints >= 6 ? 'Qualificado' : 'Não Qualificado';
                const statusClass = totalPoints >= 6 ? 'status-qualified' : 'status-not-qualified';

                const row = playerRankingBody.insertRow();
                row.innerHTML = `
                    <td>${player.name}</td>
                    <td>${totalPoints}</td>
                    <td class="${statusClass}">${status}</td>
                `;
            });
        };
        
        // Renderiza o ranking ao carregar a página
        renderRanking();
    }
});
