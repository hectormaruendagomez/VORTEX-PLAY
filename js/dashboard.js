document.addEventListener('DOMContentLoaded', function() {
    initDashboard();
});

let currentUser = null;
let usersData = [];
let gamesData = [];
let newsData = [];
let commentsData = {};
let userFavorites = {};

function initDashboard() {
    currentUser = getCurrentUser();
    if (!currentUser) {
        alert('Acceso denegado. Inicia sesión primero.');
        window.location.href = 'auth.html';
        return;
    }

    loadDataFromStorage();
    updateUserDisplay();
    setupRolePermissions();
    setupSidebarNavigation();

    loadGeneralDashboard();
    loadProfileSection();
    loadFavoritesSection();
    loadCommentsSection();
    loadNewsCreateSection();
    loadNewsManageSection();
    loadUsersManageSection();
    loadReportsSection();
    loadSettingsSection();
    setupFormListeners();
}

function loadDataFromStorage() {
    usersData = JSON.parse(localStorage.getItem('usersData')) || [];
    gamesData = JSON.parse(localStorage.getItem('gamesData')) || [];
    newsData = JSON.parse(localStorage.getItem('newsData')) || [];
    commentsData = JSON.parse(localStorage.getItem('commentsData')) || {};
    userFavorites = JSON.parse(localStorage.getItem('userFavorites')) || {};
}

function saveDataToStorage() {
    localStorage.setItem('usersData', JSON.stringify(usersData));
    localStorage.setItem('gamesData', JSON.stringify(gamesData));
    localStorage.setItem('newsData', JSON.stringify(newsData));
    localStorage.setItem('commentsData', JSON.stringify(commentsData));
    localStorage.setItem('userFavorites', JSON.stringify(userFavorites));
}

function updateUserDisplay() {
    document.getElementById('profileName').textContent = currentUser.name;
    document.getElementById('avatarInitial').textContent = currentUser.avatar || currentUser.name.substring(0, 2).toUpperCase();
    document.getElementById('profileRole').textContent = getRoleDisplayName(currentUser.role);
}

function setupRolePermissions() {
    const contentMenu = document.getElementById('contentMenu');
    const linkNewsManage = document.getElementById('linkNewsManage');
    const adminMenu = document.getElementById('adminMenu');

    contentMenu.classList.add('hidden');
    linkNewsManage.classList.add('hidden');
    adminMenu.classList.add('hidden');

    if (currentUser.role === 'collaborator') {
        contentMenu.classList.remove('hidden');
    } else if (currentUser.role === 'writer') {
        contentMenu.classList.remove('hidden');
        linkNewsManage.classList.remove('hidden');
    } else if (currentUser.role === 'admin') {
        contentMenu.classList.remove('hidden');
        linkNewsManage.classList.remove('hidden');
        adminMenu.classList.remove('hidden');
    }
}

function setupSidebarNavigation() {
    const links = document.querySelectorAll('.sidebar-link');
    const sections = document.querySelectorAll('.content-section');

    links.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            links.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
            sections.forEach(s => s.classList.remove('active'));
            const target = document.getElementById(this.getAttribute('data-section') + '-section');
            if (target) target.classList.add('active');
        });
    });
}

