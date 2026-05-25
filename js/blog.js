document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.blog-post[data-blog-id]').forEach(article => {
        const blogId = article.getAttribute('data-blog-id');
        renderBlogComments(article, blogId);
        setupBlogCommentForm(article, blogId);
    });

    setupTagFilters();
    setupAuthorLinks();
    setupLikeButtons();
});

async function renderBlogComments(article, blogId) {
    const listEl = article.querySelector('.comments-list');
    if (!listEl) return;

    listEl.innerHTML = '<p style="color:#7f8c8d;text-align:center;padding:20px;">Cargando comentarios...</p>';

    let comments = [];
    try {
        const res  = await fetch(`${API}comentarios.php?id_contenido=${blogId}`);
        const data = await res.json();
        comments   = data.ok ? data.data : [];
    } catch {
        listEl.innerHTML = '<p style="color:#e74c3c;text-align:center;padding:20px;">No se pudieron cargar los comentarios.</p>';
        return;
    }

    const countEls = article.querySelectorAll('.comments-count, .post-comment-count');
    countEls.forEach(el => el.textContent = comments.length);

    listEl.innerHTML = '';

    if (comments.length === 0) {
        listEl.innerHTML = `<p style="color:#7f8c8d;text-align:center;padding:20px;">${t('comment.empty')}</p>`;
        return;
    }

    comments.forEach(c => {
        const initials = c.nombre_usuario.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
        const fecha    = new Date(c.fecha_comentario).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });

        const div = document.createElement('div');
        div.className = 'comment';
        div.innerHTML = `
            <div class="comment-author">
                <div class="comment-avatar">${initials}</div>
                <div class="author-info">
                    <strong>${c.nombre_usuario}</strong>
                    <small>${c.rol}</small>
                </div>
                <span class="comment-date">${fecha}</span>
            </div>
            <p class="comment-text">${c.texto}</p>
            <div class="comment-actions">
                <button class="btn-reply">${t('comment.reply')}</button>
            </div>
        `;

        div.querySelector('.btn-reply').addEventListener('click', function() {
            if (!getCurrentUser()) {
                alert(t('comment.login_reply'));
                return;
            }
            alert(t('comment.reply_wip'));
        });

        listEl.appendChild(div);
    });
}

async function setupBlogCommentForm(article, blogId) {
    const container = article.querySelector('.comment-form-container');
    if (!container) return;

    const user = getCurrentUser();
    if (!user) {
        container.innerHTML = `
            <div class="comment-form" style="text-align:center;padding:16px;border:1px solid rgba(0,212,255,0.2);background:rgba(0,212,255,0.03);border-radius:8px;margin-bottom:20px;">
                <p class="login-hint" style="margin:0;" data-i18n-html="comment.login_hint">${t('comment.login_hint') || ''}</p>
            </div>`;
        return;
    }

    container.innerHTML = `
        <form class="comment-form" style="margin-bottom:20px;">
            <textarea class="comment-input" placeholder="${t('comment.placeholder')}" required style="resize:vertical;"></textarea>
            <div class="comment-form-footer">
                <span style="font-size:0.85rem;color:#7f8c8d;">${t('comment.as')} <strong style="color:#00d4ff;">${user.name}</strong></span>
                <button type="submit" class="btn-comment">${t('comment.submit')}</button>
            </div>
        </form>`;

    container.querySelector('form').addEventListener('submit', async function(e) {
        e.preventDefault();
        const textarea = this.querySelector('.comment-input');
        const text     = textarea.value.trim();

        if (!text) return;
        if (text.length < 5) {
            alert(t('comment.min_chars'));
            return;
        }

        const btn = this.querySelector('.btn-comment');
        btn.disabled = true;

        try {
            const formData = new FormData();
            formData.append('id_contenido', blogId);
            formData.append('texto', text);

            const res  = await fetch(API + 'comentar.php', { method: 'POST', body: formData });
            const data = await res.json();

            if (data.ok) {
                textarea.value = '';
                renderBlogComments(article, blogId);
            } else {
                alert(data.message || 'Error al enviar el comentario.');
            }
        } catch {
            alert('Error de conexión. ¿Está XAMPP activo?');
        } finally {
            btn.disabled = false;
        }
    });
}

function setupTagFilters() {
    document.querySelectorAll('.tag').forEach(tag => {
        tag.style.cursor = 'pointer';
        tag.addEventListener('click', function(e) {
            e.preventDefault();
            this.classList.toggle('active');
        });
    });
}

function setupAuthorLinks() {
    document.querySelectorAll('.author-card').forEach(card => {
        card.style.cursor = 'pointer';
        card.addEventListener('click', function() {
            const name = this.querySelector('h4').textContent;
            alert(`${t('blog.author_posts')} ${name}`);
        });
    });
}

function setupLikeButtons() {
    document.querySelectorAll('[id^="likes-blog_"]').forEach(el => {
        el.style.cursor = 'pointer';
        el.addEventListener('click', function() {
            if (!getCurrentUser()) {
                alert(t('comment.login_react'));
                return;
            }
            const parts = this.textContent.split(' ');
            const count = (parseInt(parts[1]) || 0) + 1;
            this.textContent = `👍 ${count} ${t('blog.likes_label')}`;
        });
    });
}
