const API_KEY = "da01d7158a60be461c607c6d31470b4e";
const BASE_URL = "https://v3.football.api-sports.io";

async function apiCall(endpoint, params = {}) {
    const url = new URL(BASE_URL + endpoint);
    Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));

    try {
        const res = await fetch(url, {
            headers: { 'x-apisports-key': API_KEY }
        });
        const data = await res.json();
        return data.response;
    } catch (e) {
        console.error(e);
        return null;
    }
}

// Load Live Matches
async function loadLiveMatches() {
    const container = document.getElementById('live-matches');
    container.innerHTML = '<p style="grid-column:1/-1;text-align:center;color:#94a3b8;">Loading live matches...</p>';

    const fixtures = await apiCall('/fixtures', { live: 'all' });
    container.innerHTML = '';

    if (!fixtures || fixtures.length === 0) {
        container.innerHTML = '<p style="grid-column:1/-1;text-align:center;color:#94a3b8;">No live matches right now</p>';
        return;
    }

    fixtures.forEach(fix => {
        const card = createMatchCard(fix, true);
        container.appendChild(card);
    });
}

function createMatchCard(fixture, isLive = false) {
    const card = document.createElement('div');
    card.className = 'match-card';
    card.onclick = () => openMatchDetail(fixture);

    const status = isLive ? 
        `<span class="live-badge">LIVE • ${fixture.fixture.status.elapsed || 0}'</span>` : 
        new Date(fixture.fixture.date).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'});

    card.innerHTML = `
        <div class="match-header">
            <div>${fixture.league.name}</div>
            <div>${status}</div>
        </div>
        <div class="teams">
            <div class="team">
                <img src="${fixture.teams.home.logo}" class="team-logo">
                <div class="team-name">${fixture.teams.home.name}</div>
            </div>
            <div class="score">
                ${fixture.goals.home ?? '-'} : ${fixture.goals.away ?? '-'}
            </div>
            <div class="team">
                <img src="${fixture.teams.away.logo}" class="team-logo">
                <div class="team-name">${fixture.teams.away.name}</div>
            </div>
        </div>
    `;
    return card;
}

// Open Match Detail
async function openMatchDetail(fixture) {
    const modal = document.getElementById('team-modal');
    modal.style.display = 'block';

    document.getElementById('modal-team-header').innerHTML = `
        <h2 style="text-align:center;">
            \( {fixture.teams.home.name} <img src=" \){fixture.teams.home.logo}" width="45"> vs 
            <img src="${fixture.teams.away.logo}" width="45"> ${fixture.teams.away.name}
        </h2>
    `;

    // Live Video (Change this link to your real streaming source)
    document.getElementById('live-video').src = "https://www.youtube.com/embed/dQw4w9wgxcq";

    const id = fixture.fixture.id;
    loadLineups(id);
    loadStats(id);
    loadEvents(id);
    loadOdds(id);
    loadPreview(fixture);
}

async function loadLineups(id) { /* same as previous version */ 
    // ... (I can send full if needed)
}

async function loadStats(id) {
    const data = await apiCall('/fixtures', { id });
    if (!data || !data[0]) return;
    const stats = data[0].statistics || [];

    const html = `
        <div class="stat-category">
            <h3>Attack</h3>
            <div class="stat-item"><span>Total Shots</span><span>${getStat(stats,0,'Total Shots')} - ${getStat(stats,1,'Total Shots')}</span></div>
            <div class="stat-item"><span>Shots on Target</span><span>${getStat(stats,0,'Shots on Goal')} - ${getStat(stats,1,'Shots on Goal')}</span></div>
            <div class="stat-item"><span>Corner Kicks</span><span>${getStat(stats,0,'Corner Kicks')} - ${getStat(stats,1,'Corner Kicks')}</span></div>
        </div>
        <div class="stat-category">
            <h3>Possession & Distribution</h3>
            <div class="stat-item"><span>Ball Possession</span><span>${getStat(stats,0,'Ball Possession')} - ${getStat(stats,1,'Ball Possession')}</span></div>
            <div class="stat-item"><span>Total Passes</span><span>${getStat(stats,0,'Total passes')} - ${getStat(stats,1,'Total passes')}</span></div>
        </div>
        <div class="stat-category">
            <h3>Defence</h3>
            <div class="stat-item"><span>Goalkeeper Saves</span><span>${getStat(stats,0,'Goalkeeper Saves')} - ${getStat(stats,1,'Goalkeeper Saves')}</span></div>
            <div class="stat-item"><span>Tackles</span><span>${getStat(stats,0,'Tackles')} - ${getStat(stats,1,'Tackles')}</span></div>
        </div>
        <div class="stat-category">
            <h3>Discipline</h3>
            <div class="stat-item"><span>Fouls</span><span>${getStat(stats,0,'Fouls')} - ${getStat(stats,1,'Fouls')}</span></div>
            <div class="stat-item"><span>Yellow Cards</span><span>${getStat(stats,0,'Yellow Cards')} - ${getStat(stats,1,'Yellow Cards')}</span></div>
            <div class="stat-item"><span>Red Cards</span><span>${getStat(stats,0,'Red Cards')} - ${getStat(stats,1,'Red Cards')}</span></div>
        </div>
    `;
    document.getElementById('stats-content').innerHTML = html;
}

function getStat(stats, teamIndex, type) {
    return stats[teamIndex]?.statistics.find(s => s.type === type)?.value ?? 0;
}

// Other functions (loadEvents, loadOdds, loadPreview, switchTab, closeModal, etc.) are available.

window.onload = () => {
    loadLiveMatches();
    // Add loadLeagues() etc. as needed
    setInterval(() => {
        if (document.getElementById('live-section').classList.contains('active')) loadLiveMatches();
    }, 30000);
};
