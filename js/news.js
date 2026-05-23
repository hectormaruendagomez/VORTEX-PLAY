document.addEventListener('DOMContentLoaded', function() {
    initNewsPage();
    document.addEventListener('translationsApplied', renderNews);
});

let newsList = [];
let currentCategory = 'all';

function initNewsPage() {
    newsList = JSON.parse(localStorage.getItem('newsData')) || [];
    renderNews();
    renderTrending();
    setupCategoryEvents();
}

function renderNews() {
    const newsGrid = document.getElementById('newsGrid');
    if (!newsGrid) return;

    let visible = newsList.filter(item => item.status === 'published');

    if (currentCategory !== 'all') {
        visible = visible.filter(item => item.category.toLowerCase() === currentCategory.toLowerCase());
    }

    if (visible.length === 0) {
        newsGrid.innerHTML = `
            <div class="no-results" style="grid-column: 1/-1; text-align: center; padding: 40px; color: #bdc3c7;">
                <h3>${t('news.empty.title')}</h3>
                <p>${t('news.empty.hint')}</p>
            </div>
        `;
        return;
    }

    newsGrid.innerHTML = '';

    visible.forEach((news, index) => {
        const article = document.createElement('article');
        const isFeatured = index === 0 && currentCategory === 'all';
        article.className = isFeatured ? 'news-article featured' : 'news-article';

        const viewsDisplay = news.views >= 1000 ? `${(news.views / 1000).toFixed(1)}K` : news.views;

        const bgStyle = news.imageBase64
            ? `background-image:url(${news.imageBase64});background-size:cover;background-position:center;`
            : `background:${news.imageGradient || 'linear-gradient(135deg, #09091e, #151535)'};`;

        article.innerHTML = `
            <div class="article-image" style="${bgStyle}"></div>
            <div class="article-content">
                <span class="article-category">${getCategoryIcon(news.category)} ${translateCategory(news.category)}</span>
                <h2 class="article-title">${news.title}</h2>
                <p class="article-excerpt">${news.excerpt}</p>
                <div class="article-meta">
                    <span>📅 ${news.date}</span>
                    <span>✍️ ${news.author}</span>
                    <span>👁️ ${viewsDisplay} ${t('news.views')}</span>
                </div>
                <a href="news-detail.html?id=${news.id}" class="btn-read-more">${t('index.read_more')}</a>
            </div>
        `;

        newsGrid.appendChild(article);
    });
}

function renderTrending() {
    const trendingList = document.getElementById('trendingList');
    if (!trendingList) return;

    const top3 = [...newsList.filter(n => n.status === 'published')]
        .sort((a, b) => b.views - a.views)
        .slice(0, 3);

    trendingList.innerHTML = '';

    top3.forEach((trend, index) => {
        const item = document.createElement('a');
        item.href = `news-detail.html?id=${trend.id}`;
        item.className = 'trending-item';
        item.innerHTML = `
            <span class="trend-count">${index + 1}</span>
            <span class="trend-text">${trend.title}</span>
        `;
        trendingList.appendChild(item);
    });
}

function setupCategoryEvents() {
    const links = document.querySelectorAll('.category-link');

    links.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            links.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
            currentCategory = this.getAttribute('data-category');
            renderNews();
        });
    });
}

function getCategoryIcon(category) {
    const icons = {
        'esports': '🏆',
        'tecnología': '🚀',
        'tecnologia': '🚀',
        'lanzamientos': '🎮',
        'tendencias': '📈',
        'plataformas': '☁️',
        'streaming': '🎥',
        'technology': '🚀',
        'launches': '🎮',
        'trends': '📈',
        'platforms': '☁️'
    };
    return icons[category.toLowerCase()] || '📰';
}

function translateCategory(category) {
    const map = {
        'esports': 'news.cat.esports',
        'tecnología': 'news.cat.tech',
        'tecnologia': 'news.cat.tech',
        'lanzamientos': 'news.cat.launches',
        'tendencias': 'news.cat.trends',
        'plataformas': 'news.cat.platforms',
        'streaming': 'news.cat.streaming',
        'technology': 'news.cat.tech',
        'launches': 'news.cat.launches',
        'trends': 'news.cat.trends',
        'platforms': 'news.cat.platforms'
    };
    const key = map[category.toLowerCase()];
    return t(key) || category;
}
