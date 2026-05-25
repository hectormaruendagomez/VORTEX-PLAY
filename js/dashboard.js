document.addEventListener('DOMContentLoaded', function() {
    initDashboard();
});

let currentUser      = null;
let usersData        = [];
let gamesData        = [];
let newsData         = [];
let myComments       = [];
let userFavoriteIds  = [];
let pendingImageBase64 = null;

async function initDashboard() {
    // Verificar sesión con el servidor
    try {
        const res  = await fetch(API + 'session_check.php');
        const data = await res.json();
        if (!data.ok || !data.user) {
            alert(t('dash.error.access_denied'));
            window.location.href = 'auth.html';
            return;
        }
        currentUser = data.user;
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
    } catch {
        currentUser = getCurrentUser();
        if (!currentUser) {
            alert(t('dash.error.access_denied'));
            window.location.href = 'auth.html';
            return;
        }
    }

    await loadAllData();

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

async function loadAllData() {
    const fetches = [
        fetch(API + 'noticias.php?tipo=Noticia').catch(() => null),
        fetch(API + 'favoritos.php').catch(() => null),
        fetch(API + 'comentarios.php?mine=1').catch(() => null),
        fetch(API + 'videojuegos.php').catch(() => null),
    ];

    if (currentUser.role === 'admin') {
        fetches.push(fetch(API + 'usuarios.php').catch(() => null));
    }

    const responses = await Promise.all(fetches);

    const newsRes    = responses[0] ? await responses[0].json().catch(() => null) : null;
    const favsRes    = responses[1] ? await responses[1].json().catch(() => null) : null;
    const cmntsRes   = responses[2] ? await responses[2].json().catch(() => null) : null;
    const gamesRes   = responses[3] ? await responses[3].json().catch(() => null) : null;
    const usersRes   = responses[4] ? await responses[4].json().catch(() => null) : null;

    newsData        = newsRes?.ok    ? newsRes.data    : [];
    userFavoriteIds = favsRes?.ok    ? favsRes.data    : [];
    myComments      = cmntsRes?.ok   ? cmntsRes.data   : [];
    gamesData       = Array.isArray(gamesRes) ? gamesRes : [];
    usersData       = usersRes?.ok   ? usersRes.data   : [];

    // Normalizar juegos
    gamesData = gamesData.map(g => ({
        id:              parseInt(g.id),
        title:           g.titulo,
        studio:          g.desarrollador,
        year:            new Date(g.fecha_lanzamiento).getFullYear(),
        pressRating:     parseFloat(g.puntuacion_prensa),
        imageGradient:   gradientForId(parseInt(g.id)),
    }));
}

const GRADIENTS_DASH = [
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
];
function gradientForId(id) {
    return GRADIENTS_DASH[(id - 1) % GRADIENTS_DASH.length];
}

// ── UI helpers ────────────────────────────────────────────────
function updateUserDisplay() {
    document.getElementById('profileName').textContent    = currentUser.name;
    document.getElementById('avatarInitial').textContent  = currentUser.avatar || currentUser.name.substring(0, 2).toUpperCase();
    document.getElementById('profileRole').textContent    = getRoleDisplayName(currentUser.role);
}

function setupRolePermissions() {
    const contentMenu    = document.getElementById('contentMenu');
    const linkNewsManage = document.getElementById('linkNewsManage');
    const adminMenu      = document.getElementById('adminMenu');

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
    const links    = document.querySelectorAll('.sidebar-link');
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

// ── Secciones ─────────────────────────────────────────────────
function loadGeneralDashboard() {
    document.getElementById('roleWelcome').textContent = t(`dash.welcome.${currentUser.role}`) || t('auth.success.welcome');

    document.getElementById('statFavCount').textContent     = userFavoriteIds.length;
    document.getElementById('statNewsCount').textContent    = newsData.length;
    document.getElementById('statCommentsCount').textContent = myComments.length;
    document.getElementById('statUserRole').textContent     = getRoleDisplayName(currentUser.role);

    const activityList = document.getElementById('recentActivityList');
    activityList.innerHTML = '';

    const activities = [{ time: t('dash.activity.now'), text: `${t('dash.activity.login')} ${getRoleDisplayName(currentUser.role)}` }];

    if (userFavoriteIds.length > 0) {
        const lastFavId = userFavoriteIds[userFavoriteIds.length - 1];
        const game = gamesData.find(g => g.id === lastFavId);
        if (game) activities.push({ time: t('dash.activity.recent'), text: `${t('dash.activity.fav')} "${game.title}"` });
    }

    if (myComments.length > 0) {
        const last = myComments[0];
        activities.push({ time: t('dash.activity.recent'), text: `${t('dash.activity.commented')} "${last.texto.substring(0, 40)}..."` });
    }

    if (newsData.length > 0) {
        const last = newsData[0];
        activities.push({ time: t('dash.activity.recent'), text: `${last.status === 'published' ? t('dash.activity.published') : t('dash.activity.drafted')} "${last.title.substring(0, 40)}..."` });
    }

    activities.forEach(act => {
        const div = document.createElement('div');
        div.className = 'activity-item';
        div.innerHTML = `<span class="activity-time">${act.time}</span><p>${act.text}</p>`;
        activityList.appendChild(div);
    });
}

function loadProfileSection() {
    document.getElementById('profileFormName').value  = currentUser.name;
    document.getElementById('profileFormEmail').value = currentUser.email;
    document.getElementById('profileFormRole').value  = getRoleDisplayName(currentUser.role);
    document.getElementById('profileFormBio').value   = currentUser.bio || '';
}

function loadFavoritesSection() {
    const grid = document.getElementById('dashboardFavoritesGrid');
    grid.innerHTML = '';

    if (userFavoriteIds.length === 0) {
        grid.innerHTML = `
            <div style="grid-column:1/-1;text-align:center;padding:40px;color:#7f8c8d;">
                <p>${t('dash.favorites.empty')}</p>
                <a href="games.html" class="btn-primary" style="display:inline-block;margin-top:15px;text-decoration:none;">${t('dash.favorites.explore')}</a>
            </div>`;
        return;
    }

    userFavoriteIds.forEach(gameId => {
        const game = gamesData.find(g => g.id === gameId);
        if (!game) return;

        const card = document.createElement('div');
        card.className = 'favorite-card';
        card.innerHTML = `
            <div class="fav-image" style="background:${game.imageGradient};height:120px;border-radius:8px;border:1px solid rgba(0,212,255,0.2);"></div>
            <h3 style="margin-top:10px;font-size:1.1rem;color:#fff;">${game.title}</h3>
            <p style="font-size:0.85rem;color:#95a5a6;">${game.studio} · ${game.year}</p>
            <div class="fav-rating">⭐ ${t('dash.favorites.press')} ${game.pressRating}</div>
            <button class="btn-small danger btn-remove-fav" data-id="${game.id}" style="width:100%;margin-top:10px;cursor:pointer;">${t('dash.favorites.remove')}</button>
        `;
        grid.appendChild(card);
    });

    grid.querySelectorAll('.btn-remove-fav').forEach(btn => {
        btn.addEventListener('click', function() {
            removeFavorite(parseInt(this.getAttribute('data-id')));
        });
    });
}

async function removeFavorite(gameId) {
    const formData = new FormData();
    formData.append('id_videojuego', gameId);
    formData.append('_method', 'DELETE');

    try {
        const res  = await fetch(API + 'favoritos.php', { method: 'POST', body: formData });
        const data = await res.json();
        if (data.ok) {
            userFavoriteIds = userFavoriteIds.filter(id => id !== gameId);
            loadFavoritesSection();
            loadGeneralDashboard();
            alert(t('dash.favorites.removed'));
        }
    } catch {}
}

function loadCommentsSection() {
    const list = document.getElementById('userCommentsList');
    list.innerHTML = '';

    if (myComments.length === 0) {
        list.innerHTML = `<p style="color:#7f8c8d;text-align:center;padding:20px;">${t('dash.comments.empty')}</p>`;
        return;
    }

    myComments.forEach(c => {
        const sourceName = c.tipo === 'Articulo'
            ? t('dash.comments.blog_source')
            : `${t('news.sidebar.redaction')}: "${c.titulo_contenido || c.id_contenido}"`;

        const fecha = new Date(c.fecha_comentario).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });

        const div = document.createElement('div');
        div.className = 'comment';
        div.style.cssText = 'margin-bottom:15px;padding:15px;background:rgba(0,212,255,0.02);border-left:3px solid #00d4ff;border-radius:6px;';
        div.innerHTML = `
            <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
                <span style="color:#00d4ff;font-weight:700;font-size:0.9rem;">${sourceName}</span>
                <span style="color:#7f8c8d;font-size:0.8rem;">${fecha}</span>
            </div>
            <p style="color:#bdc3c7;font-size:0.95rem;line-height:1.5;margin-bottom:10px;">"${c.texto}"</p>
            <div style="display:flex;justify-content:flex-end;">
                <button class="btn-small danger btn-delete-comment" data-id="${c.id}">${t('dash.comments.delete')}</button>
            </div>
        `;
        list.appendChild(div);
    });

    list.querySelectorAll('.btn-delete-comment').forEach(btn => {
        btn.addEventListener('click', function() {
            if (confirm(t('dash.comments.confirm_delete'))) {
                deleteComment(parseInt(this.getAttribute('data-id')));
            }
        });
    });
}

