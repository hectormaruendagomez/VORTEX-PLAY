document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('contactForm');
    if (!form) return;

    const user = getCurrentUser();
    if (user) {
        const nameEl = document.getElementById('contactName');
        const emailEl = document.getElementById('contactEmail');
        if (nameEl && !nameEl.value) nameEl.value = user.name;
        if (emailEl && !emailEl.value) emailEl.value = user.email;
    }

    setupRealtimeContactValidation();

    form.addEventListener('submit', function(e) {
        e.preventDefault();
        if (validateContactForm()) {
            submitContactForm();
        }
    });
});

function validateContactForm() {
    clearContactErrors();

    const name = document.getElementById('contactName').value.trim();
    const email = document.getElementById('contactEmail').value.trim();
    const subject = document.getElementById('contactSubject').value.trim();
    const message = document.getElementById('contactMessage').value.trim();
    const terms = document.getElementById('contactTerms').checked;

    let valid = true;

    if (!name || name.length < 2) {
        showContactError('err-name', 'contactName', t('auth.error.name_short'));
        valid = false;
    }

    if (!email) {
        showContactError('err-email', 'contactEmail', t('auth.error.email_required'));
        valid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        showContactError('err-email', 'contactEmail', t('auth.error.email_invalid_ex'));
        valid = false;
    }

    if (!subject || subject.length < 5) {
        showContactError('err-subject', 'contactSubject', t('contact.error.subject_short'));
        valid = false;
    }

    if (!message || message.length < 20) {
        showContactError('err-message', 'contactMessage', `${t('contact.error.message_short')} (${message.length}/20).`);
        valid = false;
    }

    if (!terms) {
        showContactError('err-terms', null, t('contact.error.terms_required'));
        valid = false;
    }

    return valid;
}

function showContactError(errorId, inputId, message) {
    const errorEl = document.getElementById(errorId);
    if (errorEl) {
        errorEl.textContent = message;
        errorEl.style.display = 'block';
    }
    if (inputId) {
        const input = document.getElementById(inputId);
        if (input) input.classList.add('error');
    }
}

function clearContactErrors() {
    document.querySelectorAll('.contact-error').forEach(el => {
        el.textContent = '';
        el.style.display = 'none';
    });
    document.querySelectorAll('.contact-form .form-input').forEach(el => {
        el.classList.remove('error');
    });
}

function submitContactForm() {
    const btn = document.getElementById('btnContactSubmit');
    btn.disabled = true;
    btn.textContent = t('contact.sending');

    setTimeout(function() {
        document.getElementById('contactForm').style.display = 'none';
        const successEl = document.getElementById('contactSuccess');
        successEl.style.display = 'block';
        successEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 800);
}

function setupRealtimeContactValidation() {
    const fields = [
        { id: 'contactName', errId: 'err-name', minLen: 2, label: 'nombre' },
        { id: 'contactEmail', errId: 'err-email', isEmail: true },
        { id: 'contactSubject', errId: 'err-subject', minLen: 5, label: 'asunto' },
        { id: 'contactMessage', errId: 'err-message', minLen: 20, label: 'mensaje' },
    ];

    fields.forEach(({ id, errId, minLen, isEmail, label }) => {
        const input = document.getElementById(id);
        if (!input) return;

        input.addEventListener('blur', function() {
            const val = this.value.trim();
            const errEl = document.getElementById(errId);
            if (!val) {
                showContactError(errId, id, t('contact.error.field_required'));
            } else if (isEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
                showContactError(errId, id, t('auth.error.email_invalid'));
            } else if (minLen && val.length < minLen) {
                showContactError(errId, id, `${t('contact.error.min_chars_prefix')} ${minLen} ${t('contact.char_counter')} (${val.length}/${minLen}).`);
            } else {
                if (errEl) { errEl.textContent = ''; errEl.style.display = 'none'; }
                this.classList.remove('error');
                this.style.borderColor = 'rgba(46, 204, 113, 0.5)';
            }
        });

        input.addEventListener('input', function() {
            const val = this.value.trim();
            if (val) {
                this.classList.remove('error');
                const errEl = document.getElementById(errId);
                if (errEl) {
                    errEl.textContent = '';
                    errEl.style.display = 'none';
                }
            }
        });
    });

    const msgInput = document.getElementById('contactMessage');
    if (msgInput) {
        const counter = document.createElement('span');
        counter.style.cssText = 'font-size:0.75rem; color:#7f8c8d; display:block; text-align:right; margin-top:4px;';
        counter.textContent = t('contact.char_counter_init');
        msgInput.parentNode.insertBefore(counter, msgInput.nextElementSibling);

        msgInput.addEventListener('input', function() {
            const len = this.value.trim().length;
            const remaining = len < 20 ? ` (${t('contact.error.message_remaining')} ${20 - len})` : '';
            counter.textContent = `${len} ${t('contact.char_counter')}${remaining}`;
            counter.style.color = len >= 20 ? '#2ecc71' : '#7f8c8d';
        });
    }
}
