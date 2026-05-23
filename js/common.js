document.addEventListener('DOMContentLoaded', function() {
    initDatabase();
    injectNavbar();
    injectFooter();
    setupMobileMenu();
    applyRoleVisibility();
});

function initDatabase() {
    if (!localStorage.getItem('usersData')) {
        const defaultUsers = [
            { email: 'admin@gamehub.com', password: 'admin123', name: 'Administrador Supremo', role: 'admin', avatar: 'AD' },
            { email: 'redactor@gamehub.com', password: 'redactor123', name: 'Carlos Redactor', role: 'writer', avatar: 'CR' },
            { email: 'colaborador@gamehub.com', password: 'colaborador123', name: 'Laura Colaboradora', role: 'collaborator', avatar: 'LC' },
            { email: 'suscriptor@gamehub.com', password: 'suscriptor123', name: 'Ana Suscriptora', role: 'subscriber', avatar: 'AS' }
        ];
        localStorage.setItem('usersData', JSON.stringify(defaultUsers));
    }

    if (!localStorage.getItem('gamesData')) {
        const defaultGames = [
            {
                id: 1,
                title: 'The Legend of Zelda: Breath of the Wild',
                studio: 'Nintendo',
                year: 2023,
                pressRating: 9.8,
                communityRating: 9.5,
                genres: ['adventure', 'action'],
                platforms: ['console'],
                description: 'Un juego que redefinió el género open-world con una libertad de exploración que pocas veces se ha visto.',
                tags: ['Aventura', 'Open-world', 'Nintendo'],
                imageGradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
            },
            {
                id: 2,
                title: 'Cyberpunk 2077',
                studio: 'CD Projekt Red',
                year: 2020,
                pressRating: 8.5,
                communityRating: 8.8,
                genres: ['rpg', 'action'],
                platforms: ['pc', 'console'],
                description: 'RPG futurista con una narrativa densa y un mundo abierto tan detallado que da vértigo.',
                tags: ['RPG', 'Futurista', 'Narrativa'],
                imageGradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
            },
            {
                id: 3,
                title: 'Elden Ring',
                studio: 'FromSoftware',
                year: 2022,
                pressRating: 9.7,
                communityRating: 9.3,
                genres: ['action', 'rpg'],
                platforms: ['pc', 'console'],
                description: 'Mundo abierto, combate exigente y un lore construido junto a George R.R. Martin. Difícil pero imposible de soltar.',
                tags: ['Acción', 'RPG', 'Desafiante'],
                imageGradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
            },
            {
                id: 4,
                title: 'The Witcher 3: Wild Hunt',
                studio: 'CD Projekt Red',
                year: 2015,
                pressRating: 9.5,
                communityRating: 9.4,
                genres: ['rpg', 'adventure'],
                platforms: ['pc', 'console'],
                description: 'Narrativa ramificada, misiones secundarias que superan a los juegos principales de otros títulos. Un referente del género.',
                tags: ['RPG', 'Fantasía', 'Clásico'],
                imageGradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)'
            },
            {
                id: 5,
                title: 'Hollow Knight',
                studio: 'Team Cherry',
                year: 2017,
                pressRating: 9.1,
                communityRating: 9.0,
                genres: ['action', 'strategy'],
                platforms: ['pc', 'mobile'],
                description: 'Metroidvania indie con dirección de arte única, banda sonora memorable y una dificultad que engancha.',
                tags: ['Indie', 'Metroidvania', 'Pixel Art'],
                imageGradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'
            },
            {
                id: 6,
                title: 'Dark Souls III',
                studio: 'FromSoftware',
                year: 2016,
                pressRating: 9.4,
                communityRating: 9.2,
                genres: ['action', 'rpg'],
                platforms: ['pc', 'console'],
                description: 'El cierre de la trilogía. Combate afilado, diseño de niveles impecable y jefes que se recuerdan para siempre.',
                tags: ['Acción', 'Soulslike', 'Desafiante'],
                imageGradient: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)'
            }
        ];
        localStorage.setItem('gamesData', JSON.stringify(defaultGames));
    }

    if (!localStorage.getItem('newsData')) {
        const defaultNews = [
            {
                id: 1,
                title: 'Gran evento de eSports 2026 confirma récord de participantes',
                category: 'Esports',
                date: '21 de mayo de 2026',
                author: 'Equipo Editorial',
                excerpt: 'El torneo de eSports más esperado del año: 5 millones en premios, más de 50 países y expectativas de superar los 100 millones de espectadores...',
                content: 'El torneo de eSports más esperado del año ya tiene fecha y cifras: 5 millones de dólares en premios, más de 50 países participantes.\n\nLas clasificatorias han arrancado con una competencia que no se veía desde hace tiempo. Los sponsors ya confirmados incluyen fabricantes de hardware, bebidas energéticas y plataformas de streaming.\n\nLos analistas apuntan a que la audiencia podría superar los 100 millones de espectadores en directo, lo que convertiría este evento en el mayor de la historia del gaming competitivo.',
                imageGradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                status: 'published',
                views: 2540
            },
            {
                id: 2,
                title: 'Nuevo motor gráfico revolucionario lanzado',
                category: 'Tecnología',
                date: '20 de mayo de 2026',
                author: 'Tech Team',
                excerpt: 'Ray-tracing en tiempo real, física predictiva y machine learning integrado. Los primeros juegos que lo usan llegarán antes de que acabe el año...',
                content: 'Ray-tracing en tiempo real, física predictiva y machine learning integrado en el pipeline de renderizado: eso es lo que promete el nuevo motor que varios estudios ya han adoptado.\n\nLas primeras demostraciones muestran resultados que costaba imaginar hace apenas dos años. La iluminación dinámica y la simulación de materiales son especialmente llamativas.\n\nLos primeros juegos que lo utilicen llegarán antes de que acabe 2026.',
                imageGradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                status: 'published',
                views: 1240
            },
            {
                id: 3,
                title: 'Tendencias en gaming 2026: Cloud y comunidad lideran',
                category: 'Tendencias',
                date: '19 de mayo de 2026',
                author: 'Análisis',
                excerpt: 'Cloud gaming, realidad aumentada y comunidades integradas: los analistas apuntan a que el 70% de los jugadores usarán servicios en la nube en 2027...',
                content: 'Cloud gaming, realidad aumentada y comunidades integradas en el propio juego. Los analistas apuntan a que el 70% de los jugadores usarán servicios en la nube de aquí a 2027.\n\nEl componente social ha dejado de ser un extra. Los estudios que no lo incluyen desde el diseño inicial se están quedando atrás, según varios informes del sector publicados este año.',
                imageGradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                status: 'published',
                views: 980
            },
            {
                id: 4,
                title: 'Lanzamiento plataforma cloud gaming revoluciona el sector',
                category: 'Plataformas',
                date: '18 de mayo de 2026',
                author: 'Redacción',
                excerpt: 'Más de 500 títulos desde el primer día, latencia por debajo de 10ms y soporte para cualquier dispositivo...',
                content: 'Más de 500 títulos disponibles desde el primer día, latencia por debajo de 10ms y soporte para cualquier dispositivo con conexión a internet.\n\nLa tecnología usa servidores distribuidos globalmente para mantener una experiencia consistente independientemente de dónde estés. El precio de lanzamiento y el catálogo inicial la convierten en la propuesta más sólida que hemos visto en este segmento.',
                imageGradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
                status: 'published',
                views: 860
            },
            {
                id: 5,
                title: 'Colectivo de streamers rompe récord histórico de audiencia',
                category: 'Streaming',
                date: '17 de mayo de 2026',
                author: 'Community',
                excerpt: '50 millones de espectadores simultáneos, sin previo aviso, solo boca a boca en redes. Un fenómeno que nadie vio venir...',
                content: '50 millones de espectadores simultáneos en una sola transmisión. Lo más llamativo del evento conjunto que varios streamers organizaron es que no hubo promoción previa: fue todo boca a boca en redes durante las 48 horas anteriores.\n\nEl evento ha superado todos los récords conocidos de streaming en vivo en plataformas gaming y ha disparado el debate sobre cómo se organiza y monetiza este tipo de contenido.',
                imageGradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
                status: 'published',
                views: 1980
            }
        ];
        localStorage.setItem('newsData', JSON.stringify(defaultNews));
    }

    if (!localStorage.getItem('commentsData')) {
        const defaultComments = {
            'blog_1': [
                { author: 'Miguel Santos', role: 'subscriber', date: 'hace 2 horas', text: 'Buen análisis. La profesionalización era inevitable, pero hay que hacerlo sin perder lo que hace especiales a los eSports.', likes: 12 },
                { author: 'Ana García', role: 'subscriber', date: 'hace 4 horas', text: 'Los jugadores jóvenes necesitan protecciones legales reales. Hay demasiados contratos abusivos circulando.', likes: 8 },
                { author: 'José López', role: 'subscriber', date: 'Ayer', text: '¿Demasiada regulación no podría frenar el crecimiento? La agilidad actual es parte del atractivo de los eSports.', likes: 5 }
            ],
            'blog_2': [
                { author: 'Roberto Gómez', role: 'collaborator', date: 'hace 1 día', text: 'El ray tracing es impresionante visualmente, pero el coste de rendimiento sigue siendo alto sin DLSS o FSR de por medio.', likes: 14 }
            ]
        };
        localStorage.setItem('commentsData', JSON.stringify(defaultComments));
    }

    if (!localStorage.getItem('userFavorites')) {
        const defaultFavorites = {
            'suscriptor@gamehub.com': [1, 2, 4],
            'admin@gamehub.com': [3, 6],
            'redactor@gamehub.com': [1, 5],
            'colaborador@gamehub.com': [2, 3]
        };
        localStorage.setItem('userFavorites', JSON.stringify(defaultFavorites));
    }
}