async function deleteComment(id) {
    const formData = new FormData();
    formData.append('id', id);
    formData.append('_method', 'DELETE');

    try {
        const res  = await fetch(API + 'comentarios.php', { method: 'POST', body: formData });
        const data = await res.json();
        if (data.ok) {
            myComments = myComments.filter(c => c.id !== id);
            loadCommentsSection();
            loadGeneralDashboard();
            alert(t('dash.comments.deleted'));
        }
    } catch {}
}

function loadNewsCreateSection() {
    const subtitle  = document.getElementById('newsCreateSubtitle');
    const btnPublish = document.getElementById('btnPublishNews');
    const btnDraft   = document.getElementById('btnSaveDraft');

    if (currentUser.role === 'collaborator') {
        subtitle.textContent    = t('dash.news_create.subtitle_collab');
        btnPublish.textContent  = t('dash.news_create.publish_collab');
        btnDraft.style.display  = 'none';
    } else {
        subtitle.textContent    = t('dash.news_create.subtitle_writer');
        btnPublish.textContent  = t('dash.news_create.publish');
        btnDraft.style.display  = 'inline-block';
    }
}

function loadNewsManageSection() {
    const tableBody = document.getElementById('newsManageTableBody');
    if (!tableBody || (currentUser.role !== 'writer' && currentUser.role !== 'admin')) return;

    tableBody.innerHTML = '';

    if (newsData.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="5" style="text-align:center;padding:20px;color:#7f8c8d;">${t('dash.news_manage.empty')}</td></tr>`;
        return;
    }

    newsData.forEach(item => {
        const statusColors = { published: '#2ecc71', draft: '#f1c40f', pending: '#e67e22' };
        const statusLabels = {
            published: t('news.status.published'),
            draft:     t('news.status.draft'),
            pending:   t('news.status.pending')
        };
        const color  = statusColors[item.status] || '#95a5a6';
        const label  = statusLabels[item.status] || item.status;
        const badge  = `<span style="background:${color}22;color:${color};border:1px solid ${color}44;padding:4px 8px;border-radius:4px;font-size:0.75rem;">${label}</span>`;

        let actions = `<button class="btn-small danger btn-delete-news" data-id="${item.id}">${t('news.action.delete')}</button>`;
        if (item.status === 'pending' || item.status === 'draft') {
            actions = `<button class="btn-small btn-publish" data-id="${item.id}" style="background:rgba(46,204,113,0.15);color:#2ecc71;border-color:#2ecc7155;margin-right:5px;">${t('news.action.publish')}</button>` + actions;
        }

        const tr = document.createElement('tr');
        tr.style.borderBottom = '1px solid rgba(255,255,255,0.05)';
        tr.innerHTML = `
            <td style="padding:12px;font-weight:600;color:#fff;">${item.title}</td>
            <td style="padding:12px;color:#bdc3c7;">${item.author || 'Equipo'}</td>
            <td style="padding:12px;">${badge}</td>
            <td style="padding:12px;color:#7f8c8d;">${item.date}</td>
            <td style="padding:12px;">${actions}</td>
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
            if (confirm(t('dash.news.confirm_delete'))) {
                deleteNewsArticle(parseInt(this.getAttribute('data-id')));
            }
        });
    });
}