function loadGeneralDashboard() {
    const welcomeMessages = {
        'subscriber': 'Bienvenido a tu área personal.',
        'collaborator': 'Bienvenido, colaborador. Crea borradores y aporta a la comunidad.',
        'writer': 'Bienvenido, redactor. Gestiona las noticias desde aquí.',
        'admin': 'Panel de administración. Control total de Vortex Play.'
    };
    document.getElementById('roleWelcome').textContent = welcomeMessages[currentUser.role] || 'Bienvenido';

    const myFavs = userFavorites[currentUser.email] || [];
    document.getElementById('statFavCount').textContent = myFavs.length;

    let myNewsCount = (currentUser.role === 'admin' || currentUser.role === 'writer')
        ? newsData.length
        : newsData.filter(n => n.author === currentUser.name).length;
    document.getElementById('statNewsCount').textContent = myNewsCount;

    let myCommentsCount = 0;
    Object.values(commentsData).forEach(postComments => {
        postComments.forEach(c => {
            if (c.author === currentUser.name || (c.email && c.email === currentUser.email)) {
                myCommentsCount++;
            }
        });
    });
    document.getElementById('statCommentsCount').textContent = myCommentsCount;
    document.getElementById('statUserRole').textContent = getRoleDisplayName(currentUser.role);

    const activityList = document.getElementById('recentActivityList');
    activityList.innerHTML = '';

    const activities = [{ time: 'Ahora', text: `Sesión iniciada como ${getRoleDisplayName(currentUser.role)}` }];

    if (myFavs.length > 0) {
        const game = gamesData.find(g => g.id === myFavs[myFavs.length - 1]);
        if (game) activities.push({ time: 'Reciente', text: `Marcaste como favorito "${game.title}"` });
    }

    let lastComment = '';
    Object.values(commentsData).forEach(postComments => {
        postComments.forEach(c => {
            if (c.author === currentUser.name) {
                lastComment = `Comentaste: "${c.text.substring(0, 40)}..."`;
            }
        });
    });
    if (lastComment) activities.push({ time: 'Reciente', text: lastComment });

    const myNews = newsData.filter(n => n.author === currentUser.name);
    if (myNews.length > 0) {
        const last = myNews[myNews.length - 1];
        activities.push({ time: 'Reciente', text: `${last.status === 'published' ? 'Publicaste' : 'Borraste'} "${last.title.substring(0, 40)}..."` });
    }

    activities.forEach(act => {
        const div = document.createElement('div');
        div.className = 'activity-item';
        div.innerHTML = `<span class="activity-time">${act.time}</span><p>${act.text}</p>`;
        activityList.appendChild(div);
    });
}

function loadProfileSection() {
    document.getElementById('profileFormName').value = currentUser.name;
    document.getElementById('profileFormEmail').value = currentUser.email;
    document.getElementById('profileFormRole').value = getRoleDisplayName(currentUser.role);
    document.getElementById('profileFormBio').value = currentUser.bio || '';
}