function getCurrentUser() {
    const userJson = localStorage.getItem('currentUser');
    return userJson ? JSON.parse(userJson) : null;
}

function injectNavbar() {
    const user = getCurrentUser();
    const pageName = window.location.pathname.split('/').pop() || 'index.html';

    if (pageName === 'login.html' || pageName === 'auth.html') {
        const nav = document.querySelector('.navbar');
        if (nav) nav.remove();
        return;
    }

    let navElement = document.querySelector('.navbar');
    if (!navElement) {
        navElement = document.createElement('nav');
        navElement.className = 'navbar';
        document.body.insertBefore(navElement, document.body.firstChild);
    } else {
        navElement.className = 'navbar';
    }

    let authAreaHtml = '';
    if (user) {
        authAreaHtml = `
            <div class="navbar-user">
                <span class="user-avatar-badge">${user.avatar}</span>
                <span class="user-name">${user.name.split(' ')[0]} <small>(${getRoleDisplayName(user.role)})</small></span>
                <a href="dashboard.html" class="navbar-link ${pageName === 'dashboard.html' ? 'active' : ''}">Dashboard</a>
                <button id="logoutBtn" class="btn-logout-nav" data-i18n="nav.logout">${t('nav.logout')}</button>
            </div>
        `;
    } else {
        authAreaHtml = `<a href="auth.html" class="btn-login-nav" data-i18n="nav.login">${t('nav.login')}</a>`;
    }

    navElement.innerHTML = `
        <div class="navbar-container">
            <a href="index.html" class="navbar-logo">🎮 Vortex Play</a>
            <div class="navbar-toggle" id="mobileNavbarToggle">
                <span></span><span></span><span></span>
            </div>
            <div class="navbar-menu" id="navbarMenu">
                <a href="index.html" class="navbar-link ${pageName === 'index.html' || pageName === '' ? 'active' : ''}" data-i18n="nav.home">Inicio</a>
                <a href="news.html" class="navbar-link ${pageName === 'news.html' || pageName.startsWith('news-detail') ? 'active' : ''}" data-i18n="nav.news">Noticias</a>
                <a href="games.html" class="navbar-link ${pageName === 'games.html' ? 'active' : ''}" data-i18n="nav.catalog">Catálogo</a>
                <a href="blog.html" class="navbar-link ${pageName === 'blog.html' ? 'active' : ''}" data-i18n="nav.blog">Blog</a>
                <a href="multimedia.html" class="navbar-link ${pageName === 'multimedia.html' ? 'active' : ''}" data-i18n="nav.multimedia">Multimedia</a>
                <a href="agenda.html" class="navbar-link ${pageName === 'agenda.html' ? 'active' : ''}" data-i18n="nav.agenda">Agenda</a>
                <a href="contact.html" class="navbar-link ${pageName === 'contact.html' ? 'active' : ''}" data-i18n="nav.contact">Contacto</a>
                <button id="langToggleBtn" class="btn-lang-toggle" title="Cambiar idioma">EN</button>
                ${authAreaHtml}
            </div>
        </div>
    `;

    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            if (confirm(t('nav.logout_confirm'))) {
                localStorage.removeItem('currentUser');
                window.location.href = 'index.html';
            }
        });
    }
}