async function publishNewsArticle(id) {
    const formData = new FormData();
    formData.append('_method', 'PATCH');
    formData.append('id', id);
    formData.append('status', 'published');

    try {
        const res  = await fetch(API + 'noticias.php', { method: 'POST', body: formData });
        const data = await res.json();
        if (data.ok) {
            const article = newsData.find(n => n.id === id);
            if (article) article.status = 'published';
            loadNewsManageSection();
            loadGeneralDashboard();
            alert(t('dash.news.action_published'));
        }
    } catch {}
}

async function deleteNewsArticle(id) {
    const formData = new FormData();
    formData.append('_method', 'DELETE');
    formData.append('id', id);

    try {
        const res  = await fetch(API + 'noticias.php', { method: 'POST', body: formData });
        const data = await res.json();
        if (data.ok) {
            newsData = newsData.filter(n => n.id !== id);
            loadNewsManageSection();
            loadGeneralDashboard();
            alert(t('dash.news.deleted'));
        }
    } catch {}
}

function loadUsersManageSection() {
    const tableBody = document.getElementById('usersManageTableBody');
    if (!tableBody || currentUser.role !== 'admin') return;

    tableBody.innerHTML = '';

    usersData.forEach(u => {
        const options = ['subscriber', 'collaborator', 'writer', 'admin']
            .map(val => `<option value="${val}" ${u.role === val ? 'selected' : ''}>${getRoleDisplayName(val)}</option>`)
            .join('');

        const tr = document.createElement('tr');
        tr.style.borderBottom = '1px solid rgba(255,255,255,0.05)';
        tr.innerHTML = `
            <td style="padding:12px;font-weight:600;color:#fff;">${u.nombre_usuario}</td>
            <td style="padding:12px;color:#bdc3c7;">${u.email}</td>
            <td style="padding:12px;">
                <select class="filter-select select-user-role" data-id="${u.id}" style="background:rgba(10,10,25,0.9);border:1px solid rgba(0,212,255,0.25);color:#fff;padding:4px 8px;border-radius:4px;">
                    ${options}
                </select>
            </td>
            <td style="padding:12px;">
                <button class="btn-small danger btn-delete-user" data-id="${u.id}">${t('dash.users.suspend')}</button>
            </td>
        `;
        tableBody.appendChild(tr);
    });

    tableBody.querySelectorAll('.select-user-role').forEach(select => {
        select.addEventListener('change', function() {
            changeUserRole(parseInt(this.getAttribute('data-id')), this.value);
        });
    });

    tableBody.querySelectorAll('.btn-delete-user').forEach(btn => {
        btn.addEventListener('click', function() {
            const id = parseInt(this.getAttribute('data-id'));
            const user = usersData.find(u => u.id === id);
            if (confirm(`${t('dash.users.confirm_delete')} ${user?.email || id}?`)) {
                deleteUserAccount(id);
            }
        });
    });
}