function loadFavoritesSection() {
    const grid = document.getElementById('dashboardFavoritesGrid');
    grid.innerHTML = '';

    const myFavs = userFavorites[currentUser.email] || [];
    if (myFavs.length === 0) {
        grid.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 40px; color: #7f8c8d;">
                <p>No tienes juegos en favoritos.</p>
                <a href="games.html" class="btn-primary" style="display: inline-block; margin-top: 15px; text-decoration: none;">Explorar Catálogo</a>
            </div>
        `;
        return;
    }

    myFavs.forEach(gameId => {
        const game = gamesData.find(g => g.id === gameId);
        if (!game) return;

        const card = document.createElement('div');
        card.className = 'favorite-card';
        card.innerHTML = `
            <div class="fav-image" style="background: ${game.imageGradient || 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)'}; height: 120px; border-radius: 8px; border: 1px solid rgba(0,212,255,0.2);"></div>
            <h3 style="margin-top: 10px; font-size: 1.1rem; color: #fff;">${game.title}</h3>
            <p style="font-size: 0.85rem; color: #95a5a6;">${game.studio} · ${game.year}</p>
            <div class="fav-rating">⭐ Prensa: ${game.pressRating}</div>
            <button class="btn-small danger btn-remove-fav" data-id="${game.id}" style="width: 100%; margin-top: 10px; cursor: pointer;">Quitar de Favoritos</button>
        `;
        grid.appendChild(card);
    });

    grid.querySelectorAll('.btn-remove-fav').forEach(btn => {
        btn.addEventListener('click', function() {
            removeFavorite(parseInt(this.getAttribute('data-id')));
        });
    });
}

function removeFavorite(gameId) {
    userFavorites[currentUser.email] = (userFavorites[currentUser.email] || []).filter(id => id !== gameId);
    saveDataToStorage();
    loadFavoritesSection();
    loadGeneralDashboard();
    alert('Juego eliminado de favoritos.');
}

function loadCommentsSection() {
    const list = document.getElementById('userCommentsList');
    list.innerHTML = '';

    const userComments = [];
    Object.keys(commentsData).forEach(postId => {
        commentsData[postId].forEach((comment, index) => {
            if (comment.author === currentUser.name || (comment.email && comment.email === currentUser.email)) {
                userComments.push({ postId, index, ...comment });
            }
        });
    });

    if (userComments.length === 0) {
        list.innerHTML = `<p style="color: #7f8c8d; text-align: center; padding: 20px;">No has publicado ningún comentario todavía.</p>`;
        return;
    }

    userComments.forEach(c => {
        let sourceName = c.postId.startsWith('blog_')
            ? 'Artículo de Blog'
            : `Noticia: "${(newsData.find(n => n.id == c.postId) || {}).title || c.postId}"`;

        const div = document.createElement('div');
        div.className = 'comment';
        div.style.cssText = 'margin-bottom: 15px; padding: 15px; background: rgba(0,212,255,0.02); border-left: 3px solid #00d4ff; border-radius: 6px;';
        div.innerHTML = `
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                <span style="color: #00d4ff; font-weight: 700; font-size: 0.9rem;">${sourceName}</span>
                <span style="color: #7f8c8d; font-size: 0.8rem;">${c.date}</span>
            </div>
            <p style="color: #bdc3c7; font-size: 0.95rem; line-height: 1.5; margin-bottom: 10px;">"${c.text}"</p>
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="font-size: 0.8rem; color: #95a5a6;">❤️ ${c.likes || 0} reacciones</span>
                <button class="btn-small danger btn-delete-comment" data-postid="${c.postId}" data-index="${c.index}">Eliminar</button>
            </div>
        `;
        list.appendChild(div);
    });

    list.querySelectorAll('.btn-delete-comment').forEach(btn => {
        btn.addEventListener('click', function() {
            if (confirm('¿Eliminar este comentario?')) {
                deleteComment(this.getAttribute('data-postid'), parseInt(this.getAttribute('data-index')));
            }
        });
    });
}

function deleteComment(postId, index) {
    if (commentsData[postId]) {
        commentsData[postId].splice(index, 1);
        saveDataToStorage();
        loadCommentsSection();
        loadGeneralDashboard();
        alert('Comentario eliminado.');
    }
}

function loadNewsCreateSection() {
    const subtitle = document.getElementById('newsCreateSubtitle');
    const btnPublish = document.getElementById('btnPublishNews');
    const btnDraft = document.getElementById('btnSaveDraft');

    if (currentUser.role === 'collaborator') {
        subtitle.textContent = 'Envía un borrador para que un Redactor o Administrador lo revise y publique.';
        btnPublish.textContent = 'Enviar a Revisión';
        btnDraft.style.display = 'none';
    } else {
        subtitle.textContent = 'Publica un artículo inmediatamente o guárdalo como borrador.';
        btnPublish.textContent = 'Publicar Artículo';
        btnDraft.style.display = 'inline-block';
    }
}

function loadNewsManageSection() {
    const tableBody = document.getElementById('newsManageTableBody');
    if (!tableBody || (currentUser.role !== 'writer' && currentUser.role !== 'admin')) return;

    tableBody.innerHTML = '';

    if (newsData.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="5" style="text-align: center; padding: 20px; color: #7f8c8d;">No hay noticias registradas.</td></tr>`;
        return;
    }

    newsData.forEach(item => {
        const statusLabels = { published: 'Publicada', draft: 'Borrador', pending: 'Pendiente' };
        const statusColors = { published: '#2ecc71', draft: '#f1c40f', pending: '#e67e22' };
        const color = statusColors[item.status] || '#95a5a6';
        const label = statusLabels[item.status] || item.status;

        const statusBadge = `<span style="background: ${color}22; color: ${color}; border: 1px solid ${color}44; padding: 4px 8px; border-radius: 4px; font-size: 0.75rem;">${label}</span>`;

        let actions = `<button class="btn-small danger btn-delete-news" data-id="${item.id}">Eliminar</button>`;
        if (item.status === 'pending' || item.status === 'draft') {
            actions = `<button class="btn-small btn-publish" data-id="${item.id}" style="background: rgba(46,204,113,0.15); color: #2ecc71; border-color: #2ecc7155; margin-right: 5px;">Publicar</button>` + actions;
        }

        const tr = document.createElement('tr');
        tr.style.borderBottom = '1px solid rgba(255,255,255,0.05)';
        tr.innerHTML = `
            <td style="padding: 12px; font-weight: 600; color: #fff;">${item.title}</td>
            <td style="padding: 12px; color: #bdc3c7;">${item.author || 'Equipo'}</td>
            <td style="padding: 12px;">${statusBadge}</td>
            <td style="padding: 12px; color: #7f8c8d;">${item.date}</td>
            <td style="padding: 12px;">${actions}</td>
        `;
        tableBody.appendChild(tr);
    });

    tableBody.querySelectorAll('.btn-publish').forEach(btn => {
        btn.addEventListener('click', function() {
            publishNewsArticle(parseInt(this.getAttribute('data-id')));
        });
    });

    tableBody.querySelectorAll('.btn-delete-news').forEach(btn => {
        btn.addEventListener('click', function() {
            if (confirm('¿Eliminar esta noticia?')) {
                deleteNewsArticle(parseInt(this.getAttribute('data-id')));
            }
        });
    });
}

