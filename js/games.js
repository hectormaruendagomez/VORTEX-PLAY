document.addEventListener('DOMContentLoaded', function() {
    initCatalog();
    document.addEventListener('translationsApplied', renderGames);
});

let games        = [];
let currentUser  = null;
let userFavorites = [];

async function initCatalog() {
    currentUser = getCurrentUser();

    try {
        const [gamesRes, favsRes] = await Promise.all([
            fetch(API + 'videojuegos.php'),
            currentUser ? fetch(API + 'favoritos.php') : Promise.resolve(null)
        ]);

        const gamesData = await gamesRes.json();
        games = Array.isArray(gamesData) ? gamesData : [];

        // Normalizar campos al formato que espera renderGames
        games = games.map(g => ({
            id:              parseInt(g.id),
            title:           g.titulo,
            studio:          g.desarrollador,
            year:            new Date(g.fecha_lanzamiento).getFullYear(),
            pressRating:     parseFloat(g.puntuacion_prensa),
            communityRating: parseFloat(g.puntuacion_comunidad),
            genres:          genresFromDB(g.genero),
            platforms:       platformsFromDB(g.plataforma),
            description:     g.descripcion || '',
            tags:            tagsFromDB(g.genero, g.plataforma),
            imageGradient:   gradientForGame(parseInt(g.id)),
        }));

        if (favsRes) {
            const favsData = await favsRes.json();
            userFavorites  = favsData.ok ? favsData.data : [];
        }
    } catch {
        games         = [];
        userFavorites = [];
    }

    renderGames();
    setupFilters();
}

// ── Helpers de normalización ──────────────────────────────────
function genresFromDB(genero) {
    const map = {
        'Aventura': ['adventure'], 'RPG': ['rpg'], 'RPG / Sci-Fi': ['rpg', 'action'],
        'Acción':   ['action'],   'Estrategia': ['strategy'],
    };
    return map[genero] || ['action'];
}

function platformsFromDB(plataforma) {
    const p = plataforma.toLowerCase();
    const out = [];
    if (p.includes('pc'))            out.push('pc');
    if (p.includes('ps') || p.includes('xbox') || p.includes('switch')) out.push('console');
    if (p.includes('móvil') || p.includes('mobile')) out.push('mobile');
    return out.length ? out : ['pc'];
}

function tagsFromDB(genero, plataforma) {
    return [genero, plataforma].filter(Boolean);
}

const GRADIENTS = [
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
];
function gradientForGame(id) {
    return GRADIENTS[(id - 1) % GRADIENTS.length];
}

// ── Render ────────────────────────────────────────────────────
function renderGames() {
    const gamesGrid = document.getElementById('gamesGrid');
    if (!gamesGrid) return;

    const searchVal       = (document.getElementById('searchInput')?.value || '').toLowerCase().trim();
    const selectedGenres  = Array.from(document.querySelectorAll('.genre-filter:checked')).map(cb => cb.value);
    const selectedPlatforms = Array.from(document.querySelectorAll('.platform-filter:checked')).map(cb => cb.value);
    const sortType        = document.getElementById('sortSelect')?.value || 'pressRating';

    let filtered = games.filter(game => {
        const searchMatch = !searchVal || (
            game.title.toLowerCase().includes(searchVal) ||
            game.studio.toLowerCase().includes(searchVal) ||
            game.description.toLowerCase().includes(searchVal) ||
            (game.tags && game.tags.some(tag => tag.toLowerCase().includes(searchVal)))
        );
        const genreMatch    = selectedGenres.length === 0    || (game.genres    && game.genres.some(g => selectedGenres.includes(g)));
        const platformMatch = selectedPlatforms.length === 0 || (game.platforms && game.platforms.some(p => selectedPlatforms.includes(p)));
        return searchMatch && genreMatch && platformMatch;
    });

    filtered.sort((a, b) => {
        if (sortType === 'pressRating')     return b.pressRating - a.pressRating;
        if (sortType === 'communityRating') return b.communityRating - a.communityRating;
        if (sortType === 'year')            return b.year - a.year;
        if (sortType === 'title')           return a.title.localeCompare(b.title);
        return 0;
    });

    if (filtered.length === 0) {
        gamesGrid.innerHTML = `
            <div class="no-results" style="grid-column:1/-1;text-align:center;padding:40px;color:#bdc3c7;">
                <h3>${t('games.empty.title')}</h3><p>${t('games.empty.hint')}</p>
            </div>`;
        return;
    }

    gamesGrid.innerHTML = '';
    filtered.forEach(game => {
        const isFav = userFavorites.includes(game.id);
        const card  = document.createElement('div');
        card.className = 'game-card';
        card.innerHTML = `
            <div class="game-image" style="background:${game.imageGradient};"></div>
            <div class="game-info">
                <h3 class="game-title">${game.title}</h3>
                <p class="game-studio">${game.studio} · ${game.year}</p>
                <div class="game-ratings">
                    <div class="rating-item">
                        <span class="rating-label">${t('games.label.press')}</span>
                        <div class="stars">${getStarsHTML(game.pressRating)}</div>
                        <span class="rating-score">${game.pressRating}/10</span>
                    </div>
                    <div class="rating-item">
                        <span class="rating-label">${t('games.label.community')}</span>
                        <div class="stars">${getStarsHTML(game.communityRating)}</div>
                        <span class="rating-score">${game.communityRating}/10</span>
                    </div>
                </div>
                <p class="game-description">${game.description}</p>
                <div class="game-tags">
                    ${game.tags ? game.tags.map(tag => `<span class="tag">${tag}</span>`).join('') : ''}
                </div>
                <button class="btn-favorite ${isFav ? 'active' : ''}" data-id="${game.id}">
                    ${isFav ? '❤️' : '🤍'} ${t('games.label.favorite')}
                </button>
            </div>
        `;

        card.querySelector('.btn-favorite').addEventListener('click', function() {
            toggleFavorite(game.id, this);
        });

        gamesGrid.appendChild(card);
    });
}

function getStarsHTML(rating) {
    const count = Math.round(rating / 2);
    return '⭐'.repeat(Math.max(count, 1));
}

async function toggleFavorite(gameId, buttonElement) {
    if (!currentUser) {
        alert(t('games.login_fav'));
        window.location.href = 'auth.html';
        return;
    }

    const isFav = userFavorites.includes(gameId);
    const formData = new FormData();
    formData.append('id_videojuego', gameId);
    if (isFav) formData.append('_method', 'DELETE');

    try {
        const res  = await fetch(API + 'favoritos.php', { method: 'POST', body: formData });
        const data = await res.json();

        if (data.ok) {
            if (isFav) {
                userFavorites = userFavorites.filter(id => id !== gameId);
                buttonElement.className  = 'btn-favorite';
                buttonElement.textContent = `🤍 ${t('games.label.favorite')}`;
            } else {
                userFavorites.push(gameId);
                buttonElement.className  = 'btn-favorite active';
                buttonElement.textContent = `❤️ ${t('games.label.favorite')}`;
            }
        }
    } catch {}
}

function setupFilters() {
    document.getElementById('searchInput')?.addEventListener('input', renderGames);
    document.getElementById('sortSelect')?.addEventListener('change', renderGames);
    document.querySelectorAll('.genre-filter, .platform-filter').forEach(cb => {
        cb.addEventListener('change', renderGames);
    });
}
