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

function renderBlogComments(article, blogId) {
    const commentsData = JSON.parse(localStorage.getItem('commentsData')) || {};
    const comments = commentsData[blogId] || [];

    const countEls = article.querySelectorAll('.comments-count, .post-comment-count');
    countEls.forEach(el => el.textContent = comments.length);

    const listEl = article.querySelector('.comments-list');
    listEl.innerHTML = '';

    if (comments.length === 0) {
        listEl.innerHTML = `<p style="color: #7f8c8d; text-align: center; padding: 20px;">Sin comentarios todavía. ¡Sé el primero!</p>`;
        return;
    }

    comments.forEach((c, index) => {
        const initials = c.author.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
        const div = document.createElement('div');
        div.className = 'comment';
        div.innerHTML = `
            <div class="comment-author">
                <div class="comment-avatar">${initials}</div>
                <div class="author-info">
                    <strong>${c.author}</strong>
                    <small>${getRoleDisplayName(c.role)}</small>
                </div>
                <span class="comment-date">${c.date}</span>
            </div>
            <p class="comment-text">${c.text}</p>
            <div class="comment-actions">
                <button class="btn-like" data-blog-id="${blogId}" data-index="${index}">❤️ <span>${c.likes || 0}</span></button>
                <button class="btn-reply">Responder</button>
            </div>
        `;
        listEl.appendChild(div);
    });

    listEl.querySelectorAll('.btn-like').forEach(btn => {
        btn.addEventListener('click', function() {
            if (!getCurrentUser()) {
                alert('Inicia sesión para reaccionar.');
                return;
            }
            addBlogLike(blogId, parseInt(this.getAttribute('data-index')));
            renderBlogComments(article, blogId);
        });
    });

    listEl.querySelectorAll('.btn-reply').forEach(btn => {
        btn.addEventListener('click', function() {
            if (!getCurrentUser()) {
                alert('Inicia sesión para responder.');
                return;
            }
            alert('Sistema de respuestas en desarrollo.');
        });
    });
}

function addBlogLike(blogId, index) {
    const commentsData = JSON.parse(localStorage.getItem('commentsData')) || {};
    const comments = commentsData[blogId] || [];
    if (comments[index]) {
        comments[index].likes = (comments[index].likes || 0) + 1;
        commentsData[blogId] = comments;
        localStorage.setItem('commentsData', JSON.stringify(commentsData));
    }
}

function setupBlogCommentForm(article, blogId) {
    const container = article.querySelector('.comment-form-container');
    const settings = JSON.parse(localStorage.getItem('platformSettings')) || { allowComments: true };

    if (!settings.allowComments) {
        container.innerHTML = `
            <div class="comment-form" style="text-align:center; padding:16px; border:1px solid rgba(231,76,60,0.3); background:rgba(231,76,60,0.05); border-radius:8px; margin-bottom:20px;">
                <p style="color:#e74c3c; font-weight:600; margin:0;">Los comentarios están desactivados temporalmente.</p>
            </div>
        `;
        return;
    }

    const user = getCurrentUser();
    if (!user) {
        container.innerHTML = `
            <div class="comment-form" style="text-align:center; padding:16px; border:1px solid rgba(0,212,255,0.2); background:rgba(0,212,255,0.03); border-radius:8px; margin-bottom:20px;">
                <p class="login-hint" style="margin:0;">Para comentar, <a href="auth.html">inicia sesión</a>.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = `
        <form class="comment-form" style="margin-bottom:20px;">
            <textarea class="comment-input" placeholder="Escribe un comentario..." required style="resize:vertical;"></textarea>
            <div class="comment-form-footer">
                <span style="font-size:0.85rem; color:#7f8c8d;">Comentando como <strong style="color:#00d4ff;">${user.name}</strong></span>
                <button type="submit" class="btn-comment">Publicar</button>
            </div>
        </form>
    `;

    container.querySelector('form').addEventListener('submit', function(e) {
        e.preventDefault();
        const textarea = this.querySelector('.comment-input');
        const text = textarea.value.trim();

        if (!text) return;
        if (text.length < 5) {
            alert('El comentario debe tener al menos 5 caracteres.');
            return;
        }

        const commentsData = JSON.parse(localStorage.getItem('commentsData')) || {};
        if (!commentsData[blogId]) commentsData[blogId] = [];

        commentsData[blogId].push({
            author: user.name,
            role: user.role,
            email: user.email,
            date: 'hace un momento',
            text,
            likes: 0
        });

        localStorage.setItem('commentsData', JSON.stringify(commentsData));
        textarea.value = '';
        renderBlogComments(article, blogId);
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
            const target = document.querySelector(`.post-author`);
            if (target) target.scrollIntoView({ behavior: 'smooth' });
            alert(`Posts del autor: ${name}`);
        });
    });
}

function setupLikeButtons() {
    document.querySelectorAll('[id^="likes-blog_"]').forEach(el => {
        el.style.cursor = 'pointer';
        el.addEventListener('click', function() {
            if (!getCurrentUser()) {
                alert('Inicia sesión para reaccionar.');
                return;
            }
            const parts = this.textContent.split(' ');
            const count = (parseInt(parts[1]) || 0) + 1;
            this.textContent = `👍 ${count} Me gusta`;
        });
    });
}