function publishNewsArticle(id) {
    const article = newsData.find(n => n.id === id);
    if (article) {
        article.status = 'published';
        article.date = new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
        saveDataToStorage();
        loadNewsManageSection();
        loadGeneralDashboard();
        alert(`"${article.title}" publicada.`);
    }
}

function deleteNewsArticle(id) {
    newsData = newsData.filter(n => n.id !== id);
    saveDataToStorage();
    loadNewsManageSection();
    loadGeneralDashboard();
    alert('Noticia eliminada.');
}

function loadUsersManageSection() {
    const tableBody = document.getElementById('usersManageTableBody');
    if (!tableBody || currentUser.role !== 'admin') return;

    tableBody.innerHTML = '';

    usersData.forEach(u => {
        if (u.email === currentUser.email) return;

        const options = ['subscriber', 'collaborator', 'writer', 'admin']
            .map(val => `<option value="${val}" ${u.role === val ? 'selected' : ''}>${getRoleDisplayName(val)}</option>`)
            .join('');

        const tr = document.createElement('tr');
        tr.style.borderBottom = '1px solid rgba(255,255,255,0.05)';
        tr.innerHTML = `
            <td style="padding: 12px; font-weight: 600; color: #fff;">${u.name}</td>
            <td style="padding: 12px; color: #bdc3c7;">${u.email}</td>
            <td style="padding: 12px;">
                <select class="filter-select select-user-role" data-email="${u.email}" style="background: rgba(10,10,25,0.9); border: 1px solid rgba(0,212,255,0.25); color: #fff; padding: 4px 8px; border-radius: 4px;">
                    ${options}
                </select>
            </td>
            <td style="padding: 12px;">
                <button class="btn-small danger btn-delete-user" data-email="${u.email}">Suspender</button>
            </td>
        `;
        tableBody.appendChild(tr);
    });

    tableBody.querySelectorAll('.select-user-role').forEach(select => {
        select.addEventListener('change', function() {
            changeUserRole(this.getAttribute('data-email'), this.value);
        });
    });

    tableBody.querySelectorAll('.btn-delete-user').forEach(btn => {
        btn.addEventListener('click', function() {
            const email = this.getAttribute('data-email');
            if (confirm(`¿Eliminar la cuenta de ${email}?`)) {
                deleteUserAccount(email);
            }
        });
    });
}

function changeUserRole(email, newRole) {
    const user = usersData.find(u => u.email === email);
    if (user) {
        user.role = newRole;
        saveDataToStorage();
        loadUsersManageSection();
        loadReportsSection();
        alert(`Rol de ${user.name} actualizado a ${getRoleDisplayName(newRole)}.`);
    }
}

function deleteUserAccount(email) {
    usersData = usersData.filter(u => u.email !== email);
    saveDataToStorage();
    loadUsersManageSection();
    loadReportsSection();
    alert('Usuario eliminado.');
}