function setupMobileMenu() {
    const toggle = document.getElementById('mobileNavbarToggle');
    const menu = document.getElementById('navbarMenu');

    if (!toggle || !menu) return;

    toggle.addEventListener('click', function(e) {
        e.stopPropagation();
        this.classList.toggle('active');
        menu.classList.toggle('active');
    });

    document.addEventListener('click', function(e) {
        if (menu.classList.contains('active') && !menu.contains(e.target) && e.target !== toggle) {
            toggle.classList.remove('active');
            menu.classList.remove('active');
        }
    });
}

function getRoleDisplayName(role) {
    const roles = {
        'admin': 'Admin',
        'writer': 'Redactor',
        'collaborator': 'Colaborador',
        'subscriber': 'Suscriptor'
    };
    return roles[role] || 'Invitado';
}

function injectFooter() {
    const pageName = window.location.pathname.split('/').pop() || 'index.html';
    const skipPages = ['login.html', 'auth.html', 'dashboard.html'];
    if (skipPages.includes(pageName)) return;

    let footerEl = document.querySelector('footer, .main-footer');
    if (!footerEl) {
        footerEl = document.createElement('footer');
        document.body.appendChild(footerEl);
    }
    footerEl.className = 'main-footer';

    footerEl.innerHTML = `
        <div class="footer-inner">
            <nav class="footer-links" aria-label="Footer">
                <a href="index.html" data-i18n="nav.home">Inicio</a>
                <a href="news.html" data-i18n="nav.news">Noticias</a>
                <a href="games.html" data-i18n="nav.catalog">Catálogo</a>
                <a href="blog.html" data-i18n="nav.blog">Blog</a>
                <a href="multimedia.html" data-i18n="nav.multimedia">Multimedia</a>
                <a href="team.html" data-i18n="nav.team">Equipo</a>
                <a href="agenda.html" data-i18n="nav.agenda">Agenda</a>
                <a href="contact.html" data-i18n="nav.contact">Contacto</a>
            </nav>
            <p class="footer-copy" data-i18n="footer.rights">&copy; 2026 Vortex Play &amp; Services Ecosystem. Todos los derechos reservados.</p>
        </div>
    `;
}

function applyRoleVisibility() {
    const user = getCurrentUser();
    const role = user ? user.role : 'guest';

    document.querySelectorAll('[data-requires-role]').forEach(el => {
        const allowed = el.getAttribute('data-requires-role').split(',').map(r => r.trim());
        if (!allowed.includes(role)) {
            el.classList.add('hidden');
        } else {
            el.classList.remove('hidden');
        }
    });

    document.querySelectorAll('[data-hide-for-role]').forEach(el => {
        const hidden = el.getAttribute('data-hide-for-role').split(',').map(r => r.trim());
        if (hidden.includes(role)) {
            el.classList.add('hidden');
        } else {
            el.classList.remove('hidden');
        }
    });
}
