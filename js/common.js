// Ruta base al backend PHP (se adapta a la ubicación de la página)
const API = window.location.pathname.includes('/pages/') ? '../backend/' : 'backend/';

document.addEventListener('DOMContentLoaded', function() {
    injectNavbar();
    injectFooter();
    setupMobileMenu();
    applyRoleVisibility();
});

// ── Sesión ────────────────────────────────────────────────────
function getCurrentUser() {
    const raw = localStorage.getItem('currentUser');
    return raw ? JSON.parse(raw) : null;
}

async function syncSession() {
    try {
        const res  = await fetch(API + 'session_check.php');
        const data = await res.json();
        if (data.ok && data.user) {
            localStorage.setItem('currentUser', JSON.stringify(data.user));
            return data.user;
        } else {
            localStorage.removeItem('currentUser');
            return null;
        }
    } catch {
        return getCurrentUser();
    }
}

// ── Navbar ────────────────────────────────────────────────────
function injectNavbar() {
    const user     = getCurrentUser();
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
        logoutBtn.addEventListener('click', async function() {
            if (confirm(t('nav.logout_confirm'))) {
                try {
                    await fetch(API + 'logout.php');
                } catch {}
                localStorage.removeItem('currentUser');
                window.location.href = 'index.html';
            }
        });
    }
}

function setupMobileMenu() {
    const toggle = document.getElementById('mobileNavbarToggle');
    const menu   = document.getElementById('navbarMenu');

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
        'admin':        'Admin',
        'writer':       'Redactor',
        'collaborator': 'Colaborador',
        'subscriber':   'Suscriptor'
    };
    return roles[role] || 'Invitado';
}

function injectFooter() {
    const pageName  = window.location.pathname.split('/').pop() || 'index.html';
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
        el.classList.toggle('hidden', !allowed.includes(role));
    });

    document.querySelectorAll('[data-hide-for-role]').forEach(el => {
        const hidden = el.getAttribute('data-hide-for-role').split(',').map(r => r.trim());
        el.classList.toggle('hidden', hidden.includes(role));
    });
}