function loadReportsSection() {
    if (currentUser.role !== 'admin') return;

    const totalViews = newsData.reduce((acc, n) => acc + (n.views || 0), 0);
    document.getElementById('reportViews').textContent = totalViews;
    document.getElementById('reportUsers').textContent = usersData.length;
    document.getElementById('reportNews').textContent = newsData.length;

    const distList = document.getElementById('userDistributionList');
    distList.innerHTML = '';

    const roleCounts = { admin: 0, writer: 0, collaborator: 0, subscriber: 0 };
    usersData.forEach(u => { if (u.role in roleCounts) roleCounts[u.role]++; });

    const display = [
        { key: 'admin', label: 'Admins', color: '#ff0000', bg: 'rgba(255,0,0,0.1)' },
        { key: 'writer', label: 'Redactores', color: '#f1c40f', bg: 'rgba(241,196,15,0.1)' },
        { key: 'collaborator', label: 'Colaboradores', color: '#3498db', bg: 'rgba(52,152,219,0.1)' },
        { key: 'subscriber', label: 'Suscriptores', color: '#2ecc71', bg: 'rgba(46,204,113,0.1)' }
    ];

    display.forEach(item => {
        const div = document.createElement('div');
        div.style.cssText = `padding: 15px 25px; background: ${item.bg}; border: 1px solid ${item.color}33; border-radius: 8px; flex: 1; min-width: 130px; text-align: center;`;
        div.innerHTML = `<h4 style="color: ${item.color}; margin-bottom: 5px; font-size: 0.95rem;">${item.label}</h4><p style="font-size: 1.8rem; font-weight: 800; color: #fff;">${roleCounts[item.key] || 0}</p>`;
        distList.appendChild(div);
    });
}

function loadSettingsSection() {
    if (currentUser.role !== 'admin') return;

    const settings = JSON.parse(localStorage.getItem('platformSettings')) || {
        allowRegistration: true,
        allowComments: true,
        maintenanceMessage: '¡Estamos trabajando en nuevas funciones para la comunidad!'
    };

    document.getElementById('allowRegistration').checked = settings.allowRegistration;
    document.getElementById('allowComments').checked = settings.allowComments;
    document.getElementById('maintenanceMessage').value = settings.maintenanceMessage;

    document.getElementById('btnSaveSettings').addEventListener('click', function() {
        settings.allowRegistration = document.getElementById('allowRegistration').checked;
        settings.allowComments = document.getElementById('allowComments').checked;
        settings.maintenanceMessage = document.getElementById('maintenanceMessage').value;
        localStorage.setItem('platformSettings', JSON.stringify(settings));
        alert('Configuración guardada.');
    });
}

function setupFormListeners() {
    const profileForm = document.getElementById('profileForm');
    if (profileForm) {
        profileForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const newName = document.getElementById('profileFormName').value.trim();
            const newBio = document.getElementById('profileFormBio').value.trim();

            if (!newName) { alert('El nombre es obligatorio.'); return; }

            const idx = usersData.findIndex(u => u.email === currentUser.email);
            if (idx !== -1) {
                const initials = newName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
                usersData[idx].name = newName;
                usersData[idx].bio = newBio;
                usersData[idx].avatar = initials;
                currentUser = { ...currentUser, name: newName, bio: newBio, avatar: initials };
                localStorage.setItem('currentUser', JSON.stringify(currentUser));
                saveDataToStorage();
                updateUserDisplay();
                injectNavbar();
                alert('Perfil actualizado.');
            }
        });
    }

    const newsForm = document.getElementById('newsCreateForm');
    if (newsForm) {
        newsForm.addEventListener('submit', function(e) {
            e.preventDefault();
            submitNewsForm('publish');
        });
    }

    document.getElementById('btnSaveDraft')?.addEventListener('click', function() {
        submitNewsForm('draft');
    });
}

function submitNewsForm(action) {
    const title = document.getElementById('newsTitle').value.trim();
    const category = document.getElementById('newsCategory').value;
    const gradient = document.getElementById('newsImage').value;
    const excerpt = document.getElementById('newsExcerpt').value.trim();
    const content = document.getElementById('newsContent').value.trim();

    if (!title || !excerpt || !content) {
        alert('Rellena el título, copete y contenido.');
        return;
    }

    let status;
    if (action === 'draft') {
        status = 'draft';
    } else {
        status = currentUser.role === 'collaborator' ? 'pending' : 'published';
    }

    newsData.push({
        id: newsData.length > 0 ? Math.max(...newsData.map(n => n.id)) + 1 : 1,
        title, category, excerpt, content,
        date: new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' }),
        author: currentUser.name,
        imageGradient: gradient,
        status,
        views: 0
    });

    saveDataToStorage();

    if (status === 'pending') {
        alert('Borrador enviado a revisión.');
    } else if (status === 'draft') {
        alert('Guardado como borrador.');
    } else {
        alert(`"${title}" publicada.`);
    }

    document.getElementById('newsCreateForm').reset();
    loadNewsManageSection();
    loadGeneralDashboard();
    document.querySelector('[data-section="dashboard"]').click();
}