async function changeUserRole(id, newRole) {
    const formData = new FormData();
    formData.append('_method', 'PATCH');
    formData.append('id', id);
    formData.append('role', newRole);

    try {
        const res  = await fetch(API + 'usuarios.php', { method: 'POST', body: formData });
        const data = await res.json();
        if (data.ok) {
            const user = usersData.find(u => u.id === id);
            if (user) user.role = newRole;
            loadReportsSection();
            alert(t('dash.users.role_updated'));
        }
    } catch {}
}

async function deleteUserAccount(id) {
    const formData = new FormData();
    formData.append('_method', 'DELETE');
    formData.append('id', id);

    try {
        const res  = await fetch(API + 'usuarios.php', { method: 'POST', body: formData });
        const data = await res.json();
        if (data.ok) {
            usersData = usersData.filter(u => u.id !== id);
            loadUsersManageSection();
            loadReportsSection();
            alert(t('dash.users.deleted'));
        }
    } catch {}
}

function loadReportsSection() {
    if (currentUser.role !== 'admin') return;

    const totalViews = newsData.reduce((acc, n) => acc + (n.views || 0), 0);
    document.getElementById('reportViews').textContent = totalViews;
    document.getElementById('reportUsers').textContent = usersData.length + 1; // +1 = el admin en sesión
    document.getElementById('reportNews').textContent  = newsData.length;

    const distList = document.getElementById('userDistributionList');
    distList.innerHTML = '';

    const roleCounts = { admin: 0, writer: 0, collaborator: 0, subscriber: 0 };
    usersData.forEach(u => { if (u.role in roleCounts) roleCounts[u.role]++; });
    roleCounts[currentUser.role] = (roleCounts[currentUser.role] || 0) + 1;

    const display = [
        { key: 'admin',        label: t('dash.reports.admins'),        color: '#ff0000', bg: 'rgba(255,0,0,0.1)' },
        { key: 'writer',       label: t('dash.reports.writers'),       color: '#f1c40f', bg: 'rgba(241,196,15,0.1)' },
        { key: 'collaborator', label: t('dash.reports.collaborators'), color: '#3498db', bg: 'rgba(52,152,219,0.1)' },
        { key: 'subscriber',   label: t('dash.reports.subscribers'),   color: '#2ecc71', bg: 'rgba(46,204,113,0.1)' },
    ];

    display.forEach(item => {
        const div = document.createElement('div');
        div.style.cssText = `padding:15px 25px;background:${item.bg};border:1px solid ${item.color}33;border-radius:8px;flex:1;min-width:130px;text-align:center;`;
        div.innerHTML = `<h4 style="color:${item.color};margin-bottom:5px;font-size:0.95rem;">${item.label}</h4><p style="font-size:1.8rem;font-weight:800;color:#fff;">${roleCounts[item.key] || 0}</p>`;
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
    document.getElementById('allowComments').checked     = settings.allowComments;
    document.getElementById('maintenanceMessage').value  = settings.maintenanceMessage;

    document.getElementById('btnSaveSettings').addEventListener('click', function() {
        settings.allowRegistration  = document.getElementById('allowRegistration').checked;
        settings.allowComments      = document.getElementById('allowComments').checked;
        settings.maintenanceMessage = document.getElementById('maintenanceMessage').value;
        localStorage.setItem('platformSettings', JSON.stringify(settings));
        alert(t('dash.settings.saved'));
    });
}

// ── Formularios ───────────────────────────────────────────────
function setupFormListeners() {
    const profileForm = document.getElementById('profileForm');
    if (profileForm) {
        profileForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const newName = document.getElementById('profileFormName').value.trim();
            const newBio  = document.getElementById('profileFormBio').value.trim();
            if (!newName) { alert(t('dash.profile.name_required')); return; }

            const initials = newName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
            currentUser = { ...currentUser, name: newName, bio: newBio, avatar: initials };
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            updateUserDisplay();
            injectNavbar();
            alert(t('dash.profile.saved'));
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

    const fileInput = document.getElementById('newsImageFile');
    if (fileInput) {
        fileInput.addEventListener('change', function() {
            const file     = this.files[0];
            const label    = document.getElementById('newsImageLabel');
            const labelTxt = document.getElementById('newsImageLabelText');
            const preview  = document.getElementById('newsImagePreview');
            const hint     = document.getElementById('newsImageHint');

            if (!file) {
                pendingImageBase64 = null;
                label.classList.remove('has-image');
                labelTxt.textContent  = 'Seleccionar imagen…';
                preview.style.display = 'none';
                hint.textContent      = 'Opcional · Máx. 1 MB · JPG, PNG, WebP';
                return;
            }

            if (file.size > 1024 * 1024) {
                alert(`La imagen no debe superar 1 MB. La tuya pesa ${(file.size / 1024 / 1024).toFixed(2)} MB.`);
                this.value = '';
                return;
            }

            const reader = new FileReader();
            reader.onload = function(ev) {
                pendingImageBase64             = ev.target.result;
                preview.style.backgroundImage = `url(${pendingImageBase64})`;
                preview.style.display          = 'block';
                label.classList.add('has-image');
                labelTxt.textContent = `${file.name} (${(file.size / 1024).toFixed(0)} KB)`;
                hint.textContent     = '✅ Imagen cargada correctamente.';
            };
            reader.readAsDataURL(file);
        });
    }
}

const DEFAULT_GRADIENTS_CREATE = [
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
];

async function submitNewsForm(action) {
    const titulo    = document.getElementById('newsTitle').value.trim();
    const categoria = document.getElementById('newsCategory').value;
    const resumen   = document.getElementById('newsExcerpt').value.trim();
    const contenido = document.getElementById('newsContent').value.trim();

    if (!titulo || !resumen || !contenido) {
        alert(t('dash.news_create.required_fields'));
        return;
    }

    let status = action === 'draft' ? 'draft' : (currentUser.role === 'collaborator' ? 'pending' : 'published');
    const imagen = pendingImageBase64 || DEFAULT_GRADIENTS_CREATE[newsData.length % DEFAULT_GRADIENTS_CREATE.length];

    const formData = new FormData();
    formData.append('titulo',    titulo);
    formData.append('resumen',   resumen);
    formData.append('contenido', contenido);
    formData.append('tipo',      'Noticia');
    formData.append('categoria', categoria);
    formData.append('status',    status);
    formData.append('imagen',    imagen);

    const btn = document.getElementById('btnPublishNews');
    btn.disabled = true;

    try {
        const res  = await fetch(API + 'noticias.php', { method: 'POST', body: formData });
        const data = await res.json();

        if (data.ok) {
            pendingImageBase64 = null;

            if (status === 'pending') {
                alert(t('dash.news_create.sent_for_review'));
            } else if (status === 'draft') {
                alert(t('dash.news_create.saved_draft'));
            } else {
                alert(`"${titulo}" ${t('dash.news.action_published')}.`);
            }

            document.getElementById('newsCreateForm').reset();
            ['newsImageLabel', 'newsImageLabelText', 'newsImagePreview', 'newsImageHint'].forEach(id => {
                const el = document.getElementById(id);
                if (!el) return;
                if (id === 'newsImageLabel')    el.classList.remove('has-image');
                if (id === 'newsImageLabelText') el.textContent  = 'Seleccionar imagen…';
                if (id === 'newsImagePreview')   el.style.display = 'none';
                if (id === 'newsImageHint')      el.textContent  = 'Opcional · Máx. 1 MB · JPG, PNG, WebP';
            });

            // Recargar noticias y volver al dashboard general
            const newsRes = await fetch(API + 'noticias.php?tipo=Noticia').catch(() => null);
            if (newsRes) {
                const newsDataFresh = await newsRes.json().catch(() => null);
                if (newsDataFresh?.ok) newsData = newsDataFresh.data;
            }

            loadNewsManageSection();
            loadGeneralDashboard();
            document.querySelector('[data-section="dashboard"]')?.click();
        } else {
            alert(data.message || 'Error al guardar.');
        }
    } catch {
        alert('Error de conexión. ¿Está XAMPP activo?');
    } finally {
        btn.disabled = false;
    }
}
