document.addEventListener('DOMContentLoaded', function() {
    initCatalog();
    document.addEventListener('translationsApplied', renderGames);
});

let games = [];
let currentUser = null;
let userFavorites = [];

function initCatalog() {
    games = JSON.parse(localStorage.getItem('gamesData')) || [];
    currentUser = getCurrentUser();

    if (currentUser) {
        const allFavorites = JSON.parse(localStorage.getItem('userFavorites')) || {};
        userFavorites = allFavorites[currentUser.email] || [];
    }

    renderGames();
    setupFilters();
}

function renderGames() {
    const gamesGrid = document.getElementById('gamesGrid');
    if (!gamesGrid) return;

    const searchVal = document.getElementById('searchInput').value.toLowerCase().trim();
    const selectedGenres = Array.from(document.querySelectorAll('.genre-filter:checked')).map(cb => cb.value);
    const selectedPlatforms = Array.from(document.querySelectorAll('.platform-filter:checked')).map(cb => cb.value);
    const sortType = document.getElementById('sortSelect').value;

    let filtered = games.filter(game => {
        const searchMatch = !searchVal || (
            game.title.toLowerCase().includes(searchVal) ||
            game.studio.toLowerCase().includes(searchVal) ||
            game.description.toLowerCase().includes(searchVal) ||
            (game.tags && game.tags.some(t => t.toLowerCase().includes(searchVal)))
        );

        const genreMatch = selectedGenres.length === 0 ||
            (game.genres && game.genres.some(g => selectedGenres.includes(g)));

        const platformMatch = selectedPlatforms.length === 0 ||
            (game.platforms && game.platforms.some(p => selectedPlatforms.includes(p)));

        return searchMatch && genreMatch && platformMatch;
    });

    filtered.sort((a, b) => {
        if (sortType === 'pressRating') return b.pressRating - a.pressRating;
        if (sortType === 'communityRating') return b.communityRating - a.communityRating;
        if (sortType === 'year') return b.year - a.year;
        if (sortType === 'title') return a.title.localeCompare(b.title);
        return 0;
    });

    if (filtered.length === 0) {
        gamesGrid.innerHTML = `
            <div class="no-results" style="grid-column: 1/-1; text-align: center; padding: 40px; color: #bdc3c7;">
                <h3>${t('games.empty.title')}</h3>
                <p>${t('games.empty.hint')}</p>
            </div>
        `;
        return;
    }

    gamesGrid.innerHTML = '';
    filtered.forEach(game => {
        const isFav = userFavorites.includes(game.id);
        const card = document.createElement('div');
        card.className = 'game-card';
        card.innerHTML = `
            <div class="game-image" style="background: ${game.imageGradient || 'linear-gradient(135deg, #09091e, #151535)'};"></div>
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
                    ${game.tags ? game.tags.map(t => `<span class="tag">${t}</span>`).join('') : ''}
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

function toggleFavorite(gameId, buttonElement) {
    if (!currentUser) {
        alert(t('games.login_fav'));
        window.location.href = 'auth.html';
        return;
    }

    const allFavorites = JSON.parse(localStorage.getItem('userFavorites')) || {};
    let favs = allFavorites[currentUser.email] || [];
    const idx = favs.indexOf(gameId);

    if (idx === -1) {
        favs.push(gameId);
        buttonElement.className = 'btn-favorite active';
        buttonElement.textContent = `❤️ ${t('games.label.favorite')}`;
    } else {
        favs.splice(idx, 1);
        buttonElement.className = 'btn-favorite';
        buttonElement.textContent = `🤍 ${t('games.label.favorite')}`;
    }

    allFavorites[currentUser.email] = favs;
    localStorage.setItem('userFavorites', JSON.stringify(allFavorites));
    userFavorites = favs;
}

function setupFilters() {
    document.getElementById('searchInput')?.addEventListener('input', renderGames);
    document.getElementById('sortSelect')?.addEventListener('change', renderGames);
    document.querySelectorAll('.genre-filter, .platform-filter').forEach(cb => {
        cb.addEventListener('change', renderGames);
    });
}
